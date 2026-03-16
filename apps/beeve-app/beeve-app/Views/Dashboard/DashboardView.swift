import SwiftUI

struct DashboardView: View {
    @Environment(BeeveStore.self) private var store
    @State private var spotlightIndex = 0
    @State private var isQuickActionsExpanded = true
    @State private var isTodayExpanded = true

    let onAddReminder: () -> Void
    let onOpenReminders: () -> Void
    let onOpenTools: () -> Void
    let onOpenAssistant: () -> Void

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
                        homeSuggestion: store.homeSuggestion,
                        onOpenAssistant: onOpenAssistant
                    )
                    .immersiveScrollMotion()

                    SpotlightCarousel(
                        selection: $spotlightIndex,
                        overdueCount: store.overdueReminders.count,
                        inboxCount: store.inboxReminders.count,
                        todayCount: store.todayReminders.count,
                        upcomingCount: store.upcomingReminders.count,
                        nextReminderTitle: store.nextImportantReminder?.title,
                        onAddReminder: onAddReminder,
                        onOpenReminders: onOpenReminders,
                        onOpenAssistant: onOpenAssistant
                    )
                    .immersiveScrollMotion()

                    DayPulseStrip(
                        overdueCount: store.overdueReminders.count,
                        inboxCount: store.inboxReminders.count,
                        todayCount: store.todayReminders.count,
                        upcomingCount: store.upcomingReminders.count,
                        completedCount: store.completedCount,
                        onOpenReminders: onOpenReminders
                    )

                    TriageCard(summary: store.triageSummary, inboxCount: store.inboxReminders.count, todayCount: store.todayReminders.count)
                        .immersiveScrollMotion()

                    if let nextReminder = store.nextImportantReminder {
                        NextReminderCard(reminder: nextReminder, onOpenReminders: onOpenReminders)
                            .immersiveScrollMotion()
                    }

                    RhythmBoardCard(
                        overdueCount: store.overdueReminders.count,
                        todayCount: store.todayReminders.count,
                        upcomingCount: store.upcomingReminders.count,
                        nextReminderTitle: store.nextImportantReminder?.title,
                        onOpenReminders: onOpenReminders,
                        onOpenAssistant: onOpenAssistant
                    )
                    .immersiveScrollMotion()

                    if !store.pendingPreviewReminders.isEmpty {
                        AgendaTimelineCard(
                            reminders: store.pendingPreviewReminders,
                            onOpenReminders: onOpenReminders
                        )
                        .immersiveScrollMotion()
                    }

                    if let suggestion = store.completionSuggestion {
                        CompletionSuggestionCard(
                            suggestion: suggestion,
                            onTapDestination: { destination in
                                store.clearCompletionSuggestion()
                                switch destination {
                                case .reminders: onOpenReminders()
                                case .tools: onOpenTools()
                                case .assistant: onOpenAssistant()
                                }
                            },
                            onDismiss: { store.clearCompletionSuggestion() }
                        )
                        .immersiveScrollMotion()
                    }

                    ExpandableSectionCard(
                        title: "快速入口",
                        symbol: "square.grid.2x2",
                        tint: .blue,
                        isExpanded: $isQuickActionsExpanded
                    ) {
                        QuickActionsSection(
                            onAddReminder: onAddReminder,
                            onOpenReminders: onOpenReminders,
                            onOpenTools: onOpenTools,
                            onOpenAssistant: onOpenAssistant
                        )
                    }
                    .immersiveScrollMotion()

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
                    .immersiveScrollMotion()
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .navigationTitle("Beeve")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton(action: onOpenAssistant)
                }
            }
            .safeAreaInset(edge: .bottom) {
                HomeContextBar(
                    onAddReminder: onAddReminder,
                    onOpenReminders: onOpenReminders,
                    onOpenAssistant: onOpenAssistant
                )
                .padding(.horizontal)
                .padding(.top, 8)
                .background(.clear)
            }
            .sensoryFeedback(.success, trigger: store.completedCount)
            .sensoryFeedback(.impact(weight: .light), trigger: store.pendingCount)
        }
    }
}
