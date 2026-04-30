import Foundation
import SwiftData

@Model
final class DailyFocus {
    var date: Date
    var title: String
    var isCompleted: Bool
    var createdAt: Date
    var updatedAt: Date

    init(
        date: Date = .now,
        title: String,
        isCompleted: Bool = false,
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.date = Calendar.current.startOfDay(for: date)
        self.title = title
        self.isCompleted = isCompleted
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
