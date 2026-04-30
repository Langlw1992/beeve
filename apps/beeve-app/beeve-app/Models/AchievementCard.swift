import Foundation
import SwiftData

@Model
final class AchievementCard {
    var date: Date
    var title: String
    var summaryBullets: [String]
    var interruptionReframe: String
    var tomorrowPriorities: [String]
    var closingLine: String
    var createdAt: Date

    init(
        date: Date = .now,
        title: String,
        summaryBullets: [String],
        interruptionReframe: String,
        tomorrowPriorities: [String],
        closingLine: String,
        createdAt: Date = .now
    ) {
        self.date = Calendar.current.startOfDay(for: date)
        self.title = title
        self.summaryBullets = summaryBullets
        self.interruptionReframe = interruptionReframe
        self.tomorrowPriorities = tomorrowPriorities
        self.closingLine = closingLine
        self.createdAt = createdAt
    }
}
