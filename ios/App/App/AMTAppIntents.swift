import AppIntents
import Foundation

@available(iOS 16.0, *)
private protocol AMTRouteIntent: AppIntent {}

@available(iOS 16.0, *)
private func storeRoute(_ route: String) {
    UserDefaults(suiteName: "group.uk.acutemedicine.acutemedicaltake.shared")?.set(route, forKey: "pendingRoute")
}

@available(iOS 16.0, *)
struct OpenAcuteMedicalTakeIntent: AMTRouteIntent {
    static var title: LocalizedStringResource = "Open Acute Medical Take"
    static var openAppWhenRun = true
    func perform() async throws -> some IntentResult { storeRoute("home"); return .result() }
}

@available(iOS 16.0, *)
struct OpenSepsisPathwayIntent: AMTRouteIntent {
    static var title: LocalizedStringResource = "Open the sepsis pathway"
    static var openAppWhenRun = true
    func perform() async throws -> some IntentResult { storeRoute("sepsis"); return .result() }
}

@available(iOS 16.0, *)
struct OpenOfflineEmergenciesIntent: AMTRouteIntent {
    static var title: LocalizedStringResource = "Open offline emergencies"
    static var openAppWhenRun = true
    func perform() async throws -> some IntentResult { storeRoute("offline"); return .result() }
}

@available(iOS 16.0, *)
struct StartReviewTimerIntent: AMTRouteIntent {
    static var title: LocalizedStringResource = "Start a review timer"
    static var description = IntentDescription("Opens the app so the user can choose and manually start a review timer.")
    static var openAppWhenRun = true
    func perform() async throws -> some IntentResult { storeRoute("timers"); return .result() }
}

@available(iOS 16.0, *)
struct ShowFavouritePathwaysIntent: AMTRouteIntent {
    static var title: LocalizedStringResource = "Show my favourite pathways"
    static var openAppWhenRun = true
    func perform() async throws -> some IntentResult { storeRoute("favourites"); return .result() }
}

@available(iOS 16.0, *)
struct AMTAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: OpenAcuteMedicalTakeIntent(), phrases: ["Open \(.applicationName)"], shortTitle: "Open AMT", systemImageName: "cross.case")
        AppShortcut(intent: OpenSepsisPathwayIntent(), phrases: ["Open sepsis in \(.applicationName)"], shortTitle: "Sepsis pathway", systemImageName: "waveform.path.ecg")
        AppShortcut(intent: OpenOfflineEmergenciesIntent(), phrases: ["Open offline emergencies in \(.applicationName)"], shortTitle: "Offline emergencies", systemImageName: "bolt.heart")
        AppShortcut(intent: StartReviewTimerIntent(), phrases: ["Start a review timer in \(.applicationName)"], shortTitle: "Review timer", systemImageName: "timer")
        AppShortcut(intent: ShowFavouritePathwaysIntent(), phrases: ["Show favourites in \(.applicationName)"], shortTitle: "Favourites", systemImageName: "star")
    }
}
