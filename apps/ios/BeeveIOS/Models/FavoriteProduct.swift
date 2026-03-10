import Foundation
import SwiftData

@Model
final class FavoriteProduct {
  var productId: String
  var createdAt: Date

  init(productId: String, createdAt: Date = Date()) {
    self.productId = productId
    self.createdAt = createdAt
  }
}
