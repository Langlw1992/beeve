import Foundation
import SwiftData

@Model
final class NotificationSetting {
  var isReminderEnabled: Bool
  var isMarketingEnabled: Bool
  var authorizedStatus: String

  init(
    isReminderEnabled: Bool = false,
    isMarketingEnabled: Bool = false,
    authorizedStatus: String = "notDetermined",
  ) {
    self.isReminderEnabled = isReminderEnabled
    self.isMarketingEnabled = isMarketingEnabled
    self.authorizedStatus = authorizedStatus
  }
}
