import Foundation

struct DayContext {
    let date: Date
    let preferences: UserPreferences
    let focus: DailyFocus?
    let entries: [DayEntry]

    var doneEntries: [DayEntry] {
        entries.filter { $0.kind == .done }
    }

    var interruptedEntries: [DayEntry] {
        entries.filter { $0.kind == .interrupted }
    }

    var tomorrowEntries: [DayEntry] {
        entries.filter { $0.kind == .tomorrow }
    }
}

struct AssistantContextSnapshot: Sendable {
    let dateText: String
    let preferredName: String
    let tone: String
    let focusTitle: String?
    let doneItems: [String]
    let interruptedItems: [String]
    let tomorrowItems: [String]

    init(context: DayContext) {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_Hans_CN")
        formatter.dateFormat = "M月d日 EEEE"

        dateText = formatter.string(from: context.date)
        preferredName = context.preferences.preferredName.trimmingCharacters(in: .whitespacesAndNewlines)
        tone = context.preferences.tone.label
        focusTitle = context.focus?.title.trimmingCharacters(in: .whitespacesAndNewlines)
        doneItems = context.doneEntries.map(\.text)
        interruptedItems = context.interruptedEntries.map(\.text)
        tomorrowItems = context.tomorrowEntries.map(\.text)
    }

    var compactSummary: String {
        """
        日期：\(dateText)
        称呼：\(preferredName.isEmpty ? "用户" : preferredName)
        语气：\(tone)
        今日焦点：\(focusTitle?.isEmpty == false ? focusTitle! : "未设定")
        已推进：\(doneItems.isEmpty ? "暂无" : doneItems.joined(separator: "；"))
        打断：\(interruptedItems.isEmpty ? "暂无" : interruptedItems.joined(separator: "；"))
        明天：\(tomorrowItems.isEmpty ? "暂无" : tomorrowItems.joined(separator: "；"))
        """
    }
}
