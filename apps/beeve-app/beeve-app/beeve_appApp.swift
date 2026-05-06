import SwiftData
import SwiftUI
import UIKit

@main
struct BeeveAppApp: App {
    init() {
        let titleColor = UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 0.92, green: 0.89, blue: 0.84, alpha: 1)
                : UIColor(red: 0.16, green: 0.14, blue: 0.11, alpha: 1)
        }
        let appearance = UINavigationBarAppearance()
        appearance.configureWithTransparentBackground()
        appearance.largeTitleTextAttributes = [.foregroundColor: titleColor]
        appearance.titleTextAttributes = [.foregroundColor: titleColor]

        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        UINavigationBar.appearance().compactAppearance = appearance
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [
            UserPreferences.self,
            DailyFocus.self,
            DayEntry.self,
            AchievementCard.self,
        ])
    }
}
