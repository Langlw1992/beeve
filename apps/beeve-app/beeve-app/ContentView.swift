import SwiftUI

struct ContentView: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.scenePhase) private var scenePhase
    @AppStorage("beeve.onboarding.completed") private var hasCompletedOnboarding = false
    @AppStorage("beeve.notifications.requested") private var hasRequestedNotifications = false
    @State private var selectedTab: AppTab = .today

    var body: some View {
        TabView(selection: $selectedTab) {
            TodayView { tab in
                selectedTab = tab
            }
            .tag(AppTab.today)
            .tabItem {
                Label("今日", systemImage: "sparkles")
            }

            PingView { tab in
                selectedTab = tab
            }
            .tag(AppTab.ping)
            .tabItem {
                Label("Ping", systemImage: "antenna.radiowaves.left.and.right")
            }

            WorkspaceView()
                .tag(AppTab.workspace)
                .tabItem {
                    Label("工作台", systemImage: "square.grid.2x2")
                }
        }
        .tint(DSColor.brand)
        .sheet(isPresented: Binding(
            get: { !hasCompletedOnboarding },
            set: { isPresented in
                if !isPresented {
                    hasCompletedOnboarding = true
                }
            }
        )) {
            OnboardingSheet {
                hasCompletedOnboarding = true
            }
            .interactiveDismissDisabled()
        }
        .onAppear {
            setupNotificationsIfNeeded()
            consumeIntentRoute()
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .active {
                consumeIntentRoute()
            }
        }
    }

    private func setupNotificationsIfNeeded() {
        guard !hasRequestedNotifications else { return }

        let service = NotificationService.shared
        service.registerCategories()

        Task {
            let granted = await service.requestAuthorization()
            hasRequestedNotifications = true

            guard granted else { return }

            service.scheduleMorningDigest(pendingCount: store.pendingCount)
            service.scheduleEveningReview(completedToday: store.completedCount, pendingCount: store.pendingCount)

            for reminder in store.pendingReminders where reminder.dueDate != nil {
                service.scheduleNotification(for: reminder)
            }
        }
    }

    private func consumeIntentRoute() {
        guard let rawValue = UserDefaults.standard.string(forKey: "beeve.intent.route"),
              let route = AppIntentRoute(rawValue: rawValue) else { return }

        switch route {
        case .today:
            selectedTab = .today
        case .ping:
            selectedTab = .ping
        }

        UserDefaults.standard.removeObject(forKey: "beeve.intent.route")
    }
}
