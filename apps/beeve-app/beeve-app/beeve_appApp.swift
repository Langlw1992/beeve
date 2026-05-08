import SwiftData
import SwiftUI
import UIKit

@main
struct BeeveAppApp: App {
    @StateObject private var authSession = BeeveAuthSession()

    init() {
        let titleColor = UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 0.930, green: 0.942, blue: 0.966, alpha: 1)
                : UIColor(red: 0.100, green: 0.116, blue: 0.150, alpha: 1)
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
                .environmentObject(authSession)
                .task {
                    await authSession.refresh()
                }
        }
        .modelContainer(for: [
            UserPreferences.self,
            DailyFocus.self,
            DayEntry.self,
            AchievementCard.self,
        ])
    }
}
