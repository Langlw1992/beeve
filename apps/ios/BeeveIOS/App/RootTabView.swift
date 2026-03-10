import SwiftData
import SwiftUI

struct RootTabView: View {
  let products: [Product]

  @State private var selectedTab: AppTab = .home
  @State private var catalogScope: CatalogScope = .all

  var body: some View {
    TabView(selection: $selectedTab) {
      NavigationStack {
        HomeView(
          products: products,
          onOpenCatalog: { scope in
            catalogScope = scope
            selectedTab = .catalog
          }
        )
      }
      .tabItem {
        Label("首页", systemImage: "house")
      }
      .tag(AppTab.home)

      NavigationStack {
        CatalogView(products: products, selectedScope: $catalogScope)
      }
      .tabItem {
        Label("产品", systemImage: "square.grid.2x2")
      }
      .tag(AppTab.catalog)

      NavigationStack {
        ReminderListView(products: products)
      }
      .tabItem {
        Label("提醒", systemImage: "bell")
      }
      .tag(AppTab.reminders)

      NavigationStack {
        ProfileView()
      }
      .tabItem {
        Label("我的", systemImage: "person.crop.circle")
      }
      .tag(AppTab.profile)
    }
  }
}

#Preview("应用总览") {
  RootTabView(products: Product.samples)
    .modelContainer(
      for: [
        ReminderItem.self,
        UserProfile.self,
        NotificationSetting.self,
        FavoriteProduct.self,
      ],
      inMemory: true,
    )
}
