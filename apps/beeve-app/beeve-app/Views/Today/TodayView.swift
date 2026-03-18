import SwiftUI

struct TodayView: View {
    @Environment(BeeveStore.self) private var store
    @State private var destination: SecondaryDestination?
    @State private var showAssistant = false

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

                    quickAccessGrid
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("Today")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton { showAssistant = true }
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
        GlassSection(title: "待处理收件箱", symbol: "tray.full", tint: AppTheme.capture) {
            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    InboxMetric(title: "待理解记录", value: store.captureBacklogCount, tint: AppTheme.capture)
                    InboxMetric(title: "待分拣任务", value: store.inboxReminders.count, tint: AppTheme.brand)
                }

                Text(store.triageSummary)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: 10) {
                    Button("打开 Capture") {
                        onSwitchTab(.capture)
                    }
                    .buttonStyle(.bordered)

                    Button("查看任务") {
                        destination = .reminders
                    }
                    .buttonStyle(.bordered)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    private var quickAccessGrid: some View {
        GlassSection(title: "常用入口", symbol: "square.grid.2x2.fill", tint: AppTheme.warning) {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                ForEach(quickLinks) { link in
                    Button {
                        destination = link.destination
                    } label: {
                        VStack(alignment: .leading, spacing: 10) {
                            CircleIconBadge(symbol: link.symbol, tint: link.tint, size: 40, iconSize: 16)
                            Text(link.title)
                                .font(.headline)
                                .foregroundStyle(.primary)
                            Text(link.detail)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.leading)
                        }
                        .frame(maxWidth: .infinity, minHeight: 132, alignment: .topLeading)
                        .padding(16)
                        .appCard(tint: link.tint, cornerRadius: 20)
                    }
                    .buttonStyle(.plain)
                    .buttonStyle(PressableScaleButtonStyle())
                }
            }
        }
    }

    private func followUpCard(for suggestion: CompletionSuggestion) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            SurfaceKicker(title: suggestion.title, symbol: "checkmark.circle.fill", tint: AppTheme.success)
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
        .padding(18)
        .appCard(tint: AppTheme.success, cornerRadius: 26)
    }

    private func handleFollowUpDestination(_ destination: FollowUpDestination) {
        switch destination {
        case .reminders:
            self.destination = .reminders
        case .tools:
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
        if action.kind == .capture {
            onSwitchTab(.capture)
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

    private var quickLinks: [QuickLink] {
        [
            QuickLink(title: "任务", detail: "收件箱、今天、即将到来", symbol: "checklist", tint: AppTheme.brand, destination: .reminders),
            QuickLink(title: "规划", detail: "把今天排成一条时间线", symbol: "calendar", tint: AppTheme.capture, destination: .planner),
            QuickLink(title: "专注", detail: "开始 \(store.defaultFocusDuration) 分钟深度工作", symbol: "timer", tint: AppTheme.warning, destination: .focus),
            QuickLink(title: "笔记", detail: "沉淀长文本和灵感脉络", symbol: "note.text", tint: AppTheme.success, destination: .notes),
        ]
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

private struct QuickLink: Identifiable {
    let id = UUID()
    let title: String
    let detail: String
    let symbol: String
    let tint: Color
    let destination: SecondaryDestination
}

#Preview {
    BeevePreview {
        TodayView { _ in }
    }
}
