import Foundation
import WebKit

let liveBase = URL(string: "https://104-207-83-247.sslip.io")!
let liveGameURL = URL(string: "https://104-207-83-247.sslip.io/3d/")!
let bundledScheme = "bramblewick"
let bundledGameURL = URL(string: "bramblewick://app/3d/index.html")!

/// "Bundled" (default) or "Live". Set in iOS Settings > Bramblewick 3D, or launch arg: -GameSource Live
enum GameSource: String { case bundled = "Bundled", live = "Live"
    /// One game: always open the live /3d/ game (the bundled copy goes stale between Xcode builds).
    static var current: GameSource { .live }
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

/// Compares the bundled 3d/index.html with the live one (they carry ?v= numbers).
enum UpdateCheck {
    static func liveIsNewer(_ done: @escaping (Bool) -> Void) {
        let local = Bundle.main.resourceURL!.appendingPathComponent("WebGame/3d/index.html")
        guard let mine = try? Data(contentsOf: local) else { return done(false) }
        var req = URLRequest(url: liveGameURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 10)
        req.httpMethod = "GET"
        URLSession.shared.dataTask(with: req) { d, r, _ in
            let ok = (r as? HTTPURLResponse)?.statusCode == 200
            DispatchQueue.main.async { done(ok && d != nil && d != mine) }
        }.resume()
    }
}
