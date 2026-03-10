import Foundation
import UserNotifications

struct ReminderDraft {
  let title: String
  let note: String
  let scheduledAt: Date
  let repeatDaily: Bool
  let relatedProductId: String?
  let relatedTaskId: String?
}

struct NotificationService {
  static let shared = NotificationService()

  private init() {}

  func requestAuthorization() async throws -> Bool {
    try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
  }

  func scheduleReminder(_ draft: ReminderDraft) async throws -> String {
    let content = UNMutableNotificationContent()
    content.title = draft.title

    if !draft.note.isEmpty {
      content.body = draft.note
    }

    let dateComponents = Calendar.current.dateComponents(
      [.year, .month, .day, .hour, .minute],
      from: draft.scheduledAt,
    )

    let trigger = UNCalendarNotificationTrigger(
      dateMatching: dateComponents,
      repeats: draft.repeatDaily,
    )

    let identifier = UUID().uuidString
    let request = UNNotificationRequest(
      identifier: identifier,
      content: content,
      trigger: trigger,
    )

    try await UNUserNotificationCenter.current().add(request)
    return identifier
  }

  func cancelReminder(identifier: String) {
    UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [identifier])
  }
}
