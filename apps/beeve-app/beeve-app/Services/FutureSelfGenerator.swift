import Foundation

struct FutureSelfGenerator {
    func note(for context: DayContext, now: Date = .now) -> String {
        let hour = Calendar.current.component(.hour, from: now)
        let name = context.preferences.preferredName.trimmingCharacters(in: .whitespacesAndNewlines)
        let prefix = name.isEmpty ? "" : "\(name), "

        switch (context.preferences.tone, hour) {
        case (_, 5..<12):
            return "\(prefix)future-you only needs one real move today. Pick it before the day picks for you."
        case (.firm, 12..<17):
            return "\(prefix)stop opening loops. Collect what is already moving."
        case (_, 12..<17):
            return "\(prefix)do not open another loop yet. Collect what is already moving."
        case (_, 17..<22):
            return "\(prefix)before you call the day wasted, write down what actually moved."
        default:
            return "\(prefix)leave tomorrow one clear thread, not a pile."
        }
    }

    func makeAchievementCard(from context: DayContext) -> AchievementCard {
        let done = context.doneEntries.map(\.text).filter { !$0.isEmpty }
        let interruptions = context.interruptedEntries.map(\.text).filter { !$0.isEmpty }
        let tomorrow = context.tomorrowEntries.map(\.text).filter { !$0.isEmpty }

        let bullets = Array(done.prefix(5))
        let title = bullets.isEmpty ? "A day worth collecting" : "Today moved more than it felt"

        let reframe: String
        if interruptions.isEmpty {
            reframe = "There were no logged interruptions. Keep the day simple and honest."
        } else {
            reframe = "The interruptions counted too: \(interruptions.prefix(2).joined(separator: ", "))."
        }

        let focusFallback = context.focus?.isCompleted == false ? context.focus?.title : nil
        let priorities = Array((tomorrow + [focusFallback].compactMap { $0 }).prefix(3))
        let closingLine = priorities.isEmpty
            ? "Future-you only needs one clear start tomorrow."
            : "Tomorrow starts lighter because you named the next thread."

        return AchievementCard(
            date: context.date,
            title: title,
            summaryBullets: bullets.isEmpty ? ["You showed up enough to collect the day."] : bullets,
            interruptionReframe: reframe,
            tomorrowPriorities: priorities,
            closingLine: closingLine
        )
    }
}
