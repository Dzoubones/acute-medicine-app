import SwiftUI
import WatchConnectivity
import WatchKit

@main
struct AMTWatchApp: App {
    @StateObject private var model = WatchModel()
    var body: some Scene { WindowGroup { WatchDashboard().environmentObject(model) } }
}

final class WatchModel: NSObject, ObservableObject, WCSessionDelegate {
    @Published var favourites: [String] = []
    @Published var timerTitle = "Review timer"
    @Published var target: Date?
    @Published var remaining: TimeInterval = 0
    @Published var running = false

    override init() {
        super.init()
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    func start(minutes: Double = 10) { remaining = minutes * 60; target = Date().addingTimeInterval(remaining); running = true }
    func pause() { remaining = max(0, target?.timeIntervalSinceNow ?? remaining); target = nil; running = false }
    func stop() { remaining = 0; target = nil; running = false }
    func tick() { if running { remaining = max(0, target?.timeIntervalSinceNow ?? 0); if remaining == 0 { running = false; WKInterfaceDevice.current().play(.notification) } } }
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) { DispatchQueue.main.async { self.favourites = applicationContext["favourites"] as? [String] ?? [] } }
}

struct WatchDashboard: View {
    @EnvironmentObject var model: WatchModel
    var body: some View {
        NavigationStack {
            List {
                Section("Emergencies") { Text("Cardiac arrest"); Text("Anaphylaxis"); Text("Suspected sepsis") }
                Section("Active timer") {
                    TimelineView(.periodic(from: .now, by: 1)) { _ in Text(format(model.remaining)).monospacedDigit().onAppear { model.tick() } }
                    if model.running { Button("Pause") { model.pause() } } else { Button("Start 10-minute review") { model.start() } }
                    Button("Stop", role: .destructive) { model.stop() }
                }
                if !model.favourites.isEmpty { Section("Favourites") { ForEach(model.favourites.prefix(4), id: \.self) { Text($0) } } }
            }.navigationTitle("Acute Take")
        }
    }
    private func format(_ value: TimeInterval) -> String { String(format: "%02d:%02d", Int(value) / 60, Int(value) % 60) }
}
