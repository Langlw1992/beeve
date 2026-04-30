import Foundation

struct FutureSelfGenerator {
    func note(for context: DayContext, now: Date = .now) -> String {
        let hour = Calendar.current.component(.hour, from: now)
        let name = context.preferences.preferredName.trimmingCharacters(in: .whitespacesAndNewlines)
        let prefix = name.isEmpty ? "" : "\(name), "

        switch (context.preferences.tone, hour) {
        case (_, 5..<12):
            return "\(prefix)今天只需要一个真正的推进。先把它定下来，别让日程替你决定。"
        case (.firm, 12..<17):
            return "\(prefix)先别再开新坑。把已经在动的事情收住。"
        case (_, 12..<17):
            return "\(prefix)午后先别加码，回到已经开始的那条线。"
        case (_, 17..<22):
            return "\(prefix)先别急着说今天废了，写下真正往前走过的部分。"
        default:
            return "\(prefix)给明天留一条清晰线索，而不是一堆噪音。"
        }
    }

    func makeAchievementCard(from context: DayContext) -> AchievementCard {
        let done = context.doneEntries.map(\.text).filter { !$0.isEmpty }
        let interruptions = context.interruptedEntries.map(\.text).filter { !$0.isEmpty }
        let tomorrow = context.tomorrowEntries.map(\.text).filter { !$0.isEmpty }

        let bullets = Array(done.prefix(5))
        let title = bullets.isEmpty ? "这一天仍然值得被收起来" : "今天比感觉中走得更远"

        let reframe: String
        if interruptions.isEmpty {
            reframe = "今天没有记录打断。保持简单，也保持诚实。"
        } else {
            reframe = "这些打断也算进今天：\(interruptions.prefix(2).joined(separator: "、"))。"
        }

        let focusFallback = context.focus?.isCompleted == false ? context.focus?.title : nil
        let priorities = Array((tomorrow + [focusFallback].compactMap { $0 }).prefix(3))
        let closingLine = priorities.isEmpty
            ? "明天的你只需要一个清楚的开始。"
            : "因为你已经命名了下一条线，明天会轻一点。"

        return AchievementCard(
            date: context.date,
            title: title,
            summaryBullets: bullets.isEmpty ? ["你至少停下来整理了这一天。"] : bullets,
            interruptionReframe: reframe,
            tomorrowPriorities: priorities,
            closingLine: closingLine
        )
    }
}
