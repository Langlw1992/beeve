import Foundation
import SwiftData

@Model
final class FocusSession {
    @Attribute(.unique) var id: UUID
    var startedAt: Date
    var duration: Int // seconds planned
    var elapsed: Int  // seconds actually focused
    var isCompleted: Bool
    var linkedReminderId: UUID?
    var linkedReminderTitle: String?

    init(duration: Int = 25 * 60, linkedReminder: Reminder? = nil) {
        self.id = UUID()
        self.startedAt = .now
        self.duration = duration
        self.elapsed = 0
        self.isCompleted = false
        self.linkedReminderId = linkedReminder?.id
        self.linkedReminderTitle = linkedReminder?.title
    }
}

extension FocusSession {
    var durationMinutes: Int { duration / 60 }
    var elapsedMinutes: Int { elapsed / 60 }
    var progress: Double {
        guard duration > 0 else { return 0 }
        return min(Double(elapsed) / Double(duration), 1.0)
    }
    var isToday: Bool {
        Calendar.current.isDateInToday(startedAt)
    }
}
