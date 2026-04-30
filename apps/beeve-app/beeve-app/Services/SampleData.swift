import Foundation
import SwiftData

enum SampleData {
    static let preferences = UserPreferences(preferredName: "Lang", hasCompletedOnboarding: true)
    static let focus = DailyFocus(title: "Ship the first Beeve iOS loop")
    static let entries = [
        DayEntry(kind: .done, text: "Finished the product direction"),
        DayEntry(kind: .interrupted, text: "Handled an urgent auth issue"),
        DayEntry(kind: .tomorrow, text: "Create the first shareable achievement card"),
    ]

    @MainActor
    static func previewContainer(
        hasCompletedOnboarding: Bool = true,
        includeHistory: Bool = true
    ) -> ModelContainer {
        let schema = Schema([
            UserPreferences.self,
            DailyFocus.self,
            DayEntry.self,
            AchievementCard.self,
        ])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try! ModelContainer(for: schema, configurations: [configuration])
        seedPreviewData(
            in: container.mainContext,
            hasCompletedOnboarding: hasCompletedOnboarding,
            includeHistory: includeHistory
        )
        return container
    }

    @MainActor
    static func previewPreferences(from container: ModelContainer) -> UserPreferences {
        let descriptor = FetchDescriptor<UserPreferences>()
        if let preferences = try? container.mainContext.fetch(descriptor).first {
            return preferences
        }

        let preferences = UserPreferences(preferredName: "Lang")
        container.mainContext.insert(preferences)
        return preferences
    }

    @MainActor
    static func previewFocus(from container: ModelContainer) -> DailyFocus {
        let descriptor = FetchDescriptor<DailyFocus>()
        if let focus = try? container.mainContext.fetch(descriptor).first {
            return focus
        }

        let focus = DailyFocus(title: "Polish the Beeve iOS preview flow")
        container.mainContext.insert(focus)
        return focus
    }

    @MainActor
    private static func seedPreviewData(
        in context: ModelContext,
        hasCompletedOnboarding: Bool,
        includeHistory: Bool
    ) {
        let today = Calendar.current.startOfDay(for: .now)
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: today) ?? today

        context.insert(UserPreferences(
            preferredName: "Lang",
            tone: .calm,
            hasCompletedOnboarding: hasCompletedOnboarding,
            notificationsEnabled: true
        ))

        guard includeHistory else {
            try? context.save()
            return
        }

        context.insert(DailyFocus(date: today, title: "Polish the Beeve iOS preview flow"))
        context.insert(DayEntry(date: today, kind: .done, text: "Tightened the Today screen hierarchy"))
        context.insert(DayEntry(date: today, kind: .interrupted, text: "Switched context to fix the Xcode scheme"))
        context.insert(DayEntry(date: today, kind: .tomorrow, text: "Review the first-run copy on a smaller phone"))
        context.insert(AchievementCard(
            date: yesterday,
            title: "A practical day with a cleaner handoff",
            summaryBullets: [
                "Rebuilt the onboarding rhythm",
                "Kept the Today screen focused",
                "Verified the app in Simulator",
            ],
            interruptionReframe: "The interruptions counted too: Xcode setup and preview data.",
            tomorrowPriorities: [
                "Tighten card sharing",
                "Add empty-state illustration",
            ],
            closingLine: "Tomorrow starts lighter because the next thread is named."
        ))

        try? context.save()
    }
}
