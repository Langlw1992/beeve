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
                    Label("Today", systemImage: "sun.max")
                }

            CardsView()
                .tag(AppTab.cards)
                .tabItem {
                    Label("Cards", systemImage: "rectangle.stack")
                }

            SettingsView()
                .tag(AppTab.settings)
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
        }
        .tint(BeeveDesign.accent)
    }

    private func ensurePreferences() {
        guard preferences.isEmpty else { return }
        modelContext.insert(UserPreferences())
        try? modelContext.save()
    }
}

#Preview("Today") {
    ContentView()
        .modelContainer(SampleData.previewContainer())
}

#Preview("Onboarding") {
    ContentView()
        .modelContainer(SampleData.previewContainer(
            hasCompletedOnboarding: false,
            includeHistory: false
        ))
}
