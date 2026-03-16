import SwiftUI

struct DashboardView: View {
    @Environment(BeeveStore.self) private var store
    @State private var isTodayExpanded = true

    let onAddReminder: () -> Void
    let onOpenReminders: () -> Void
    let onOpenTools: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(store.greetingTitle)
                            .font(.largeTitle.bold())
                        Text(store.formattedToday)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    HeroOverviewCard(
                        focusScore: store.focusScore,
                        completedCount: store.completedCount,
                        pendingCount: store.pendingCount,
                        inboxCount: store.inboxReminders.count,
                        homeSuggestion: store.homeSuggestion
                    )

                    if let nextReminder = store.nextImportantReminder {
                        NextReminderCard(reminder: nextReminder, onOpenReminders: onOpenReminders)
                    }

                    if !store.pendingPreviewReminders.isEmpty {
                        ExpandableSectionCard(
                            title: "今天进行中",
                            symbol: "bolt.badge.clock",
                            tint: .blue,
                            isExpanded: $isTodayExpanded
                        ) {
                            VStack(spacing: 12) {
                                ForEach(store.pendingPreviewReminders) { reminder in
                                    ReminderPreviewRow(reminder: reminder) {
                                        withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                                            store.toggleReminder(reminder)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if let suggestion = store.completionSuggestion {
                        CompletionSuggestionCard(
                            suggestion: suggestion,
                            onTapDestination: { destination in
                                store.clearCompletionSuggestion()
                                switch destination {
                                case .reminders: onOpenReminders()
                                case .tools, .assistant: onOpenTools()
                                }
                            },
                            onDismiss: { store.clearCompletionSuggestion() }
                        )
                    }
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .navigationTitle("Beeve")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("新增", systemImage: "plus", action: onAddReminder)
                }
            }
            .sensoryFeedback(.success, trigger: store.completedCount)
            .sensoryFeedback(.impact(weight: .light), trigger: store.pendingCount)
        }
    }
}
