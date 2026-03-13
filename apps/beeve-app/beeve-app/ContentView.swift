//
//  ContentView.swift
//  beeve-app
//
//  Created by lang on 2026/3/12.
//

import SwiftUI

private enum AppTab: Hashable {
    case home
    case reminders
    case tools
    case profile
}

private enum ReminderFilter: String, CaseIterable, Identifiable {
    case all
    case inbox
    case today
    case upcoming
    case completed

    var id: String { rawValue }

    var label: String {
        switch self {
        case .all:
            return "全部"
        case .inbox:
            return "收件箱"
        case .today:
            return "今天"
        case .upcoming:
            return "即将"
        case .completed:
            return "已完成"
        }
    }
}

private enum AppSpacing {
    static let pageTop: CGFloat = 12
    static let pageBottom: CGFloat = 42
    static let section: CGFloat = 16
    static let cardContent: CGFloat = 12
}

private struct AppBackgroundView: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        LinearGradient(
            colors: colorScheme == .dark
                ? [
                    Color(red: 0.06, green: 0.07, blue: 0.12),
                    Color(red: 0.10, green: 0.09, blue: 0.18),
                    Color.black
                ]
                : [
                    Color(red: 0.95, green: 0.97, blue: 1.0),
                    Color(red: 0.97, green: 0.95, blue: 1.0),
                    Color(.systemGroupedBackground)
                ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}

private struct AppCardModifier: ViewModifier {
    let tint: Color
    let cornerRadius: CGFloat

    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        content
            .background(background, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(borderColor)
            )
            .shadow(color: shadowColor, radius: 14, y: 8)
    }

    private var background: LinearGradient {
        LinearGradient(
            colors: colorScheme == .dark
                ? [
                    Color(.secondarySystemBackground),
                    tint.opacity(0.20),
                    Color.black.opacity(0.22)
                ]
                : [
                    Color.white.opacity(0.96),
                    tint.opacity(0.10),
                    Color(.systemBackground)
                ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    private var borderColor: Color {
        colorScheme == .dark ? .white.opacity(0.08) : .white.opacity(0.55)
    }

    private var shadowColor: Color {
        colorScheme == .dark ? .black.opacity(0.28) : tint.opacity(0.10)
    }
}

private extension View {
    func appCard(tint: Color = .indigo, cornerRadius: CGFloat = 24) -> some View {
        modifier(AppCardModifier(tint: tint, cornerRadius: cornerRadius))
    }
}

private struct CircleIconBadge: View {
    let symbol: String
    let tint: Color
    var size: CGFloat = 38
    var iconSize: CGFloat = 16

    var body: some View {
        Circle()
            .fill(tint.opacity(0.14))
            .frame(width: size, height: size)
            .overlay(
                Image(systemName: symbol)
                    .font(.system(size: iconSize, weight: .semibold))
                    .foregroundStyle(tint)
            )
    }
}

private struct PriorityPill: View {
    let priority: ReminderPriority

    var body: some View {
        Text(priority.label)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(priority.color.opacity(0.14), in: Capsule())
            .foregroundStyle(priority.color)
    }
}

private struct AssistantToolbarButton: View {
    let action: () -> Void

    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                CircleIconBadge(symbol: "sparkles", tint: .indigo, size: 28, iconSize: 12)
                Text("AI")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
            }
            .padding(.horizontal, 10)
            .frame(height: 36)
            .background(
                colorScheme == .dark ? Color.white.opacity(0.08) : Color.white.opacity(0.78),
                in: Capsule()
            )
            .overlay(
                Capsule()
                    .strokeBorder(colorScheme == .dark ? Color.white.opacity(0.08) : Color.white.opacity(0.42))
            )
        }
        .buttonStyle(.plain)
    }
}

private struct SegmentedFilterBar: View {
    @Binding var selection: ReminderFilter
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(ReminderFilter.allCases) { filter in
                    Button {
                        selection = filter
                    } label: {
                        Text(filter.label)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(selection == filter ? AnyShapeStyle(.white) : AnyShapeStyle(.primary))
                            .padding(.horizontal, 16)
                            .frame(height: 36)
                            .background(
                                selection == filter
                                    ? AnyShapeStyle(
                                        LinearGradient(colors: [Color.indigo, Color.blue], startPoint: .leading, endPoint: .trailing)
                                    )
                                    : AnyShapeStyle(colorScheme == .dark ? Color.white.opacity(0.08) : Color.white.opacity(0.72)),
                                in: Capsule()
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(6)
            .background(
                colorScheme == .dark ? Color.white.opacity(0.05) : Color.white.opacity(0.46),
                in: Capsule()
            )
        }
    }
}

private struct SectionCard<Content: View>: View {
    let title: String
    let tint: Color
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .padding(.horizontal, 4)

            VStack(spacing: AppSpacing.cardContent) {
                content
            }
        }
        .padding(16)
        .appCard(tint: tint, cornerRadius: 26)
    }
}

struct ContentView: View {
    @State private var selectedTab: AppTab = .home
    @State private var isPresentingAddReminder = false
    @State private var isPresentingAssistant = false

    var body: some View {
        ZStack {
            AppBackgroundView()

            TabView(selection: $selectedTab) {
                HomeDashboardView(
                    onAddReminder: { isPresentingAddReminder = true },
                    onOpenReminders: { selectedTab = .reminders },
                    onOpenTools: { selectedTab = .tools },
                    onOpenAssistant: { isPresentingAssistant = true }
                )
                .tabItem {
                    Label("首页", systemImage: "house")
                }
                .tag(AppTab.home)

                RemindersView(
                    onAddReminder: { isPresentingAddReminder = true },
                    onOpenAssistant: { isPresentingAssistant = true }
                )
                .tabItem {
                    Label("提醒", systemImage: "checklist")
                }
                .tag(AppTab.reminders)

                ToolsView(onOpenAssistant: { isPresentingAssistant = true })
                    .tabItem {
                        Label("工具", systemImage: "square.grid.2x2")
                    }
                    .tag(AppTab.tools)

                ProfileView(onOpenAssistant: { isPresentingAssistant = true })
                    .tabItem {
                        Label("我的", systemImage: "person.crop.circle")
                    }
                    .tag(AppTab.profile)
            }
            .tint(.indigo)
        }
        .sheet(isPresented: $isPresentingAddReminder) {
            AddReminderSheet()
                .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $isPresentingAssistant) {
            AssistantSheet()
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
        }
    }
}

private struct HomeDashboardView: View {
    @Environment(BeeveStore.self) private var store

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
                        homeSuggestion: store.homeSuggestion,
                        onOpenAssistant: onOpenAssistant
                    )

                    TriageCard(summary: store.triageSummary, inboxCount: store.inboxReminders.count, todayCount: store.todayReminders.count)

                    if let nextReminder = store.nextImportantReminder {
                        NextReminderCard(reminder: nextReminder, onOpenReminders: onOpenReminders)
                    }

                    if let suggestion = store.completionSuggestion {
                        CompletionSuggestionCard(
                            suggestion: suggestion,
                            onTapDestination: { destination in
                                store.clearCompletionSuggestion()
                                switch destination {
                                case .reminders:
                                    onOpenReminders()
                                case .tools:
                                    onOpenTools()
                                case .assistant:
                                    onOpenAssistant()
                                }
                            },
                            onDismiss: {
                                store.clearCompletionSuggestion()
                            }
                        )
                    }

                    QuickActionsSection(
                        onAddReminder: onAddReminder,
                        onOpenReminders: onOpenReminders,
                        onOpenTools: onOpenTools,
                        onOpenAssistant: onOpenAssistant
                    )

                    GlassSection(title: "今天进行中", symbol: "bolt.badge.clock", tint: .blue) {
                        VStack(spacing: 12) {
                            ForEach(store.pendingPreviewReminders) { reminder in
                                ReminderPreviewRow(reminder: reminder) {
                                    store.toggleReminder(reminder)
                                }
                            }
                        }
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
                    AssistantToolbarButton(action: onOpenAssistant)
                }
            }
        }
    }
}

private struct HeroOverviewCard: View {
    let focusScore: Int
    let completedCount: Int
    let pendingCount: Int
    let homeSuggestion: String
    let onOpenAssistant: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 8) {
                    Label("你的 AI 助理已在线", systemImage: "sparkles")
                        .font(.headline)
                        .foregroundStyle(.white.opacity(0.9))
                    Text("今天先做最重要的一件事。")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
                Circle()
                    .fill(.white.opacity(0.16))
                    .frame(width: 48, height: 48)
                    .overlay(
                        Image(systemName: "brain.head.profile")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundStyle(.white)
                    )
            }

            Text(homeSuggestion)
                .font(.body)
                .foregroundStyle(.white.opacity(0.84))

            HStack(spacing: 12) {
                HeroMetric(title: "专注分", value: "\(focusScore)")
                HeroMetric(title: "已完成", value: "\(completedCount)")
                HeroMetric(title: "待处理", value: "\(pendingCount)")
            }

            Button("让 AI 帮我安排下一步", action: onOpenAssistant)
                .buttonStyle(.borderedProminent)
                .tint(.white)
                .foregroundStyle(.indigo)
        }
        .padding(22)
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.34, green: 0.30, blue: 0.95),
                    Color(red: 0.18, green: 0.55, blue: 0.98),
                    Color(red: 0.10, green: 0.14, blue: 0.32)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 30, style: .continuous)
        )
        .shadow(color: Color.indigo.opacity(0.28), radius: 18, y: 10)
    }
}

private struct HeroMetric: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.headline)
            Text(title)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.72))
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.14), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(.white.opacity(0.12))
        )
        .foregroundStyle(.white)
    }
}

private struct GlassSection<Content: View>: View {
    let title: String
    let symbol: String
    let tint: Color
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 10) {
                CircleIconBadge(symbol: symbol, tint: tint, size: 32, iconSize: 13)
                Text(title)
                    .font(.headline)
            }

            content
        }
        .padding(18)
        .appCard(tint: tint, cornerRadius: 26)
    }
}

private struct TriageCard: View {
    let summary: String
    let inboxCount: Int
    let todayCount: Int

    var body: some View {
        GlassSection(title: "助理分拣建议", symbol: "tray.and.arrow.down.fill", tint: .purple) {
            VStack(alignment: .leading, spacing: 12) {
                Text(summary)
                    .font(.body)

                HStack(spacing: 12) {
                    TriageBadge(title: "收件箱", value: "\(inboxCount)")
                    TriageBadge(title: "今天", value: "\(todayCount)")
                }
            }
        }
    }
}

private struct TriageBadge: View {
    let title: String
    let value: String

    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.headline)
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            (colorScheme == .dark ? Color.white.opacity(0.08) : Color.white.opacity(0.16)),
            in: RoundedRectangle(cornerRadius: 18, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(colorScheme == .dark ? Color.white.opacity(0.06) : Color.white.opacity(0.32))
        )
    }
}

private struct NextReminderCard: View {
    let reminder: ReminderItem
    let onOpenReminders: () -> Void

    var body: some View {
        GlassSection(title: "下一件重要的事", symbol: "flag.fill", tint: .orange) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text(reminder.title)
                        .font(.title3.bold())
                    Spacer()
                    PriorityPill(priority: reminder.priority)
                }

                Text("\(reminder.category.label) · \(reminder.dueDate?.formatted(date: .omitted, time: .shortened) ?? "待分拣")")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Button("查看提醒列表", action: onOpenReminders)
                    .buttonStyle(.borderedProminent)
            }
        }
    }
}

private struct CompletionSuggestionCard: View {
    let suggestion: CompletionSuggestion
    let onTapDestination: (FollowUpDestination) -> Void
    let onDismiss: () -> Void

    var body: some View {
        GlassSection(title: suggestion.title, symbol: "checkmark.circle.badge.sparkles", tint: .green) {
            VStack(alignment: .leading, spacing: 12) {
                Text(suggestion.detail)
                    .font(.body)
                    .foregroundStyle(.secondary)

                VStack(alignment: .leading, spacing: 10) {
                    Button(suggestion.primaryLabel) {
                        onTapDestination(suggestion.primaryDestination)
                    }
                    .buttonStyle(.borderedProminent)
                    .frame(maxWidth: .infinity, alignment: .leading)

                    if let label = suggestion.secondaryLabel, let destination = suggestion.secondaryDestination {
                        Button(label) {
                            onTapDestination(destination)
                        }
                        .buttonStyle(.bordered)
                    }

                    Button("关闭", action: onDismiss)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}

private struct QuickActionsSection: View {
    let onAddReminder: () -> Void
    let onOpenReminders: () -> Void
    let onOpenTools: () -> Void
    let onOpenAssistant: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.cardContent) {
            Text("快速操作")
                .font(.title3.bold())

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                QuickActionButton(title: "快速收集", subtitle: "先记下来，别丢", symbol: "plus.circle.fill", tint: .blue, action: onAddReminder)
                QuickActionButton(title: "清空收件箱", subtitle: "安排时间和优先级", symbol: "tray.full.fill", tint: .purple, action: onOpenReminders)
                QuickActionButton(title: "启动工具", subtitle: "开始专注或记录", symbol: "bolt.fill", tint: .orange, action: onOpenTools)
                QuickActionButton(title: "打开 AI", subtitle: "随时问下一步", symbol: "sparkles", tint: .indigo, action: onOpenAssistant)
            }
        }
    }
}

private struct QuickActionButton: View {
    let title: String
    let subtitle: String
    let symbol: String
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 10) {
                CircleIconBadge(symbol: symbol, tint: tint, size: 40, iconSize: 16)

                Text(title)
                    .font(.headline)
                    .foregroundStyle(.primary)

                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(18)
            .frame(maxWidth: .infinity, minHeight: 136, alignment: .leading)
            .appCard(tint: tint, cornerRadius: 24)
        }
        .buttonStyle(.plain)
    }
}

private struct ReminderPreviewRow: View {
    @Environment(BeeveStore.self) private var store

    let reminder: ReminderItem
    let onToggle: () -> Void

    var body: some View {
        Button(action: onToggle) {
            HStack(spacing: 14) {
                Image(systemName: reminder.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(reminder.isCompleted ? Color.green : Color.secondary)

                VStack(alignment: .leading, spacing: 4) {
                    Text(reminder.title)
                        .font(.headline)
                        .strikethrough(reminder.isCompleted)
                        .foregroundStyle(reminder.isCompleted ? .secondary : .primary)

                    HStack(spacing: 8) {
                        PriorityPill(priority: reminder.priority)
                        Text(store.scheduleText(for: reminder))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
            .padding(16)
            .appCard(tint: reminder.priority.color, cornerRadius: 20)
        }
        .buttonStyle(.plain)
    }
}

private struct RemindersView: View {
    @Environment(BeeveStore.self) private var store
    @State private var selectedFilter: ReminderFilter = .all

    let onAddReminder: () -> Void
    let onOpenAssistant: () -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                HStack {
                    Text("从收件箱到今天要做的事，尽量在一个界面完成分拣。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Spacer()
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)

                SegmentedFilterBar(selection: $selectedFilter)
                    .padding(.horizontal)
                    .padding(.top, AppSpacing.section)

                ScrollView {
                    VStack(alignment: .leading, spacing: AppSpacing.section) {
                        if sections.isEmpty {
                            ContentUnavailableView(
                                "当前筛选下没有事项",
                                systemImage: "line.3.horizontal.decrease.circle",
                                description: Text("试试切换筛选，或先快速收集一条新提醒。")
                            )
                            .frame(maxWidth: .infinity)
                            .padding(.top, 36)
                        } else {
                            ForEach(sections, id: \.title) { section in
                                SectionCard(title: section.title, tint: section.tint) {
                                    ForEach(section.items) { reminder in
                                        ReminderRow(
                                            reminder: reminder,
                                            scheduleText: store.scheduleText(for: reminder),
                                            onToggle: { store.toggleReminder(reminder) },
                                            onTonight: { store.assignTonight(reminder) },
                                            onTomorrow: { store.assignTomorrowMorning(reminder) },
                                            onDelete: { store.deleteReminder(reminder) }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.section)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .navigationTitle("提醒")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton(action: onOpenAssistant)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("新增", systemImage: "plus", action: onAddReminder)
                }
            }
        }
    }

    private var sections: [ReminderSection] {
        switch selectedFilter {
        case .all:
            return [
                ReminderSection(title: "收件箱", items: store.inboxReminders, tint: .purple),
                ReminderSection(title: "今天", items: store.todayReminders, tint: .blue),
                ReminderSection(title: "即将到来", items: store.upcomingReminders, tint: .orange)
            ]
            .filter { !$0.items.isEmpty }
        case .inbox:
            return [ReminderSection(title: "收件箱", items: store.inboxReminders, tint: .purple)].filter { !$0.items.isEmpty }
        case .today:
            return [ReminderSection(title: "今天", items: store.todayReminders, tint: .blue)].filter { !$0.items.isEmpty }
        case .upcoming:
            return [ReminderSection(title: "即将到来", items: store.upcomingReminders, tint: .orange)].filter { !$0.items.isEmpty }
        case .completed:
            return [ReminderSection(title: "已完成", items: store.completedReminders, tint: .green)].filter { !$0.items.isEmpty }
        }
    }
}

private struct ReminderSection {
    let title: String
    let items: [ReminderItem]
    let tint: Color
}

private struct ReminderRow: View {
    let reminder: ReminderItem
    let scheduleText: String
    let onToggle: () -> Void
    let onTonight: () -> Void
    let onTomorrow: () -> Void
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button(action: onToggle) {
                Image(systemName: reminder.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(reminder.isCompleted ? Color.green : reminder.priority.color)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 6) {
                Text(reminder.title)
                    .font(.headline)
                    .strikethrough(reminder.isCompleted)
                    .foregroundStyle(reminder.isCompleted ? .secondary : .primary)

                if !reminder.note.isEmpty {
                    Text(reminder.note)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 8) {
                    PriorityPill(priority: reminder.priority)
                    Text(scheduleText)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }
        }
        .padding(14)
        .background(reminder.priority.color.opacity(0.06), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
            Button(reminder.isCompleted ? "恢复" : "完成", action: onToggle)
                .tint(reminder.isCompleted ? .orange : .green)
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button("删除", role: .destructive, action: onDelete)

            if !reminder.isCompleted {
                Button("明早", action: onTomorrow)
                    .tint(.blue)
                Button("今晚", action: onTonight)
                    .tint(.indigo)
            }
        }
    }
}

private struct ToolsView: View {
    @Environment(BeeveStore.self) private var store
    @State private var activeSummary: String?

    let onOpenAssistant: () -> Void

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    HeroMiniBanner(
                        title: "工具箱",
                        subtitle: "把高频动作收在一个地方，减少在不同 App 之间来回切换。",
                        symbol: "square.grid.2x2.fill",
                        tint: .orange
                    )

                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(store.tools) { tool in
                            Button {
                                activeSummary = store.runTool(tool)
                            } label: {
                                ToolCard(tool: tool)
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    if let activeSummary {
                        GlassSection(title: "刚刚完成", symbol: "wand.and.stars", tint: .orange) {
                            VStack(alignment: .leading, spacing: 10) {
                                Text(activeSummary)
                                    .font(.body)
                                    .foregroundStyle(.secondary)

                                Button("让 AI 接着安排", action: onOpenAssistant)
                                    .buttonStyle(.bordered)
                            }
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .navigationTitle("工具")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton(action: onOpenAssistant)
                }
            }
        }
    }
}

private struct ToolCard: View {
    let tool: ToolItem

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            CircleIconBadge(symbol: tool.symbolName, tint: tool.tint, size: 40, iconSize: 16)

            Text(tool.title)
                .font(.headline)
                .foregroundStyle(.primary)

            Text(tool.description)
                .font(.caption)
                .foregroundStyle(.secondary)

            Text(tool.statusText)
                .font(.caption.weight(.semibold))
                .foregroundStyle(tool.tint)
        }
        .padding(18)
        .frame(maxWidth: .infinity, minHeight: 154, alignment: .leading)
        .appCard(tint: tool.tint, cornerRadius: 24)
    }
}

private struct ProfileView: View {
    @Environment(BeeveStore.self) private var store

    let onOpenAssistant: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 14) {
                            Circle()
                                .fill(
                                    LinearGradient(colors: [Color.indigo, Color.blue], startPoint: .topLeading, endPoint: .bottomTrailing)
                                )
                                .frame(width: 64, height: 64)
                                .overlay(
                                    Text("L")
                                        .font(.title2.bold())
                                        .foregroundStyle(.white)
                                )

                            VStack(alignment: .leading, spacing: 4) {
                                Text("Lang")
                                    .font(.title2.bold())
                                Text("个人 AI 助理正在逐步了解你的节奏")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }

                    HeroMiniBanner(
                        title: "本周状态",
                        subtitle: "已完成 \(store.completedCount) 项，当前待处理 \(store.pendingCount) 项。继续保持轻量推进节奏。",
                        symbol: "chart.bar.fill",
                        tint: .indigo
                    )

                    GlassSection(title: "偏好设置", symbol: "slider.horizontal.3", tint: .indigo) {
                        VStack(spacing: 14) {
                            ProfileSettingRow(title: "AI 主动建议", subtitle: "保持开启，适时提醒你下一步", symbol: "sparkles", tint: .indigo)
                            ProfileSettingRow(title: "默认快速收集", subtitle: "先进入收件箱，稍后再分拣", symbol: "tray.full", tint: .purple)
                            ProfileSettingRow(title: "专注节奏", subtitle: "25 分钟专注 + 5 分钟回顾", symbol: "timer", tint: .orange)
                        }
                    }

                    GlassSection(title: "账号与数据", symbol: "person.text.rectangle", tint: .blue) {
                        VStack(spacing: 12) {
                            ProfileActionButton(title: "让 AI 解释当前建议", subtitle: "了解为什么此刻推荐你先做这些事", symbol: "bubble.left.and.exclamationmark.bubble.right", tint: .blue, action: onOpenAssistant)
                            ProfileActionButton(title: "通知与提醒", subtitle: "下一步可接入本地通知与日程时间块", symbol: "bell.badge", tint: .orange, action: {})
                            ProfileActionButton(title: "隐私与数据", subtitle: "未来可在这里管理上下文记忆和同步设置", symbol: "lock.shield", tint: .green, action: {})
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .navigationTitle("我的")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton(action: onOpenAssistant)
                }
            }
        }
    }
}

private struct HeroMiniBanner: View {
    let title: String
    let subtitle: String
    let symbol: String
    let tint: Color

    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            CircleIconBadge(symbol: symbol, tint: tint, size: 44, iconSize: 18)

            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.headline)
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(18)
        .background(
            LinearGradient(
                colors: colorScheme == .dark
                    ? [Color(.secondarySystemBackground), tint.opacity(0.24)]
                    : [tint.opacity(0.18), Color.white.opacity(0.92)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 24, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .strokeBorder(colorScheme == .dark ? Color.white.opacity(0.08) : Color.white.opacity(0.45))
        )
    }
}

private struct ProfileSettingRow: View {
    let title: String
    let subtitle: String
    let symbol: String
    let tint: Color

    var body: some View {
        HStack(spacing: 12) {
            CircleIconBadge(symbol: symbol, tint: tint)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
    }
}

private struct ProfileActionButton: View {
    let title: String
    let subtitle: String
    let symbol: String
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                CircleIconBadge(symbol: symbol, tint: tint)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
        }
        .buttonStyle(.plain)
    }
}

private struct AssistantSheet: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var draft = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        HeroMiniBanner(
                            title: "Beeve AI",
                            subtitle: store.assistantContextSummary,
                            symbol: "sparkles",
                            tint: .indigo
                        )

                        ForEach(store.messages) { message in
                            MessageBubble(message: message)
                        }
                    }
                    .padding()
                    .padding(.bottom, 8)
                }

                Divider()

                VStack(alignment: .leading, spacing: 12) {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(store.suggestedAssistantPrompts(), id: \.self) { prompt in
                                Button(prompt) {
                                    store.sendMessage(prompt)
                                }
                                .buttonStyle(.bordered)
                            }
                        }
                    }

                    Text("AI 回复为本地演示结果，但交互形态已按全局助理来设计。")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.indigo.opacity(0.08), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

                    HStack(alignment: .bottom, spacing: 12) {
                        TextField("比如：帮我拆解今天的任务", text: $draft, axis: .vertical)
                            .textFieldStyle(.roundedBorder)
                            .lineLimit(1...4)

                        Button {
                            store.sendMessage(draft)
                            draft = ""
                        } label: {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.system(size: 30))
                        }
                        .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
                .padding()
                .background(AppBackgroundView())
            }
            .navigationTitle("Beeve AI")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("关闭") {
                        dismiss()
                    }
                }
            }
        }
    }
}

private struct MessageBubble: View {
    let message: AssistantMessage

    var body: some View {
        HStack {
            if message.role == .assistant {
                bubble
                Spacer(minLength: 40)
            } else {
                Spacer(minLength: 40)
                bubble
            }
        }
    }

    private var bubble: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(message.role == .assistant ? "Beeve 助手" : "你")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)

            Text(message.content)
                .font(.body)
                .foregroundStyle(message.role == .assistant ? AnyShapeStyle(.primary) : AnyShapeStyle(.white))
        }
        .padding(14)
        .background(backgroundStyle, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private var backgroundStyle: AnyShapeStyle {
        if message.role == .assistant {
            AnyShapeStyle(
                LinearGradient(
                    colors: [Color.white.opacity(0.9), Color.indigo.opacity(0.08)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        } else {
            AnyShapeStyle(
                LinearGradient(
                    colors: [Color.blue, Color.indigo],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        }
    }
}

private struct AddReminderSheet: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var note = ""
    @State private var dueDate = Date.now.addingTimeInterval(60 * 60)
    @State private var shouldSchedule = false
    @State private var category: ReminderCategory = .work
    @State private var priority: ReminderPriority = .medium

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackgroundView()

                ScrollView {
                    VStack(spacing: AppSpacing.section) {
                        GlassSection(title: "事项", symbol: "square.and.pencil", tint: .blue) {
                            VStack(spacing: 12) {
                                TextField("提醒标题", text: $title)
                                    .textFieldStyle(.roundedBorder)

                                TextField("备注（可选）", text: $note, axis: .vertical)
                                    .textFieldStyle(.roundedBorder)
                                    .lineLimit(2...4)
                            }
                        }

                        GlassSection(title: "安排方式", symbol: "calendar.badge.clock", tint: .purple) {
                            VStack(alignment: .leading, spacing: 12) {
                                Toggle("立即安排时间", isOn: $shouldSchedule)
                                Text(shouldSchedule ? "保存后会直接进入今天/即将列表。" : "不安排时间会先进入收件箱，稍后再分拣。")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        if shouldSchedule {
                            GlassSection(title: "时间", symbol: "clock.fill", tint: .orange) {
                                VStack(alignment: .leading, spacing: 12) {
                                    DatePicker("时间", selection: $dueDate)

                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: 8) {
                                            QuickTimeButton(title: "1小时后") {
                                                dueDate = .now.addingTimeInterval(60 * 60)
                                            }
                                            QuickTimeButton(title: "今晚 20:00") {
                                                dueDate = suggestedTonightDate()
                                            }
                                            QuickTimeButton(title: "明早 09:00") {
                                                dueDate = suggestedTomorrowMorningDate()
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        GlassSection(title: "分类与优先级", symbol: "line.3.horizontal.decrease.circle", tint: .indigo) {
                            VStack(spacing: 12) {
                                Picker("分类", selection: $category) {
                                    ForEach(ReminderCategory.allCases) { item in
                                        Text(item.label).tag(item)
                                    }
                                }
                                .pickerStyle(.menu)

                                Picker("优先级", selection: $priority) {
                                    ForEach(ReminderPriority.allCases) { item in
                                        Text(item.label).tag(item)
                                    }
                                }
                                .pickerStyle(.segmented)
                            }
                        }
                    }
                    .padding()
                    .padding(.bottom, 24)
                }
            }
            .navigationTitle("快速收集")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button("保存") {
                        store.addReminder(
                            title: title,
                            note: note,
                            dueDate: shouldSchedule ? dueDate : nil,
                            category: category,
                            priority: priority
                        )
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }

    private func suggestedTonightDate() -> Date {
        let calendar = Calendar.current
        return calendar.date(bySettingHour: 20, minute: 0, second: 0, of: .now) ?? .now
    }

    private func suggestedTomorrowMorningDate() -> Date {
        let calendar = Calendar.current
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: .now) ?? .now
        return calendar.date(bySettingHour: 9, minute: 0, second: 0, of: tomorrow) ?? tomorrow
    }
}

private struct QuickTimeButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(title, action: action)
            .buttonStyle(.bordered)
    }
}

#Preview {
    ContentView()
        .environment(BeeveStore())
}
