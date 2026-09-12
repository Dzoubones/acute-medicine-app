import SwiftUI
import WidgetKit

private let appGroup = "group.uk.acutemedicine.acutemedicaltake"

struct AMTEntry: TimelineEntry {
    let date: Date
    let favourites: [String]
    let timerTitle: String?
    let timerTarget: Date?
}

struct AMTProvider: TimelineProvider {
    func placeholder(in context: Context) -> AMTEntry { AMTEntry(date: .now, favourites: ["Sepsis", "Cardiology"], timerTitle: "Review timer", timerTarget: .now.addingTimeInterval(900)) }
    func getSnapshot(in context: Context, completion: @escaping (AMTEntry) -> Void) { completion(readEntry()) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<AMTEntry>) -> Void) {
        completion(Timeline(entries: [readEntry()], policy: .after(.now.addingTimeInterval(60))))
    }
    private func readEntry() -> AMTEntry {
        let defaults = UserDefaults(suiteName: appGroup)
        let favourites = defaults?.stringArray(forKey: "favourites") ?? []
        let timer = defaults?.dictionary(forKey: "activeTimer")
        let milliseconds = timer?["targetAt"] as? Double
        return AMTEntry(date: .now, favourites: favourites, timerTitle: timer?["title"] as? String, timerTarget: milliseconds.map { Date(timeIntervalSince1970: $0 / 1000) })
    }
}

struct AMTWidgetView: View {
    let entry: AMTEntry
    let title: String
    let route: String
    let rows: [String]
    var body: some View {
        Link(destination: URL(string: "acutemedicaltake://\(route)")!) {
            VStack(alignment: .leading, spacing: 7) {
                Text("A+").font(.caption.bold()).foregroundStyle(.cyan)
                Text(title).font(.headline)
                ForEach(rows.prefix(3), id: \.self) { Text($0).font(.caption).lineLimit(1) }
                Spacer(minLength: 0)
                Text("Open AMT").font(.caption2).foregroundStyle(.secondary)
            }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }.containerBackground(for: .widget) { Color(red: 0.03, green: 0.10, blue: 0.19) }
    }
}

struct QuickPathwaysWidget: Widget {
    let kind = "QuickPathways"
    var body: some WidgetConfiguration { StaticConfiguration(kind: kind, provider: AMTProvider()) { AMTWidgetView(entry: $0, title: "Quick Pathways", route: "home", rows: ["Emergency", "Cardiology", "Neurology"]) }.configurationDisplayName("Quick Pathways").supportedFamilies([.systemSmall, .systemMedium]) }
}
struct OfflineEmergenciesWidget: Widget {
    let kind = "OfflineEmergencies"
    var body: some WidgetConfiguration { StaticConfiguration(kind: kind, provider: AMTProvider()) { AMTWidgetView(entry: $0, title: "Offline Emergencies", route: "offline", rows: ["Cardiac arrest", "Anaphylaxis", "Suspected sepsis"]) }.configurationDisplayName("Offline Emergencies").supportedFamilies([.systemSmall, .systemMedium]) }
}
struct FavouritesWidget: Widget {
    let kind = "Favourites"
    var body: some WidgetConfiguration { StaticConfiguration(kind: kind, provider: AMTProvider()) { AMTWidgetView(entry: $0, title: "Favourites", route: "favourites", rows: $0.favourites.isEmpty ? ["No favourites yet"] : $0.favourites) }.configurationDisplayName("Favourites").supportedFamilies([.systemSmall, .systemMedium]) }
}
struct ActiveTimerWidget: Widget {
    let kind = "ActiveTimer"
    var body: some WidgetConfiguration { StaticConfiguration(kind: kind, provider: AMTProvider()) { entry in AMTWidgetView(entry: entry, title: entry.timerTitle ?? "No active timer", route: "timers", rows: entry.timerTarget.map { ["Review at \($0.formatted(date: .omitted, time: .shortened))"] } ?? ["Start one in the app"]) }.configurationDisplayName("Active Timer").supportedFamilies([.systemSmall, .systemMedium]) }
}

@main
struct AMTWidgetBundle: WidgetBundle {
    var body: some Widget { QuickPathwaysWidget(); OfflineEmergenciesWidget(); FavouritesWidget(); ActiveTimerWidget() }
}
