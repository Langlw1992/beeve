import Foundation

enum RepeatRule: Codable, Equatable, Hashable {
    case daily
    case weekdays
    case weekly
    case biweekly
    case monthly
    case custom(days: Int)

    var label: String {
        switch self {
        case .daily: "每天"
        case .weekdays: "工作日"
        case .weekly: "每周"
        case .biweekly: "每两周"
        case .monthly: "每月"
        case .custom(let days): "每 \(days) 天"
        }
    }

    var symbol: String {
        switch self {
        case .daily: "arrow.trianglehead.2.clockwise"
        case .weekdays: "calendar"
        case .weekly: "calendar.badge.clock"
        case .biweekly: "calendar.badge.plus"
        case .monthly: "calendar.circle"
        case .custom: "clock.arrow.trianglehead.2.counterclockwise.rotate.90"
        }
    }

    func nextOccurrence(from date: Date) -> Date {
        let calendar = Calendar.current
        switch self {
        case .daily:
            return calendar.date(byAdding: .day, value: 1, to: date) ?? date
        case .weekdays:
            var next = calendar.date(byAdding: .day, value: 1, to: date) ?? date
            while calendar.isDateInWeekend(next) {
                next = calendar.date(byAdding: .day, value: 1, to: next) ?? next
            }
            return next
        case .weekly:
            return calendar.date(byAdding: .weekOfYear, value: 1, to: date) ?? date
        case .biweekly:
            return calendar.date(byAdding: .weekOfYear, value: 2, to: date) ?? date
        case .monthly:
            return calendar.date(byAdding: .month, value: 1, to: date) ?? date
        case .custom(let days):
            return calendar.date(byAdding: .day, value: days, to: date) ?? date
        }
    }
}

extension RepeatRule {
    static let presets: [RepeatRule] = [.daily, .weekdays, .weekly, .biweekly, .monthly]
}
