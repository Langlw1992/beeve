import SwiftData
import SwiftUI

@main
struct BeeveIOSApp: App {
  private let products = ProductCatalogService().products

  var body: some Scene {
    WindowGroup {
      RootTabView(products: products)
    }
    .modelContainer(for: [
      ReminderItem.self,
      UserProfile.self,
      NotificationSetting.self,
      FavoriteProduct.self,
    ])
  }
}
