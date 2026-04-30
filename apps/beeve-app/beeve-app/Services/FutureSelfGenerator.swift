import Foundation

struct FutureSelfGenerator {
    func note(for context: DayContext, now: Date = .now) -> String {
        let hour = Calendar.current.component(.hour, from: now)
        let name = context.preferences.preferredName.trimmingCharacters(in: .whitespacesAndNewlines)
        let prefix = name.isEmpty ? "" : "\(name), "

        switch (context.preferences.tone, hour) {
        case (_, 5..<12):
            return "\(prefix)先定一个真正的推进。"
        case (.firm, 12..<17):
            return "\(prefix)别开新坑，收住这一件。"
        case (_, 12..<17):
            return "\(prefix)先回到已经开始的那条线。"
        case (_, 17..<22):
            return "\(prefix)先写下真正往前走的部分。"
        default:
            return "\(prefix)给明天留一条清楚线索。"
        }
    }

    func makeAchievementCard(from context: DayContext) -> AchievementCard {
        let done = context.doneEntries.map(\.text).filter { !$0.isEmpty }
        let interruptions = context.interruptedEntries.map(\.text).filter { !$0.isEmpty }
        let tomorrow = context.tomorrowEntries.map(\.text).filter { !$0.isEmpty }

        let bullets = Array(done.prefix(5))
        let title = bullets.isEmpty ? "今天也有可收起的部分" : "今天往前走了"

        let reframe: String
        if interruptions.isEmpty {
            reframe = "今天没有记录打断。"
        } else {
            reframe = "这些打断也算进今天：\(interruptions.prefix(2).joined(separator: "、"))。"
        }

        let focusFallback = context.focus?.isCompleted == false ? context.focus?.title : nil
        let priorities = Array((tomorrow + [focusFallback].compactMap { $0 }).prefix(3))
        let closingLine = priorities.isEmpty
            ? "明天只需要一个清楚的开始。"
            : "下一条线已经留好了。"

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
