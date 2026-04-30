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
            title: "Future-you has one request",
            body: "Pick the one thing that would make today feel less scattered.",
            hour: preferences.workStartHour,
            minute: min(preferences.workStartMinute + 15, 59)
        )

        await schedule(
            id: "beeve.afternoon-collect",
            title: "Collect before you continue",
            body: "Do not open another loop yet. Write down what already moved.",
            hour: max(preferences.workEndHour - 1, 0),
            minute: preferences.workEndMinute
        )

        await schedule(
            id: "beeve.evening-card",
            title: "Was today really wasted?",
            body: "Future-you wants the evidence before you decide.",
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
