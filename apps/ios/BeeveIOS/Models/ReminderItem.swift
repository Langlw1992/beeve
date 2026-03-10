import Foundation
import SwiftData

@Model
final class ReminderItem {
  var id: String
  var title: String
  var note: String
  var scheduledAt: Date
  var repeatRule: String
  var isCompleted: Bool
  var relatedProductId: String?
  var notificationIdentifier: String?
  var createdAt: Date
  var updatedAt: Date

  init(
    id: String = UUID().uuidString,
    title: String,
    note: String = "",
    scheduledAt: Date,
    repeatRule: String = "none",
    isCompleted: Bool = false,
    relatedProductId: String? = nil,
    notificationIdentifier: String? = nil,
    createdAt: Date = Date(),
    updatedAt: Date = Date(),
  ) {
    self.id = id
    self.title = title
    self.note = note
    self.scheduledAt = scheduledAt
    self.repeatRule = repeatRule
    self.isCompleted = isCompleted
    self.relatedProductId = relatedProductId
    self.notificationIdentifier = notificationIdentifier
    self.createdAt = createdAt
    self.updatedAt = updatedAt
  }
}
