import Foundation
import WebKit

let liveBase = URL(string: "https://63-250-44-212.sslip.io")!
let liveGameURL = URL(string: "https://63-250-44-212.sslip.io/3d/")!
let bundledScheme = "bramblewick"
let bundledGameURL = URL(string: "bramblewick://app/3d/index.html")!

/// Where the WebView opens the game.
/// Automatic (no Settings value and no launch argument) compares badge versions.
/// `-GameSource Live` or `-GameSource Bundled`, and the iOS Settings value, win over that comparison.
/// Keep the decision in step with Tests/game-source-choice.test.mjs.
enum GameSource: String { case bundled = "Bundled", live = "Live"
    static let defaultsKey = "GameSource"

    /// A choice the person made. Nil means compare the bundled badge with the live page.
    static var explicit: GameSource? {
        let args = ProcessInfo.processInfo.arguments
        if let i = args.firstIndex(of: "-GameSource"), i + 1 < args.count,
           let value = GameSource(rawValue: args[i + 1]) {
            return value
        }
        if let raw = UserDefaults.standard.string(forKey: defaultsKey),
           let value = GameSource(rawValue: raw) {
            return value
        }
        return nil
    }

    /// Fallback used only before the version check finishes, and by older call sites.
    static var current: GameSource { explicit ?? .live }
}

/// Serves the WebGame folder from the app bundle at bramblewick://app/...
/// and forwards /api/*, /mp/* and /health to the live server.
final class BundleSchemeHandler: NSObject, WKURLSchemeHandler {
    let root = Bundle.main.resourceURL!.appendingPathComponent("WebGame")
    private var tasks = Set<ObjectIdentifier>()
    private let lock = NSLock()

    static var hasBundle: Bool {
        FileManager.default.fileExists(atPath: Bundle.main.resourceURL!.appendingPathComponent("WebGame/3d/index.html").path)
    }

    static func bundledHTML() -> String? {
        let local = Bundle.main.resourceURL?.appendingPathComponent("WebGame/3d/index.html")
        guard let local, let data = try? Data(contentsOf: local) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    static func bundledVersion() -> Int? {
        guard let html = bundledHTML() else { return nil }
        return UpdateCheck.gameVersion(in: html)
    }

    func webView(_ w: WKWebView, start t: WKURLSchemeTask) {
        lock.lock(); tasks.insert(ObjectIdentifier(t)); lock.unlock()
        guard let url = t.request.url else { return fail(t, 400) }
        let path = url.path
        if path.hasPrefix("/api/") || path.hasPrefix("/mp/") || path == "/health" { return proxy(t, url) }
        var rel = path.removingPercentEncoding ?? path
        if rel.hasSuffix("/") { rel += "index.html" }
        let file = root.appendingPathComponent(rel).standardizedFileURL
        guard file.path.hasPrefix(root.standardizedFileURL.path),
              let data = try? Data(contentsOf: file) else { return fail(t, 404) }
        let r = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1",
                                headerFields: ["Content-Type": mime(file.pathExtension),
                                               "Content-Length": "\(data.count)",
                                               "Cache-Control": "no-cache"])!
        finish(t, r, data)
    }
    func webView(_ w: WKWebView, stop t: WKURLSchemeTask) {
        lock.lock(); tasks.remove(ObjectIdentifier(t)); lock.unlock()
    }

    private func proxy(_ t: WKURLSchemeTask, _ url: URL) {
        var c = URLComponents(url: liveBase, resolvingAgainstBaseURL: false)!
        c.path = url.path; c.query = url.query
        var req = URLRequest(url: c.url!, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 30)
        req.httpMethod = t.request.httpMethod ?? "GET"
        req.httpBody = t.request.httpBody
        for (k, v) in t.request.allHTTPHeaderFields ?? [:] where k.lowercased() != "origin" && k.lowercased() != "host" {
            req.setValue(v, forHTTPHeaderField: k)
        }
        URLSession.shared.dataTask(with: req) { [weak self] data, resp, err in
            guard let self else { return }
            guard let h = resp as? HTTPURLResponse else { return self.fail(t, 502) }
            var hdr: [String: String] = [:]
            for (k, v) in h.allHeaderFields { if let k = k as? String, let v = v as? String,
                !["content-encoding", "content-length", "transfer-encoding"].contains(k.lowercased()) { hdr[k] = v } }
            let r = HTTPURLResponse(url: url, statusCode: h.statusCode, httpVersion: "HTTP/1.1", headerFields: hdr)!
            self.finish(t, r, data ?? Data())
        }.resume()
    }
    private func alive(_ t: WKURLSchemeTask) -> Bool { lock.lock(); defer { lock.unlock() }; return tasks.contains(ObjectIdentifier(t)) }
    private func finish(_ t: WKURLSchemeTask, _ r: URLResponse, _ d: Data) {
        DispatchQueue.main.async {
            guard self.alive(t) else { return }
            t.didReceive(r); t.didReceive(d); t.didFinish()
            self.lock.lock(); self.tasks.remove(ObjectIdentifier(t)); self.lock.unlock()
        }
    }
    private func fail(_ t: WKURLSchemeTask, _ code: Int) {
        let r = HTTPURLResponse(url: t.request.url ?? bundledGameURL, statusCode: code, httpVersion: "HTTP/1.1", headerFields: ["Content-Type": "text/plain"])!
        finish(t, r, Data("error \(code)".utf8))
    }
    private func mime(_ e: String) -> String {
        switch e.lowercased() {
        case "html": return "text/html; charset=utf-8"
        case "js", "mjs": return "text/javascript; charset=utf-8"
        case "json": return "application/json"
        case "css": return "text/css"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "svg": return "image/svg+xml"
        case "webp": return "image/webp"
        case "woff2": return "font/woff2"
        case "glb": return "model/gltf-binary"
        case "gltf": return "model/gltf+json"
        case "mp3": return "audio/mpeg"
        case "ogg": return "audio/ogg"
        case "wav": return "audio/wav"
        case "md", "txt": return "text/plain; charset=utf-8"
        default: return "application/octet-stream"
        }
    }
}

/// Compares the bundled 3d/index.html badge with the live page.
enum UpdateCheck {
    /// Badge first (`v87 · Briarhaven`), then the document title. Same rules as the JS test.
    static func gameVersion(in html: String) -> Int? {
        let patterns = [
            #"id="mbadge"[^>]*>\s*v(\d+)"#,
            #"<title>[^<]*\bv(\d+)\b"#
        ]
        for pattern in patterns {
            guard let re = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else { continue }
            let range = NSRange(html.startIndex..., in: html)
            guard let match = re.firstMatch(in: html, options: [], range: range),
                  match.numberOfRanges > 1,
                  let r = Range(match.range(at: 1), in: html),
                  let value = Int(html[r]) else { continue }
            return value
        }
        return nil
    }

    /// Higher badge wins. Equal versions stay live. A dead live page uses the bundle.
    static func choose(explicit: GameSource?, bundled: Int?, liveReached: Bool, live: Int?) -> (GameSource, String) {
        if let explicit {
            if explicit == .bundled && bundled == nil {
                return (.live, "Bundled was requested, but this build has no game copy")
            }
            let note = explicit == .live
                ? "Live was chosen in Settings or with -GameSource"
                : "The copy in the app was chosen in Settings or with -GameSource"
            return (explicit, note)
        }
        guard let bundled else { return (.live, "This build has no bundled game") }
        if !liveReached { return (.bundled, "Live page did not load, so the copy in the app is open") }
        guard let live else { return (.live, "Live page is open") }
        if bundled > live { return (.bundled, "App copy v\(bundled) is newer than live v\(live)") }
        return (.live, "Live v\(live) is current")
    }

    static func resolve(_ done: @escaping (GameSource, String) -> Void) {
        let bundled = BundleSchemeHandler.bundledVersion()
        if let explicit = GameSource.explicit {
            let choice = choose(explicit: explicit, bundled: bundled, liveReached: true, live: nil)
            DispatchQueue.main.async { done(choice.0, choice.1) }
            return
        }
        guard bundled != nil else {
            DispatchQueue.main.async { done(.live, "This build has no bundled game") }
            return
        }
        var req = URLRequest(url: liveGameURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 8)
        req.httpMethod = "GET"
        URLSession.shared.dataTask(with: req) { data, response, _ in
            let ok = (response as? HTTPURLResponse)?.statusCode == 200
            let html = (ok && data != nil) ? String(data: data!, encoding: .utf8) : nil
            let live = html.flatMap { gameVersion(in: $0) }
            let choice = choose(explicit: nil, bundled: bundled, liveReached: ok, live: live)
            DispatchQueue.main.async { done(choice.0, choice.1) }
        }.resume()
    }

    static func liveIsNewer(_ done: @escaping (Bool) -> Void) {
        guard let mine = BundleSchemeHandler.bundledVersion() else { done(false); return }
        var req = URLRequest(url: liveGameURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 8)
        req.httpMethod = "GET"
        URLSession.shared.dataTask(with: req) { data, response, _ in
            let ok = (response as? HTTPURLResponse)?.statusCode == 200
            let live = (ok && data != nil) ? String(data: data!, encoding: .utf8).flatMap(gameVersion(in:)) : nil
            DispatchQueue.main.async { done(live != nil && live! > mine) }
        }.resume()
    }
}
