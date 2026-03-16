import Foundation
import SwiftData

@Model
final class Habit {
    @Attribute(.unique) var id: UUID
    var title: String
    var symbol: String
    var colorHex: String
    var frequency: HabitFrequency
    var targetCount: Int
    var createdAt: Date

    @Relationship(deleteRule: .cascade, inverse: \HabitLog.habit)
    var logs: [HabitLog]?

    init(
        title: String,
        symbol: String = "checkmark.circle",
        colorHex: String = "6366F1",
        frequency: HabitFrequency = .daily,
        targetCount: Int = 1
    ) {
        self.id = UUID()
        self.title = title
        self.symbol = symbol
        self.colorHex = colorHex
        self.frequency = frequency
        self.targetCount = targetCount
        self.createdAt = .now
    }
}

@Model
final class HabitLog {
    @Attribute(.unique) var id: UUID
    var date: Date
    var count: Int
    var habit: Habit?

    init(date: Date = .now, count: Int = 1) {
        self.id = UUID()
        self.date = Calendar.current.startOfDay(for: date)
        self.count = count
    }
}

enum HabitFrequency: String, Codable, CaseIterable, Identifiable {
    case daily
    case weekdays
    case weekends
    case weekly

    var id: String { rawValue }

    var label: String {
        switch self {
        case .daily: "每天"
        case .weekdays: "工作日"
        case .weekends: "周末"
        case .weekly: "每周"
        }
    }
}

extension Habit {
    var sortedLogs: [HabitLog] {
        (logs ?? []).sorted { $0.date > $1.date }
    }

    var todayLog: HabitLog? {
        sortedLogs.first { Calendar.current.isDateInToday($0.date) }
    }

    var isCompletedToday: Bool {
        (todayLog?.count ?? 0) >= targetCount
    }

    var currentStreak: Int {
        let calendar = Calendar.current
        let sorted = (logs ?? []).map { calendar.startOfDay(for: $0.date) }
            .sorted(by: >)
        guard !sorted.isEmpty else { return 0 }

        var streak = 0
        var checkDate = calendar.startOfDay(for: .now)

        for date in sorted {
            if date == checkDate {
                streak += 1
                checkDate = calendar.date(byAdding: .day, value: -1, to: checkDate)!
            } else if date < checkDate {
                break
            }
        }
        return streak
    }

    var totalCompletions: Int {
        (logs ?? []).reduce(0) { $0 + $1.count }
    }
}

import SwiftUI

extension Habit {
    var color: Color {
        Color(hex: colorHex)
    }
}
