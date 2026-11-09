import SwiftUI
import WebKit
import SafariServices

struct SafariView: UIViewControllerRepresentable {
    let url: URL
    func makeUIViewController(context: Context) -> SFSafariViewController { SFSafariViewController(url: url) }
    func updateUIViewController(_ vc: SFSafariViewController, context: Context) {}
}

let bg = Color(red: 16/255, green: 22/255, blue: 18/255)

@main
struct Bramblewick3DApp: App {
    var body: some Scene { WindowGroup { RootView().preferredColorScheme(.dark) } }
}

enum LoadState: Equatable { case loading, ready, failed(String) }

final class GameModel: NSObject, ObservableObject, WKNavigationDelegate {
    @Published var state: LoadState = .loading
    @Published var progress: Double = 0
    @Published var source: GameSource = GameSource.current
    @Published var updateAvailable = false
    @Published var sourceNote = ""
    private var triedFallback = false
    private var triedBundle = false
    private var openingExplicitLive = false
    private let migrator = SessionMigrator()
    private var migrated = false
    let web: WKWebView
    private var obs: NSKeyValueObservation?

    override init() {
        let c = WKWebViewConfiguration()
        c.allowsInlineMediaPlayback = true
        c.mediaTypesRequiringUserActionForPlayback = []
        c.websiteDataStore = .default()
        c.defaultWebpagePreferences.allowsContentJavaScript = true
        c.setURLSchemeHandler(BundleSchemeHandler(), forURLScheme: bundledScheme)
        if SelfTest.enabled { c.userContentController.add(SelfTestSink(), name: "bwselftest") }
        // Block page zoom (pinch belongs to the game).
        let js = """
        (function(){var m=document.querySelector('meta[name=viewport]');
        var v='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
        if(!m){m=document.createElement('meta');m.name='viewport';(document.head||document.documentElement).appendChild(m);}
        else if(m.content.indexOf('viewport-fit')<0){v=m.content+',viewport-fit=cover,user-scalable=no,maximum-scale=1';}
        m.content=v;document.addEventListener('gesturestart',function(e){e.preventDefault()},{passive:false});})();
        """
        c.userContentController.addUserScript(WKUserScript(source: js, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        web = WKWebView(frame: .zero, configuration: c)
        super.init()
        web.navigationDelegate = self
        web.isOpaque = false
        web.backgroundColor = UIColor(red: 16/255, green: 22/255, blue: 18/255, alpha: 1)
        web.allowsBackForwardNavigationGestures = false
        web.allowsLinkPreview = false
        let sv = web.scrollView
        sv.bounces = false; sv.alwaysBounceVertical = false; sv.alwaysBounceHorizontal = false
        sv.isScrollEnabled = false
        sv.minimumZoomScale = 1; sv.maximumZoomScale = 1
        sv.pinchGestureRecognizer?.isEnabled = false
        sv.contentInsetAdjustmentBehavior = .never
        sv.delegate = NoZoom.shared
        obs = web.observe(\.estimatedProgress) { [weak self] w, _ in
            DispatchQueue.main.async { self?.progress = w.estimatedProgress }
        }
        load()
    }

    func load() { begin(forced: nil) }
    func useLive() { updateAvailable = false; begin(forced: .live) }

    /// `forced` is the in-app Play live button. Settings and `-GameSource` are read inside UpdateCheck.
    private func begin(forced: GameSource?) {
        state = .loading
        progress = 0
        openingExplicitLive = forced == .live || GameSource.explicit == .live
        if let forced {
            open(forced, note: forced == .live ? "Live was requested" : "The copy in the app was requested")
            return
        }
        UpdateCheck.resolve { [weak self] choice, note in
            self?.open(choice, note: note)
        }
    }

    private func open(_ choice: GameSource, note: String) {
        sourceNote = note
        NSLog("Bramblewick source choice: %@ (%@)", choice.rawValue, note)
        if choice == .bundled && BundleSchemeHandler.hasBundle {
            source = .bundled
            if !migrated {
                migrated = true
                migrator.run { [weak self] tok, user in
                    guard let self else { return }
                    if let tok { self.web.configuration.userContentController.addUserScript(SessionMigrator.injectScript(token: tok, user: user)) }
                    self.open(.bundled, note: note)
                }
                return
            }
            web.load(URLRequest(url: bundledGameURL))
            UpdateCheck.liveIsNewer { [weak self] newer in self?.updateAvailable = newer }
        } else {
            source = .live
            web.load(URLRequest(url: liveGameURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 30))
        }
    }

    private func fallbackToLive() -> Bool {
        guard source == .bundled, !triedFallback, GameSource.explicit != .bundled else { return false }
        triedFallback = true
        open(.live, note: "Bundled copy failed, so the live game is open")
        return true
    }

    private func fallbackToBundled() -> Bool {
        guard source == .live, !triedBundle, !openingExplicitLive, BundleSchemeHandler.hasBundle else { return false }
        triedBundle = true
        open(.bundled, note: "Live page failed, so the copy in the app is open")
        return true
    }

    func webView(_ w: WKWebView, decidePolicyFor r: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        if r.isForMainFrame, let h = r.response as? HTTPURLResponse, !(200..<400).contains(h.statusCode) {
            if source == .live, fallbackToBundled() { decisionHandler(.cancel); return }
            if fallbackToLive() { decisionHandler(.cancel); return }
            state = .failed("The server returned HTTP \(h.statusCode).")
            decisionHandler(.cancel); return
        }
        decisionHandler(.allow)
    }
    func webView(_ w: WKWebView, didFinish n: WKNavigation!) { if state == .loading { state = .ready }; sourceBadge() }
    private func sourceBadge() {
        let b = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "?"
        let isBundled = web.url?.scheme == bundledScheme
        let game = BundleSchemeHandler.bundledVersion().map { "v\($0)" } ?? "v?"
        let label = isBundled ? "App copy \(game) · build \(b)" : "Live server · build \(b)"
        NSLog("Bramblewick game source: %@ url=%@", label, web.url?.absoluteString ?? "-")
        let js = "(function(){var d=document.createElement('div');d.id='bw-src-badge';d.textContent='\(label)';d.style.cssText='position:fixed;left:50%;top:env(safe-area-inset-top,8px);transform:translateX(-50%);z-index:2147483647;background:rgba(0,0,0,.75);color:#7f7;font:bold 12px -apple-system,sans-serif;padding:4px 10px;border-radius:10px;pointer-events:none';document.body.appendChild(d);setTimeout(function(){d.remove()},3000);})();"
        web.evaluateJavaScript(js, completionHandler: nil)
        if SelfTest.enabled && isBundled { web.evaluateJavaScript(SelfTest.js, completionHandler: nil) }
    }
    func webView(_ w: WKWebView, didFail n: WKNavigation!, withError e: Error) { fail(e) }
    func webView(_ w: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) { fail(e) }
    func webViewWebContentProcessDidTerminate(_ w: WKWebView) { load() }
    private func fail(_ e: Error) {
        let ns = e as NSError
        if ns.domain == NSURLErrorDomain && ns.code == NSURLErrorCancelled { return }
        if case .failed = state { return }
        if source == .live, fallbackToBundled() { return }
        if fallbackToLive() { return }
        let offline = ns.domain == NSURLErrorDomain && [NSURLErrorNotConnectedToInternet, NSURLErrorNetworkConnectionLost, NSURLErrorTimedOut].contains(ns.code)
        state = .failed(offline ? "No network connection. Check Wi-Fi or cellular and try again." : ns.localizedDescription)
    }
}

final class NoZoom: NSObject, UIScrollViewDelegate {
    static let shared = NoZoom()
    func viewForZooming(in s: UIScrollView) -> UIView? { nil }
}

struct WebHost: UIViewRepresentable {
    let web: WKWebView
    func makeUIView(context: Context) -> WKWebView { web }
    func updateUIView(_ v: WKWebView, context: Context) {}
}

struct RootView: View {
    @StateObject var m = GameModel()
    @State private var isPulsing = false
    @State private var showTarnish = false

    private let accent = Color(red: 0.45, green: 0.92, blue: 0.55)

    var body: some View {
        ZStack {
            gameBackdrop

            WebHost(web: m.web)
                .ignoresSafeArea()
                .opacity(m.state == .ready ? 1 : 0.01)

            switch m.state {
            case .loading:
                loadingOverlay
            case .failed(let msg):
                failureOverlay(message: msg)
            case .ready:
                EmptyView()
            }
            if m.updateAvailable && m.state == .ready {
                VStack { HStack(spacing: 8) {
                    Text("Newer game online").font(.caption.bold()).foregroundStyle(.white)
                    Button("Play live") { m.useLive() }.font(.caption.bold()).buttonStyle(.borderedProminent).tint(accent).foregroundStyle(.black)
                    Button { m.updateAvailable = false } label: { Image(systemName: "xmark") }.font(.caption).foregroundStyle(.white)
                }.padding(.horizontal, 10).padding(.vertical, 5).background(.black.opacity(0.65), in: Capsule())
                    Spacer() }.padding(.top, 50)
            }
            VStack { HStack { Menu {
                Button { m.useLive() } label: { Label("Bramblewick", systemImage: "leaf") }
                Button { DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { showTarnish = true } } label: { Label("Tarnish client (Safari)", systemImage: "safari") }
            } label: { Image(systemName: "square.grid.2x2").font(.system(size: 14, weight: .bold)).foregroundStyle(.white.opacity(0.8)).padding(8).background(.black.opacity(0.45), in: Circle()) }
                Spacer() }; Spacer() }.padding(.top, 6).padding(.leading, 6)
        }
        .fullScreenCover(isPresented: $showTarnish) { SafariView(url: liveBase.appendingPathComponent("classic/")).ignoresSafeArea() }
        .statusBarHidden(m.state == .ready)
        .onAppear {
            isPulsing = true
        }
    }

    private var gameBackdrop: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.04, green: 0.08, blue: 0.07), bg, Color.black],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            Circle()
                .fill(accent.opacity(0.18))
                .frame(width: 260)
                .blur(radius: 55)
                .offset(x: -130, y: -250)

            Circle()
                .fill(Color.teal.opacity(0.16))
                .frame(width: 320)
                .blur(radius: 70)
                .offset(x: 170, y: 280)

            GridPattern()
                .stroke(Color.white.opacity(0.035), lineWidth: 1)
                .ignoresSafeArea()
        }
    }

    private var loadingOverlay: some View {
        VStack(spacing: 0) {
            Image(systemName: "sparkles")
                .font(.system(size: 26, weight: .semibold))
                .foregroundStyle(accent)
                .frame(width: 64, height: 64)
                .background(accent.opacity(0.12), in: Circle())
                .overlay(Circle().stroke(accent.opacity(0.35), lineWidth: 1))
                .scaleEffect(isPulsing ? 1.08 : 0.94)
                .shadow(color: accent.opacity(0.35), radius: 22)

            Text("BRAMBLEWICK")
                .font(.system(size: 28, weight: .black, design: .rounded))
                .tracking(4)
                .foregroundStyle(.white)
                .padding(.top, 22)

            Text("ENTERING THE GROVE")
                .font(.system(size: 11, weight: .bold, design: .rounded))
                .tracking(2.2)
                .foregroundStyle(.white.opacity(0.5))
                .padding(.top, 7)

            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("Preparing your world")
                    Spacer()
                    Text("\(Int((m.progress * 100).rounded()))%")
                        .monospacedDigit()
                        .foregroundStyle(accent)
                }
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.78))

                ProgressView(value: m.progress)
                    .tint(accent)
                    .frame(height: 8)
                    .background(Color.white.opacity(0.1), in: Capsule())
                    .clipShape(Capsule())
            }
            .padding(20)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20))
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Color.white.opacity(0.12), lineWidth: 1)
            )
            .padding(.top, 30)
        }
        .padding(.horizontal, 28)
        .frame(maxWidth: 390)
    }

    private func failureOverlay(message: String) -> some View {
        VStack(spacing: 18) {
            Image(systemName: "leaf.circle.fill")
                .font(.system(size: 44))
                .foregroundStyle(.orange)
                .scaleEffect(isPulsing ? 1.08 : 0.94)
                .animation(.easeInOut(duration: 1.8).repeatForever(autoreverses: true), value: isPulsing)

            Text("The grove is out of reach")
                .font(.system(size: 23, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.62))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 8)

            Button {
                m.load()
            } label: {
                Label("Try Again", systemImage: "arrow.clockwise")
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 13)
            }
            .buttonStyle(.borderedProminent)
            .tint(accent)
            .foregroundStyle(.black)
        }
        .padding(28)
        .frame(maxWidth: 390)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 26))
        .overlay(
            RoundedRectangle(cornerRadius: 26)
                .stroke(Color.white.opacity(0.14), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.35), radius: 30, y: 16)
        .padding(.horizontal, 24)
    }
}

private struct GridPattern: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let spacing: CGFloat = 32

        stride(from: rect.minX, through: rect.maxX, by: spacing).forEach {
            path.move(to: CGPoint(x: $0, y: rect.minY))
            path.addLine(to: CGPoint(x: $0, y: rect.maxY))
        }
        stride(from: rect.minY, through: rect.maxY, by: spacing).forEach {
            path.move(to: CGPoint(x: rect.minX, y: $0))
            path.addLine(to: CGPoint(x: rect.maxX, y: $0))
        }
        return path
    }
}
