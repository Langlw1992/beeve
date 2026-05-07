import SwiftData
import SwiftUI

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var preferences: [UserPreferences]
    @State private var selectedTab: AppTab = .today

    var body: some View {
        Group {
            if let activePreferences = preferences.first {
                if activePreferences.hasCompletedOnboarding {
                    tabShell
                } else {
                    OnboardingView(preferences: activePreferences)
                }
            } else {
                ProgressView()
                    .task {
                        ensurePreferences()
                    }
            }
        }
    }

    private var tabShell: some View {
        TabView(selection: $selectedTab) {
            TodayView()
                .tag(AppTab.today)
                .tabItem {
                    Label("今天", systemImage: "sun.max")
                }

            CardsView()
                .tag(AppTab.review)
                .tabItem {
                    Label("回看", systemImage: "clock.arrow.circlepath")
                }

            SettingsView()
                .tag(AppTab.settings)
                .tabItem {
                    Label("设置", systemImage: "gearshape")
                }
        }
        .tint(BeeveDesign.accent)
        .animation(.snappy(duration: 0.22), value: selectedTab)
    }

    private func ensurePreferences() {
        guard preferences.isEmpty else { return }
        modelContext.insert(UserPreferences())
        try? modelContext.save()
    }
}

#Preview("今天") {
    ContentView()
        .modelContainer(SampleData.previewContainer())
        .environmentObject(BeeveAuthSession())
}

#Preview("首次使用") {
    ContentView()
        .modelContainer(SampleData.previewContainer(
            hasCompletedOnboarding: false,
            includeHistory: false
        ))
        .environmentObject(BeeveAuthSession())
}
