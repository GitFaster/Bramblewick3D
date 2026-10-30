import Foundation
import WebKit

/// One-time copy of the login session (bwl.token + bwl.user ONLY, never save keys)
/// from the live https origin into the bundled bramblewick://app origin.
final class SessionMigrator: NSObject, WKNavigationDelegate {
    static let doneKey = "BWSessionMigrated.v1"
    private var probe: WKWebView?
    private var done: ((String?, String?) -> Void)?

    func run(_ done: @escaping (String?, String?) -> Void) {
        if UserDefaults.standard.bool(forKey: Self.doneKey) { return done(nil, nil) }
        self.done = done
        let c = WKWebViewConfiguration(); c.websiteDataStore = .default()
        let w = WKWebView(frame: CGRect(x: 0, y: 0, width: 10, height: 10), configuration: c)
        w.navigationDelegate = self; probe = w
        // /health is a tiny JSON page on the live origin: no game code runs, so nothing can save.
        w.load(URLRequest(url: liveBase.appendingPathComponent("health"), timeoutInterval: 8))
        DispatchQueue.main.asyncAfter(deadline: .now() + 10) { [weak self] in self?.finish(nil, nil, mark: false) }
    }
    func webView(_ w: WKWebView, didFinish n: WKNavigation!) {
        w.evaluateJavaScript("JSON.stringify([localStorage.getItem('bwl.token'),localStorage.getItem('bwl.user')])") { [weak self] r, _ in
            guard let s = r as? String, let d = s.data(using: .utf8),
                  let a = try? JSONSerialization.jsonObject(with: d) as? [Any?],
                  let tok = a.first as? String, !tok.isEmpty else { self?.finish(nil, nil, mark: true); return }
            let user = a.count > 1 ? a[1] as? String : nil
            // Only migrate a token the server still accepts.
            var req = URLRequest(url: liveBase.appendingPathComponent("api/me"), timeoutInterval: 8)
            req.setValue("Bearer " + tok, forHTTPHeaderField: "Authorization")
            URLSession.shared.dataTask(with: req) { _, resp, _ in
                let ok = (resp as? HTTPURLResponse)?.statusCode == 200
                DispatchQueue.main.async { self?.finish(ok ? tok : nil, ok ? user : nil, mark: ok || resp != nil) }
            }.resume()
        }
    }
    func webView(_ w: WKWebView, didFail n: WKNavigation!, withError e: Error) { finish(nil, nil, mark: false) }
    func webView(_ w: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) { finish(nil, nil, mark: false) }
    private func finish(_ t: String?, _ u: String?, mark: Bool) {
        guard let d = done else { return }; done = nil; probe = nil
        if mark { UserDefaults.standard.set(true, forKey: Self.doneKey) }
        NSLog("Bramblewick session migration: %@", t == nil ? "nothing to copy" : "copied login for \(u ?? "?")")
        d(t, u)
    }

    /// Script that sets the session keys in the bundled origin only if it has no token yet.
    static func injectScript(token: String, user: String?) -> WKUserScript {
        func q(_ s: String) -> String { String(data: try! JSONSerialization.data(withJSONObject: [s]), encoding: .utf8)!.dropFirst().dropLast().description }
        var js = "try{if(location.protocol==='\(bundledScheme):'&&!localStorage.getItem('bwl.token')){localStorage.setItem('bwl.token',\(q(token)));"
        if let u = user { js += "localStorage.setItem('bwl.user',\(q(u)));" }
        js += "}}catch(e){}"
        return WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    }
}

/// Launch arg: -BWSelfTest YES  -> registers a throwaway account via the in-app /api passthrough
/// (fetch only; never touches localStorage), then writes results to Documents/selftest.txt.
enum SelfTest {
    static var enabled: Bool { UserDefaults.standard.bool(forKey: "BWSelfTest") }
    static let js = """
    (async()=>{const out=[];const u='bwt_'+Math.random().toString(36).slice(2,8);
    const p=Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,'0')).join('');
    const j=async(r)=>{try{return await r.json()}catch(e){return {}}};
    try{let r=await fetch('/health');out.push('health '+r.status);
    r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
    let d=await j(r);out.push('register '+r.status+' '+(d.error||'')+' user='+(d.username||'-')+' token='+(d.token?'yes':'no'));
    r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
    d=await j(r);out.push('login '+r.status+' token='+(d.token?'yes':'no'));
    if(d.token){r=await fetch('/api/me',{headers:{Authorization:'Bearer '+d.token}});let m=await j(r);out.push('me '+r.status+' '+(m.username||JSON.stringify(m).slice(0,60)));
    r=await fetch('/api/logout',{method:'POST',headers:{Authorization:'Bearer '+d.token}});out.push('logout '+r.status);}
    }catch(e){out.push('ERR '+e)}
    out.push('origin '+location.origin+' hasToken '+!!localStorage.getItem('bwl.token'));
    window.webkit.messageHandlers.bwselftest.postMessage(out.join('\\n'));})();
    """
}
final class SelfTestSink: NSObject, WKScriptMessageHandler {
    func userContentController(_ u: WKUserContentController, didReceive m: WKScriptMessage) {
        let s = "\(Date())\n\(m.body)\n"
        let f = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("selftest.txt")
        try? s.write(to: f, atomically: true, encoding: .utf8); NSLog("BWSelfTest %@", s)
    }
}
