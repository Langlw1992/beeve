import Foundation
import UserNotifications

struct NotificationScheduler {
    private let center = UNUserNotificationCenter.current()

    func requestAuthorization() async -> Bool {
        do {
            return try await center.requestAuthorization(options: [.alert, .sound, .badge])
        } catch {
            return false
        }
    }

    func scheduleDailyReminders(preferences: UserPreferences) async {
        center.removePendingNotificationRequests(withIdentifiers: [
            "beeve.morning-focus",
            "beeve.afternoon-collect",
            "beeve.evening-card",
        ])

        guard preferences.notificationsEnabled else { return }

        await schedule(
            id: "beeve.morning-focus",
            title: "未来的你有一个请求",
            body: "先选一件最能让今天不散掉的事。",
            hour: preferences.workStartHour,
            minute: min(preferences.workStartMinute + 15, 59)
        )

        await schedule(
            id: "beeve.afternoon-collect",
            title: "继续之前，先收一下",
            body: "先别开新线，写下已经往前走的部分。",
            hour: max(preferences.workEndHour - 1, 0),
            minute: preferences.workEndMinute
        )

        await schedule(
            id: "beeve.evening-card",
            title: "今天真的浪费了吗？",
            body: "在下结论前，先把证据留给未来的自己。",
            hour: preferences.workEndHour,
            minute: min(preferences.workEndMinute + 30, 59)
        )
    }

    private func schedule(id: String, title: String, body: String, hour: Int, minute: Int) async {
        var components = DateComponents()
        components.hour = hour
        components.minute = minute

        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
        try? await center.add(request)
    }
}
