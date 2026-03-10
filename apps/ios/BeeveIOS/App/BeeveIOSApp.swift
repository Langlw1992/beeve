import SwiftData
import SwiftUI

@main
struct BeeveIOSApp: App {
  var body: some Scene {
    WindowGroup {
      RootTabView()
        .tint(.indigo)
    }
    .modelContainer(for: [
      TaskItem.self,
      ReminderItem.self,
      UserProfile.self,
      NotificationSetting.self,
      FavoriteProduct.self,
    ])
  }
}
