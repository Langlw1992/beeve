import Foundation
import UserNotifications

@MainActor
final class NotificationService {
    static let shared = NotificationService()

    private init() {}

    // MARK: - Authorization

    func requestAuthorization() async -> Bool {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            return granted
        } catch {
            return false
        }
    }

    // MARK: - Schedule Reminder Notification

    func scheduleNotification(for reminder: Reminder) {
        guard let dueDate = reminder.dueDate, !reminder.isCompleted else { return }

        let content = UNMutableNotificationContent()
        content.title = reminder.title
        content.body = reminder.note.isEmpty ? "该处理这件事了" : reminder.note
        content.sound = .default
        content.categoryIdentifier = "REMINDER"
        content.userInfo = ["reminderId": reminder.id.uuidString]

        // Badge with priority
        switch reminder.priority {
        case .high:
            content.interruptionLevel = .timeSensitive
        case .medium:
            content.interruptionLevel = .active
        case .low:
            content.interruptionLevel = .passive
        }

        let components = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute],
            from: dueDate
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)

        let request = UNNotificationRequest(
            identifier: "reminder-\(reminder.id.uuidString)",
            content: content,
            trigger: trigger
        )

        UNUserNotificationCenter.current().add(request)
    }

    func cancelNotification(for reminder: Reminder) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(
            withIdentifiers: ["reminder-\(reminder.id.uuidString)"]
        )
    }

    // MARK: - Morning & Evening Digest

    func scheduleMorningDigest(pendingCount: Int) {
        let content = UNMutableNotificationContent()
        content.title = "晨间计划"
        content.body = pendingCount > 0
            ? "你有 \(pendingCount) 项待处理事项，打开 Beeve 收拢今天的下一步。"
            : "今天还没有安排，适合先记录几个关键动作。"
        content.sound = .default
        content.categoryIdentifier = "DIGEST"

        var components = DateComponents()
        components.hour = 8
        components.minute = 30
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

        let request = UNNotificationRequest(
            identifier: "morning-digest",
            content: content,
            trigger: trigger
        )
        UNUserNotificationCenter.current().add(request)
    }

    func scheduleEveningReview(completedToday: Int, pendingCount: Int) {
        let content = UNMutableNotificationContent()
        content.title = "晚间回顾"
        content.body = completedToday > 0
            ? "今天完成了 \(completedToday) 项，还有 \(pendingCount) 项待处理。花 2 分钟收个尾。"
            : "今天还没完成任何事项，不如现在快速看一下明天的安排。"
        content.sound = .default
        content.categoryIdentifier = "DIGEST"

        var components = DateComponents()
        components.hour = 21
        components.minute = 0
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)

        let request = UNNotificationRequest(
            identifier: "evening-review",
            content: content,
            trigger: trigger
        )
        UNUserNotificationCenter.current().add(request)
    }

    // MARK: - Notification Actions

    func registerCategories() {
        let completeAction = UNNotificationAction(
            identifier: "COMPLETE",
            title: "完成",
            options: []
        )
        let snoozeAction = UNNotificationAction(
            identifier: "SNOOZE_1H",
            title: "1 小时后提醒",
            options: []
        )
        let tonightAction = UNNotificationAction(
            identifier: "TONIGHT",
            title: "今晚处理",
            options: []
        )

        let reminderCategory = UNNotificationCategory(
            identifier: "REMINDER",
            actions: [completeAction, snoozeAction, tonightAction],
            intentIdentifiers: [],
            options: .customDismissAction
        )

        let openAction = UNNotificationAction(
            identifier: "OPEN_APP",
            title: "打开 Beeve",
            options: [.foreground]
        )
        let digestCategory = UNNotificationCategory(
            identifier: "DIGEST",
            actions: [openAction],
            intentIdentifiers: [],
            options: []
        )

        UNUserNotificationCenter.current().setNotificationCategories([reminderCategory, digestCategory])
    }

    func cancelAll() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }
}
