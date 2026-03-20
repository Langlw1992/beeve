import SwiftUI

struct TodayView: View {
    @Environment(BeeveStore.self) private var store
    @State private var destination: SecondaryDestination?
    @State private var showAssistant = false
    @State private var showProfile = false

    let onSwitchTab: (AppTab) -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    header
                    primaryActionCard
                    inboxSummaryCard

                    if !store.todayPlanReminders.isEmpty {
                        AgendaTimelineCard(
                            reminders: store.todayPlanReminders,
                            onOpenReminders: { destination = .planner }
                        )
                    }

                    if let suggestion = store.completionSuggestion {
                        followUpCard(for: suggestion)
                    }
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("今日")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    AssistantToolbarButton { showAssistant = true }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showProfile = true
                    } label: {
                        profileAvatar
                    }
                    .buttonStyle(.plain)
                }
            }
            .navigationDestination(item: $destination) { item in
                destinationView(for: item)
            }
            .sheet(isPresented: $showAssistant) {
                AssistantSheet { action in
                    handleAssistantAction(action)
                }
                .presentationDetents([.large])
            }
            .sheet(isPresented: $showProfile) {
                ProfileView()
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(store.greetingTitle)
                .font(.largeTitle.bold())

            Text(store.formattedToday)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            if !store.memorySummaryLines.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(store.memorySummaryLines, id: \.self) { item in
                            Text(item)
                                .font(.caption.weight(.medium))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .glassCapsule(tint: AppTheme.brand)
                        }
                    }
                }
            }
        }
    }

    private var primaryActionCard: some View {
        let action = store.todayPrimaryAction

        return VStack(alignment: .leading, spacing: 18) {
            SurfaceKicker(title: "下一步", symbol: "sparkles", tint: AppTheme.brand)

            VStack(alignment: .leading, spacing: 8) {
                Text(action.title)
                    .font(.system(size: 30, weight: .bold, design: .rounded))
                    .fixedSize(horizontal: false, vertical: true)
                Text(action.detail)
                    .font(.body)
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 12) {
                Button {
                    performPrimaryAction(action)
                } label: {
                    Label(action.buttonTitle, systemImage: action.buttonSystemImage)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(AppTheme.brand)

                VStack(alignment: .leading, spacing: 4) {
                    Text("\(store.focusScore)")
                        .font(.title3.bold())
                    Text("专注分")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .appCard(tint: AppTheme.warning, cornerRadius: 18)
            }
        }
        .padding(22)
        .appCard(tint: AppTheme.brand, cornerRadius: 30)
    }

    private var inboxSummaryCard: some View {
        GlassSection(title: "今日承诺摘要", symbol: "calendar.badge.clock", tint: AppTheme.ping) {
            VStack(spacing: 12) {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 12) {
                    InboxMetric(title: "今日已排", value: store.todayPlanReminders.count, tint: AppTheme.success)
                    InboxMetric(title: "待处理 Ping", value: store.pingBacklogCount, tint: AppTheme.ping)
                    InboxMetric(title: "待分拣任务", value: store.inboxReminders.count, tint: AppTheme.brand)
                }

                Text(store.triageSummary)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: 10) {
                    Button("查看日程") {
                        destination = .planner
                    }
                    .buttonStyle(.bordered)

                    Button("打开 Ping") {
                        onSwitchTab(.ping)
                    }
                    .buttonStyle(.bordered)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    private func followUpCard(for suggestion: CompletionSuggestion) -> some View {
        GlassSection(title: "下一步建议", symbol: "arrow.forward.circle.fill", tint: AppTheme.success) {
            VStack(alignment: .leading, spacing: 12) {
                Text(suggestion.title)
                    .font(.headline)

                Text(suggestion.detail)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                HStack(spacing: 10) {
                    Button(suggestion.primaryLabel) {
                        handleFollowUpDestination(suggestion.primaryDestination)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(AppTheme.success)

                    if let label = suggestion.secondaryLabel, let destination = suggestion.secondaryDestination {
                        Button(label) {
                            handleFollowUpDestination(destination)
                        }
                        .buttonStyle(.bordered)
                    }
                }
            }
        }
    }

    private func handleFollowUpDestination(_ destination: FollowUpDestination) {
        switch destination {
        case .reminders:
            self.destination = .reminders
        case .focus:
            self.destination = .focus
        case .assistant:
            showAssistant = true
        }
        store.clearCompletionSuggestion()
    }

    private func performPrimaryAction(_ action: TodayPrimaryAction) {
        if let preferredTab = action.preferredTab, preferredTab != .today {
            onSwitchTab(preferredTab)
            return
        }
        if let destination = action.destination {
            self.destination = destination
        }
    }

    private func handleAssistantAction(_ action: AssistantActionSuggestion) {
        if action.kind == .ping {
            onSwitchTab(.ping)
            return
        }
        if let prompt = action.prompt {
            store.sendMessage(prompt)
        }
        if let destination = action.destination {
            self.destination = destination
        }
    }

    @ViewBuilder
    private func destinationView(for item: SecondaryDestination) -> some View {
        switch item {
        case .reminders:
            RemindersView()
        case .planner:
            DailyPlannerView()
        case .focus:
            FocusTimerView()
        case .notes:
            NotesView()
        case .habits:
            HabitsView()
        }
    }

    @ViewBuilder
    private var profileAvatar: some View {
        if let initial = store.preferredName?.trimmingCharacters(in: .whitespacesAndNewlines).first {
            Text(String(initial).uppercased())
                .font(.caption.weight(.bold))
                .foregroundStyle(.white)
                .frame(width: 34, height: 34)
                .background(Circle().fill(AppTheme.brand))
        } else {
            CircleIconBadge(symbol: "person.fill", tint: AppTheme.brand, size: 34, iconSize: 14)
        }
    }
}

private struct InboxMetric: View {
    let title: String
    let value: Int
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("\(value)")
                .font(.title3.bold())
                .contentTransition(.numericText())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .appCard(tint: tint, cornerRadius: 18)
    }
}

private struct AgendaTimelineCard: View {
    @Environment(BeeveStore.self) private var store

    let reminders: [Reminder]
    let onOpenReminders: () -> Void

    var body: some View {
        GlassSection(title: "今日承诺摘要", symbol: "timeline.selection", tint: AppTheme.ping) {
            VStack(spacing: 0) {
                ForEach(Array(reminders.enumerated()), id: \.element.id) { index, reminder in
                    Button(action: onOpenReminders) {
                        HStack(alignment: .top, spacing: 12) {
                            VStack(spacing: 0) {
                                Circle()
                                    .fill(reminder.priority.color)
                                    .frame(width: 10, height: 10)

                                if index < reminders.count - 1 {
                                    Rectangle()
                                        .fill(reminder.priority.color.opacity(0.20))
                                        .frame(width: 2, height: 44)
                                }
                            }

                            VStack(alignment: .leading, spacing: 5) {
                                Text(store.scheduleText(for: reminder))
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(reminder.priority.color)

                                Text(reminder.title)
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundStyle(.primary)
                                    .multilineTextAlignment(.leading)

                                if !reminder.note.isEmpty {
                                    Text(reminder.note)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .lineLimit(2)
                                }
                            }

                            Spacer()
                        }
                        .padding(.vertical, 8)
                    }
                    .buttonStyle(PressableScaleButtonStyle())
                }
            }
        }
    }
}

#Preview {
    BeevePreview {
        TodayView { _ in }
    }
}
