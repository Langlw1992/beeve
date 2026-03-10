import Foundation
import SwiftData

@Model
final class UserProfile {
  var nickname: String
  var email: String
  var phone: String
  var preferredCategory: String
  var marketingOptIn: Bool

  init(
    nickname: String = "Beeve 用户",
    email: String = "",
    phone: String = "",
    preferredCategory: String = ProductCategory.smartHome.rawValue,
    marketingOptIn: Bool = false,
  ) {
    self.nickname = nickname
    self.email = email
    self.phone = phone
    self.preferredCategory = preferredCategory
    self.marketingOptIn = marketingOptIn
  }
}
