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
                VStack(alignment: .leading, spacing: DSSpace.lg) {
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
                .padding(.horizontal, DSSpace.md)
                .padding(.top, DSComponent.pageTopInset)
                .padding(.bottom, DSComponent.pageBottomInset)
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
        VStack(alignment: .leading, spacing: DSSpace.xs) {
            Text(store.greetingTitle)
                .font(DSType.pageTitle)
                .foregroundStyle(DSColor.textPrimary)
                .fixedSize(horizontal: false, vertical: true)

            Text(store.formattedToday)
                .font(DSType.bodyMedium)
                .foregroundStyle(DSColor.textSecondary)

            if !store.memorySummaryLines.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: DSSpace.xs) {
                        ForEach(store.memorySummaryLines, id: \.self) { item in
                            Text(item)
                                .font(DSType.captionBold)
                                .foregroundStyle(DSColor.textPrimary)
                                .padding(.horizontal, DSSpace.sm)
                                .padding(.vertical, DSSpace.xxs)
                                .glassCapsule(tint: DSColor.brand)
                        }
                    }
                }
            }
        }
    }

    private var primaryActionCard: some View {
        let action = store.todayPrimaryAction

        return VStack(alignment: .leading, spacing: DSSpace.md) {
            SurfaceKicker(title: "下一步", symbol: "sparkles", tint: DSColor.brand)

            VStack(alignment: .leading, spacing: DSSpace.xs) {
                Text(action.title)
                    .font(DSType.pageTitle)
                    .foregroundStyle(DSColor.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                Text(action.detail)
                    .font(DSType.body)
                    .foregroundStyle(DSColor.textSecondary)
            }

            HStack(spacing: DSSpace.sm) {
                Button {
                    performPrimaryAction(action)
                } label: {
                    Label(action.buttonTitle, systemImage: action.buttonSystemImage)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(DSPrimaryButtonStyle(tint: DSColor.brand))

                VStack(alignment: .leading, spacing: DSSpace.xxs) {
                    Text("\(store.focusScore)")
                        .font(DSType.numeric)
                        .foregroundStyle(DSColor.textPrimary)
                    Text("专注分")
                        .font(DSType.caption)
                        .foregroundStyle(DSColor.textSecondary)
                }
                .padding(.horizontal, DSSpace.sm)
                .padding(.vertical, DSSpace.sm)
                .appCard(tint: DSColor.warning, cornerRadius: DSRadius.card)
            }
        }
        .padding(DSSpace.md)
        .appCard(tint: DSColor.brand, cornerRadius: DSRadius.hero)
    }

    private var inboxSummaryCard: some View {
        GlassSection(title: "今日承诺摘要", symbol: "calendar.badge.clock", tint: DSColor.ping) {
            VStack(spacing: DSSpace.sm) {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: DSSpace.sm) {
                    InboxMetric(title: "今日已排", value: store.todayPlanReminders.count, tint: DSColor.success)
                    InboxMetric(title: "待处理 Ping", value: store.pingBacklogCount, tint: DSColor.ping)
                    InboxMetric(title: "待分拣任务", value: store.inboxReminders.count, tint: DSColor.brand)
                }

                Text(store.triageSummary)
                    .font(DSType.body)
                    .foregroundStyle(DSColor.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)

                HStack(spacing: DSSpace.sm) {
                    Button("查看日程") {
                        destination = .planner
                    }
                    .buttonStyle(DSSecondaryButtonStyle(tint: DSColor.brand))

                    Button("打开 Ping") {
                        onSwitchTab(.ping)
                    }
                    .buttonStyle(DSSecondaryButtonStyle(tint: DSColor.ping))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    private func followUpCard(for suggestion: CompletionSuggestion) -> some View {
        GlassSection(title: "下一步建议", symbol: "arrow.forward.circle.fill", tint: DSColor.success) {
            VStack(alignment: .leading, spacing: DSSpace.sm) {
                Text(suggestion.title)
                    .font(DSType.section)
                    .foregroundStyle(DSColor.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)

                Text(suggestion.detail)
                    .font(DSType.body)
                    .foregroundStyle(DSColor.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)

                HStack(spacing: DSSpace.sm) {
                    Button(suggestion.primaryLabel) {
                        handleFollowUpDestination(suggestion.primaryDestination)
                    }
                    .buttonStyle(DSPrimaryButtonStyle(tint: DSColor.success))

                    if let label = suggestion.secondaryLabel, let destination = suggestion.secondaryDestination {
                        Button(label) {
                            handleFollowUpDestination(destination)
                        }
                        .buttonStyle(DSSecondaryButtonStyle(tint: DSColor.success))
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
                .font(DSType.captionBold)
                .foregroundStyle(DSColor.surface2)
                .frame(width: DSComponent.circleIconSM, height: DSComponent.circleIconSM)
                .background(Circle().fill(DSColor.brand))
        } else {
            CircleIconBadge(
                symbol: "person.fill",
                tint: DSColor.brand,
                size: DSComponent.circleIconSM,
                iconSize: DSComponent.iconSizeSM
            )
        }
    }
}

private struct InboxMetric: View {
    let title: String
    let value: Int
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: DSComponent.textBlockSpacing) {
            Text("\(value)")
                .font(DSType.numeric)
                .foregroundStyle(DSColor.textPrimary)
                .contentTransition(.numericText())
            Text(title)
                .font(DSType.caption)
                .foregroundStyle(DSColor.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(DSSpace.sm)
        .appCard(tint: tint, cornerRadius: DSRadius.card)
    }
}

private struct AgendaTimelineCard: View {
    @Environment(BeeveStore.self) private var store

    let reminders: [Reminder]
    let onOpenReminders: () -> Void

    var body: some View {
        GlassSection(title: "今日承诺摘要", symbol: "timeline.selection", tint: DSColor.ping) {
            VStack(spacing: 0) {
                ForEach(Array(reminders.enumerated()), id: \.element.id) { index, reminder in
                    Button(action: onOpenReminders) {
                        HStack(alignment: .top, spacing: DSSpace.sm) {
                            VStack(spacing: 0) {
                                Circle()
                                    .fill(reminder.priority.color)
                                    .frame(width: 10, height: 10)

                                if index < reminders.count - 1 {
                                    Rectangle()
                                        .fill(reminder.priority.color.opacity(0.20))
                                        .frame(width: 2, height: DSComponent.rowMinHeight)
                                }
                            }

                            VStack(alignment: .leading, spacing: DSComponent.textBlockSpacing) {
                                Text(store.scheduleText(for: reminder))
                                    .font(DSType.captionBold)
                                    .foregroundStyle(reminder.priority.color)

                                Text(reminder.title)
                                    .font(DSType.bodyLarge.weight(.semibold))
                                    .foregroundStyle(DSColor.textPrimary)
                                    .multilineTextAlignment(.leading)
                                    .fixedSize(horizontal: false, vertical: true)

                                if !reminder.note.isEmpty {
                                    Text(reminder.note)
                                        .font(DSType.caption)
                                        .foregroundStyle(DSColor.textSecondary)
                                        .lineLimit(2)
                                }
                            }

                            Spacer()
                        }
                        .padding(.vertical, DSSpace.xs)
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
