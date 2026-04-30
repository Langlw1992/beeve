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
