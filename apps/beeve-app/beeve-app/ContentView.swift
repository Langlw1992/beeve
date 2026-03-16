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
        (colorScheme == .dark ? Color(.systemGroupedBackground) : Color(.secondarySystemGroupedBackground))
            .ignoresSafeArea()
    }
}

private struct AppCardModifier: ViewModifier {
    let tint: Color
    let cornerRadius: CGFloat

    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(backgroundStyle)
            )
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [tint.opacity(colorScheme == .dark ? 0.14 : 0.08), .clear],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(borderColor)
            )
            .shadow(color: shadowColor, radius: 8, y: 3)
    }

    private var backgroundStyle: AnyShapeStyle {
        AnyShapeStyle(colorScheme == .dark ? Color(.secondarySystemGroupedBackground) : Color(.systemBackground))
    }

    private var borderColor: Color {
        colorScheme == .dark ? .white.opacity(0.06) : tint.opacity(0.10)
    }

    private var shadowColor: Color {
        colorScheme == .dark ? .black.opacity(0.12) : .black.opacity(0.04)
    }
}

private extension View {
    func appCard(tint: Color = .indigo, cornerRadius: CGFloat = 24) -> some View {
        modifier(AppCardModifier(tint: tint, cornerRadius: cornerRadius))
    }

    func immersiveScrollMotion() -> some View {
        scrollTransition(axis: .vertical) { content, phase in
            content
                .scaleEffect(phase.isIdentity ? 1 : 0.97)
                .opacity(phase.isIdentity ? 1 : 0.9)
                .offset(y: phase.isIdentity ? 0 : 10)
        }
    }
}

private struct PressableScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .brightness(configuration.isPressed ? -0.02 : 0)
            .animation(.spring(response: 0.22, dampingFraction: 0.78), value: configuration.isPressed)
    }
}

private struct AuroraBackdrop: View {
    let primary: Color
    let secondary: Color
    var cornerRadius: CGFloat = 30

    var body: some View {
        GeometryReader { geometry in
            TimelineView(.animation(minimumInterval: 1 / 24)) { context in
                let time = context.date.timeIntervalSinceReferenceDate

                ZStack {
                    Circle()
                        .fill(primary.opacity(0.22))
                        .frame(width: geometry.size.width * 0.72)
                        .blur(radius: 24)
                        .offset(
                            x: sin(time * 0.72) * 34 - geometry.size.width * 0.18,
                            y: cos(time * 0.54) * 26 - geometry.size.height * 0.20
                        )

                    Circle()
                        .fill(secondary.opacity(0.18))
                        .frame(width: geometry.size.width * 0.64)
                        .blur(radius: 22)
                        .offset(
                            x: cos(time * 0.58) * 42 + geometry.size.width * 0.2,
                            y: sin(time * 0.66) * 30 + geometry.size.height * 0.12
                        )

                    LinearGradient(
                        colors: [
                            .white.opacity(0.18),
                            .clear,
                            secondary.opacity(0.08),
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                }
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            }
        }
        .allowsHitTesting(false)
    }
}

private struct LiveStatusPill: View {
    let title: String
    let tint: Color

    var body: some View {
        HStack(spacing: 8) {
            TimelineView(.animation(minimumInterval: 1 / 8)) { context in
                let time = context.date.timeIntervalSinceReferenceDate
                Circle()
                    .fill(tint)
                    .frame(width: 8, height: 8)
                    .scaleEffect(0.82 + abs(sin(time * 2.2)) * 0.34)
                    .shadow(color: tint.opacity(0.45), radius: 8)
            }

            Text(title)
                .font(.caption.weight(.bold))
                .foregroundStyle(.primary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.ultraThinMaterial, in: Capsule())
        .overlay(
            Capsule()
                .strokeBorder(tint.opacity(0.16))
        )
    }
}

private struct MetricMiniBars: View {
    let tint: Color
    let level: Double

    var body: some View {
        HStack(alignment: .bottom, spacing: 4) {
            ForEach(0..<5, id: \.self) { index in
                RoundedRectangle(cornerRadius: 3, style: .continuous)
                    .fill(index < highlightedBars ? tint : tint.opacity(0.18))
                    .frame(width: 6, height: CGFloat(8 + index * 5))
            }
        }
        .animation(.snappy, value: highlightedBars)
    }

    private var highlightedBars: Int {
        max(1, min(5, Int((level * 5).rounded(.up))))
    }
}

private struct DockGlowOverlay: View {
    let tint: Color
    var cornerRadius: CGFloat = 22

    var body: some View {
        GeometryReader { geometry in
            TimelineView(.animation(minimumInterval: 1 / 20)) { context in
                let time = context.date.timeIntervalSinceReferenceDate

                LinearGradient(
                    colors: [
                        .clear,
                        tint.opacity(0.22),
                        .white.opacity(0.18),
                        .clear,
                    ],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(width: geometry.size.width * 0.52)
                .blur(radius: 14)
                .offset(x: sin(time * 0.9) * geometry.size.width * 0.22)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
        .allowsHitTesting(false)
    }
}

private struct CircleIconBadge: View {
    let symbol: String
    let tint: Color
    var size: CGFloat = 38
    var iconSize: CGFloat = 16

    var body: some View {
        Circle()
            .fill(tint.opacity(0.10))
            .frame(width: size, height: size)
            .overlay(
                Image(systemName: symbol)
                    .font(.system(size: iconSize, weight: .semibold))
                    .foregroundStyle(tint)
            )
    }
}

private struct SurfaceKicker: View {
    let title: String
    let symbol: String
    let tint: Color

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: symbol)
                .font(.caption.weight(.bold))
            Text(title.uppercased())
                .font(.caption.weight(.bold))
                .lineLimit(1)
        }
        .foregroundStyle(tint)
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(tint.opacity(0.08), in: Capsule())
        .overlay(
            Capsule()
                .strokeBorder(tint.opacity(0.12))
        )
    }
}

private struct PriorityPill: View {
    let priority: ReminderPriority

    var body: some View {
        Text(priority.label)
            .font(.caption.weight(.medium))
            .padding(.horizontal, 9)
            .padding(.vertical, 4)
            .background(priority.color.opacity(0.10), in: Capsule())
            .foregroundStyle(priority.color.opacity(0.9))
    }
}

private struct AssistantToolbarButton: View {
    let action: () -> Void

    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: "lightbulb")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.secondary)
                Text("建议")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
            }
            .padding(.horizontal, 10)
            .frame(height: 36)
            .background(
                colorScheme == .dark ? Color.white.opacity(0.06) : Color(.systemBackground),
                in: Capsule()
            )
            .overlay(
                Capsule()
                    .strokeBorder(colorScheme == .dark ? Color.white.opacity(0.08) : Color.black.opacity(0.08))
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
                                    ? AnyShapeStyle(Color.accentColor)
                                    : AnyShapeStyle(colorScheme == .dark ? Color.white.opacity(0.04) : Color(.systemBackground)),
                                in: Capsule()
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(6)
            .background(
                colorScheme == .dark ? Color.white.opacity(0.04) : Color.black.opacity(0.03),
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

private struct HeroOverviewCard: View {
    let focusScore: Int
    let completedCount: Int
    let pendingCount: Int
    let inboxCount: Int
    let homeSuggestion: String
    let onOpenAssistant: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            HStack(alignment: .center, spacing: 18) {
                VStack(alignment: .leading, spacing: 8) {
                    SurfaceKicker(
                        title: pendingCount == 0 ? "Ready" : "Today",
                        symbol: "sparkles",
                        tint: pendingCount == 0 ? .green : .indigo
                    )
                    Text("先把今天收拢成几个清晰动作。")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(.primary)
                        .fixedSize(horizontal: false, vertical: true)

                    Text(homeSuggestion)
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .padding(.top, 2)
                }

                Spacer(minLength: 12)

                DailyProgressRing(
                    progress: progress,
                    score: focusScore,
                    completedCount: completedCount,
                    pendingCount: pendingCount
                )
            }

            HStack(spacing: 12) {
                HeroMetric(title: "专注分", value: "\(focusScore)", tint: .indigo, level: Double(focusScore) / 100)
                HeroMetric(title: "已完成", value: "\(completedCount)", tint: .green, level: min(1, Double(completedCount) / 6))
                HeroMetric(title: "收件箱", value: "\(inboxCount)", tint: .purple, level: min(1, Double(inboxCount) / 6))
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ActionChip(title: pendingCount == 0 ? "今天比较轻" : "还有 \(pendingCount) 项待处理", systemImage: "sparkle.magnifyingglass", tint: .indigo, action: onOpenAssistant)
                    ActionChip(title: completedCount == 0 ? "开始第一个完成" : "已推进 \(completedCount) 项", systemImage: "checkmark.circle", tint: .green, action: onOpenAssistant)
                    ActionChip(title: "查看建议", systemImage: "lightbulb", tint: .orange, action: onOpenAssistant)
                }
            }
        }
        .padding(22)
        .appCard(tint: .blue, cornerRadius: 30)
    }

    private var progress: Double {
        let total = completedCount + pendingCount
        guard total > 0 else { return 0 }
        return Double(completedCount) / Double(total)
    }
}

private struct HeroMetric: View {
    let title: String
    let value: String
    let tint: Color
    let level: Double

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            MetricMiniBars(tint: tint, level: level)

            Text(value)
                .font(.headline)
                .contentTransition(.numericText())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(tint.opacity(0.08), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(tint.opacity(0.10))
        )
        .animation(.snappy, value: value)
    }
}

private struct DailyProgressRing: View {
    let progress: Double
    let score: Int
    let completedCount: Int
    let pendingCount: Int

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.primary.opacity(0.08), lineWidth: 10)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    AngularGradient(colors: [.blue, .indigo, .purple], center: .center),
                    style: StrokeStyle(lineWidth: 10, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.snappy(duration: 0.45), value: progress)

            VStack(spacing: 2) {
                Text("\(score)")
                    .font(.title2.bold())
                    .contentTransition(.numericText())
                Text("\(completedCount)/\(completedCount + pendingCount)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(width: 92, height: 92)
        .scaleEffect(completedCount > 0 ? 1.0 : 0.96)
        .animation(.spring(response: 0.35, dampingFraction: 0.72), value: completedCount)
    }
}

private struct DayPulseStrip: View {
    let overdueCount: Int
    let inboxCount: Int
    let todayCount: Int
    let upcomingCount: Int
    let completedCount: Int
    let onOpenReminders: () -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                PulseChip(title: "逾期", value: overdueCount, tint: .red, action: onOpenReminders)
                PulseChip(title: "收件箱", value: inboxCount, tint: .purple, action: onOpenReminders)
                PulseChip(title: "今天", value: todayCount, tint: .blue, action: onOpenReminders)
                PulseChip(title: "接下来", value: upcomingCount, tint: .orange, action: onOpenReminders)
                PulseChip(title: "完成", value: completedCount, tint: .green, action: onOpenReminders)
            }
            .padding(.vertical, 2)
        }
    }
}

private struct PulseChip: View {
    let title: String
    let value: Int
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Circle()
                    .fill(tint)
                    .frame(width: 8, height: 8)
                    .scaleEffect(value > 0 ? 1 : 0.72)
                    .animation(value > 0 ? .easeInOut(duration: 0.9).repeatForever(autoreverses: true) : .default, value: value)

                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)

                Text("\(value)")
                    .font(.subheadline.bold())
                    .contentTransition(.numericText())
                    .foregroundStyle(.primary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 9)
            .background(tint.opacity(0.08), in: Capsule())
        }
        .buttonStyle(.plain)
        .buttonStyle(PressableScaleButtonStyle())
    }
}

private struct ActionChip: View {
    let title: String
    let systemImage: String
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: systemImage)
                    .foregroundStyle(tint)
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(tint.opacity(0.08), in: Capsule())
        }
        .buttonStyle(PressableScaleButtonStyle())
    }
}

private struct SpotlightCarousel: View {
    @Binding var selection: Int
    let overdueCount: Int
    let inboxCount: Int
    let todayCount: Int
    let upcomingCount: Int
    let nextReminderTitle: String?
    let onAddReminder: () -> Void
    let onOpenReminders: () -> Void
    let onOpenAssistant: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                SurfaceKicker(title: "Focus", symbol: "viewfinder.circle", tint: selectionTint)
                Spacer()
                Text("\(selection + 1)/3")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .contentTransition(.numericText())
            }

            Text("焦点视图")
                .font(.title3.bold())
                .foregroundStyle(.primary)

            TabView(selection: $selection) {
                EditorialSpotlightCard(
                    eyebrow: "INBOX",
                    title: inboxCount > 0 ? "还有 \(inboxCount) 条想法等你落地" : "收件箱已经清空",
                    detail: inboxCount > 0 ? "现在适合做一轮快速分拣，把模糊任务变成具体安排。" : "可以顺手记录新想法，保持列表轻盈。",
                    accent: .purple,
                    symbol: "tray.full.fill",
                    primaryTitle: "去分拣",
                    primaryAction: onOpenReminders
                )
                .tag(0)

                EditorialSpotlightCard(
                    eyebrow: "FOCUS",
                    title: nextReminderTitle ?? "把最重要的一项先推起来",
                    detail: nextReminderTitle != nil ? "先推进眼前最关键的动作，再决定今天剩余时间怎么分配。" : "如果你还没开始，先挑一件最想完成的事。",
                    accent: .indigo,
                    symbol: "sparkles.rectangle.stack",
                    primaryTitle: "看建议",
                    primaryAction: onOpenAssistant
                )
                .tag(1)

                EditorialSpotlightCard(
                    eyebrow: "FLOW",
                    title: "今天 \(todayCount) 项，接下来 \(upcomingCount) 项",
                    detail: overdueCount > 0 ? "先处理逾期，再回到今天主线，你会更有掌控感。" : "当前节奏不错，可以趁状态顺手补一条新提醒。",
                    accent: .orange,
                    symbol: "calendar.day.timeline.left",
                    primaryTitle: "快速收集",
                    primaryAction: onAddReminder
                )
                .tag(2)
            }
            .frame(height: 188)
            .tabViewStyle(.page(indexDisplayMode: .never))

            HStack(spacing: 8) {
                ForEach(0..<3, id: \.self) { index in
                    Capsule()
                        .fill(index == selection ? Color.accentColor : Color.primary.opacity(0.12))
                        .frame(width: index == selection ? 18 : 8, height: 8)
                        .animation(.snappy, value: selection)
                }
            }
        }
    }

    private var selectionTint: Color {
        switch selection {
        case 0: .purple
        case 1: .indigo
        default: .orange
        }
    }
}

private struct EditorialSpotlightCard: View {
    let eyebrow: String
    let title: String
    let detail: String
    let accent: Color
    let symbol: String
    let primaryTitle: String
    let primaryAction: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    SurfaceKicker(title: eyebrow, symbol: symbol, tint: accent)
                    Text(title)
                        .font(.title3.bold())
                        .foregroundStyle(.primary)
                        .multilineTextAlignment(.leading)
                }

                Spacer()

                CircleIconBadge(symbol: symbol, tint: accent, size: 42, iconSize: 17)
            }

            Text(detail)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.leading)

            Spacer(minLength: 0)

            Button(primaryTitle, action: primaryAction)
                .buttonStyle(.borderedProminent)
                .tint(accent)
        }
        .padding(20)
        .appCard(tint: accent, cornerRadius: 28)
        .contentShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .buttonStyle(PressableScaleButtonStyle())
    }
}

private struct ExpandableSectionCard<Content: View>: View {
    let title: String
    let symbol: String
    let tint: Color
    @Binding var isExpanded: Bool
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Button {
                withAnimation(.spring(response: 0.32, dampingFraction: 0.82)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack(spacing: 10) {
                    SurfaceKicker(title: title, symbol: symbol, tint: tint)

                    Spacer()

                    Image(systemName: "chevron.down")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.secondary)
                        .rotationEffect(.degrees(isExpanded ? 0 : -90))
                }
            }
            .buttonStyle(.plain)
            .buttonStyle(PressableScaleButtonStyle())

            if isExpanded {
                content
                    .transition(.asymmetric(insertion: .move(edge: .top).combined(with: .opacity), removal: .opacity))
            }
        }
        .padding(18)
        .appCard(tint: tint, cornerRadius: 26)
    }
}

private struct HomeContextBar: View {
    let onAddReminder: () -> Void
    let onOpenReminders: () -> Void
    let onOpenAssistant: () -> Void

    var body: some View {
        HStack(spacing: 10) {
            Button(action: onAddReminder) {
                Label("收集", systemImage: "plus")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)

            Button(action: onOpenReminders) {
                Label("提醒", systemImage: "checklist")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)

            Button(action: onOpenAssistant) {
                Label("建议", systemImage: "lightbulb")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
        }
        .padding(10)
        .appCard(tint: .indigo, cornerRadius: 22)
        .offset(y: -2)
        .compositingGroup()
    }
}

private struct RhythmBoardCard: View {
    let overdueCount: Int
    let todayCount: Int
    let upcomingCount: Int
    let nextReminderTitle: String?
    let onOpenReminders: () -> Void
    let onOpenAssistant: () -> Void

    var body: some View {
        GlassSection(title: "今日节奏", symbol: "waveform.path.ecg", tint: .indigo) {
            VStack(spacing: 0) {
                RhythmRow(
                    title: "现在",
                    subtitle: overdueCount > 0 ? "先处理 \(overdueCount) 个逾期事项" : (nextReminderTitle ?? "从当前最重要的一项开始"),
                    accent: .red,
                    action: onOpenReminders
                )
                SectionDivider()
                RhythmRow(
                    title: "接下来",
                    subtitle: todayCount > 0 ? "今天还排了 \(todayCount) 项，适合继续推进" : "留一个 25 分钟专注块，推进最关键的一件事",
                    accent: .blue,
                    action: onOpenAssistant
                )
                SectionDivider()
                RhythmRow(
                    title: "稍后",
                    subtitle: upcomingCount > 0 ? "后面还有 \(upcomingCount) 项可排进今天尾段" : "完成后给自己留 5 分钟整理和收尾",
                    accent: .green,
                    action: onOpenAssistant
                )
            }
        }
    }
}

private struct RhythmRow: View {
    let title: String
    let subtitle: String
    let accent: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title.uppercased())
                        .font(.caption.weight(.bold))
                        .foregroundStyle(accent)
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.primary)
                        .multilineTextAlignment(.leading)
                }

                Spacer()

                Image(systemName: "arrow.up.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.tertiary)
            }
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
    }
}

private struct AgendaTimelineCard: View {
    @Environment(BeeveStore.self) private var store

    let reminders: [ReminderItem]
    let onOpenReminders: () -> Void

    var body: some View {
        GlassSection(title: "今日时间线", symbol: "timeline.selection", tint: .teal) {
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

private struct GlassSection<Content: View>: View {
    let title: String
    let symbol: String
    let tint: Color
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SurfaceKicker(title: title, symbol: symbol, tint: tint)

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
        GlassSection(title: "今日整理", symbol: "tray", tint: .purple) {
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
            (colorScheme == .dark ? Color.white.opacity(0.05) : Color(.secondarySystemBackground)),
            in: RoundedRectangle(cornerRadius: 18, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(colorScheme == .dark ? Color.white.opacity(0.06) : Color.black.opacity(0.05))
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

                Button("打开提醒列表", action: onOpenReminders)
                    .buttonStyle(.bordered)
            }
        }
    }
}

private struct CompletionSuggestionCard: View {
    let suggestion: CompletionSuggestion
    let onTapDestination: (FollowUpDestination) -> Void
    let onDismiss: () -> Void

    var body: some View {
        GlassSection(title: suggestion.title, symbol: "checkmark.circle", tint: .green) {
            VStack(alignment: .leading, spacing: 12) {
                Text(suggestion.detail)
                    .font(.body)
                    .foregroundStyle(.secondary)

                VStack(alignment: .leading, spacing: 10) {
                    Button(suggestion.primaryLabel) {
                        onTapDestination(suggestion.primaryDestination)
                    }
                    .buttonStyle(.bordered)
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
        VStack(spacing: 0) {
            ActionRowButton(title: "快速收集", subtitle: "先记下来，别丢", symbol: "plus.circle.fill", tint: .blue, action: onAddReminder)
            SectionDivider()
            ActionRowButton(title: "清空收件箱", subtitle: "安排时间和优先级", symbol: "tray.full.fill", tint: .purple, action: onOpenReminders)
            SectionDivider()
            ActionRowButton(title: "启动工具", subtitle: "开始专注或记录", symbol: "bolt.fill", tint: .orange, action: onOpenTools)
            SectionDivider()
            ActionRowButton(title: "查看建议", subtitle: "需要时再打开", symbol: "lightbulb", tint: .indigo, action: onOpenAssistant)
        }
    }
}

private struct SectionDivider: View {
    var body: some View {
        Divider()
            .padding(.leading, 50)
    }
}

private struct ActionRowButton: View {
    let title: String
    let subtitle: String
    let symbol: String
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                CircleIconBadge(symbol: symbol, tint: tint, size: 38, iconSize: 15)

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
            .padding(.vertical, 12)
        }
        .buttonStyle(PressableScaleButtonStyle())
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
        .buttonStyle(PressableScaleButtonStyle())
        .contextMenu {
            Button(reminder.isCompleted ? "恢复" : "完成", action: onToggle)
        }
    }
}

private struct RemindersView: View {
    @Environment(BeeveStore.self) private var store
    @State private var selectedFilter: ReminderFilter = .all

    let onAddReminder: () -> Void
    let onOpenAssistant: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("从收件箱到今天要做的事，尽量在一个界面完成分拣。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding(.vertical, 4)
                }
                .listRowBackground(Color.clear)
                .listRowSeparator(.hidden)

                Section {
                    SegmentedFilterBar(selection: $selectedFilter)
                        .padding(.vertical, 4)
                }
                .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                .listRowBackground(Color.clear)
                .listRowSeparator(.hidden)

                if sections.isEmpty {
                    Section {
                        ContentUnavailableView(
                            "当前筛选下没有事项",
                            systemImage: "line.3.horizontal.decrease.circle",
                            description: Text("试试切换筛选，或先快速收集一条新提醒。")
                        )
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 32)
                    }
                    .listRowBackground(Color.clear)
                    .listRowSeparator(.hidden)
                } else {
                    ForEach(sections, id: \.title) { section in
                        Section(section.title) {
                            ForEach(section.items) { reminder in
                                ReminderRow(
                                    reminder: reminder,
                                    scheduleText: store.scheduleText(for: reminder),
                                    onToggle: {
                                        withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                                            store.toggleReminder(reminder)
                                        }
                                    },
                                    onTonight: {
                                        withAnimation(.snappy) {
                                            store.assignTonight(reminder)
                                        }
                                    },
                                    onTomorrow: {
                                        withAnimation(.snappy) {
                                            store.assignTomorrowMorning(reminder)
                                        }
                                    },
                                    onDelete: {
                                        withAnimation(.snappy) {
                                            store.deleteReminder(reminder)
                                        }
                                    }
                                )
                                .listRowInsets(EdgeInsets(top: 6, leading: 0, bottom: 6, trailing: 0))
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("提醒")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton(action: onOpenAssistant)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("新增", systemImage: "plus", action: onAddReminder)
                }
            }
            .sensoryFeedback(.selection, trigger: selectedFilter)
            .animation(.snappy, value: selectedFilter)
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
    @Environment(\.colorScheme) private var colorScheme

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
        .background(
            colorScheme == .dark ? Color.white.opacity(0.03) : Color(.secondarySystemBackground),
            in: RoundedRectangle(cornerRadius: 20, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(colorScheme == .dark ? Color.white.opacity(0.04) : Color.black.opacity(0.04))
        )
        .contextMenu {
            Button(reminder.isCompleted ? "恢复" : "完成", action: onToggle)

            if !reminder.isCompleted {
                Button("今晚处理", action: onTonight)
                Button("明早处理", action: onTomorrow)
            }

            Button("删除", role: .destructive, action: onDelete)
        }
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

                    GlassSection(title: "常用工具", symbol: "square.grid.2x2", tint: .orange) {
                        VStack(spacing: 0) {
                            ForEach(Array(store.tools.enumerated()), id: \.element.id) { index, tool in
                                Button {
                                    activeSummary = store.runTool(tool)
                                } label: {
                                    ToolListRow(tool: tool)
                                }
                                .buttonStyle(.plain)

                                if index < store.tools.count - 1 {
                                    SectionDivider()
                                }
                            }
                        }
                    }

                    if let activeSummary {
                        GlassSection(title: "刚刚完成", symbol: "checkmark.circle", tint: .orange) {
                            VStack(alignment: .leading, spacing: 10) {
                                Text(activeSummary)
                                    .font(.body)
                                    .foregroundStyle(.secondary)

                                Button("继续整理", action: onOpenAssistant)
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

private struct ToolListRow: View {
    let tool: ToolItem

    var body: some View {
        HStack(spacing: 12) {
            CircleIconBadge(symbol: tool.symbolName, tint: tool.tint, size: 38, iconSize: 15)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(tool.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)

                    Spacer()

                    Text(tool.statusText)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(tool.tint)
                }

                Text(tool.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 12)
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
                                Text("Beeve 会逐步贴合你的节奏")
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
                            ProfileSettingRow(title: "建议入口", subtitle: "需要时再查看，不主动打断当前流程", symbol: "lightbulb", tint: .indigo)
                            ProfileSettingRow(title: "默认快速收集", subtitle: "先进入收件箱，稍后再分拣", symbol: "tray.full", tint: .purple)
                            ProfileSettingRow(title: "专注节奏", subtitle: "25 分钟专注 + 5 分钟回顾", symbol: "timer", tint: .orange)
                        }
                    }

                    GlassSection(title: "账号与数据", symbol: "person.text.rectangle", tint: .blue) {
                        VStack(spacing: 12) {
                            ProfileActionButton(title: "查看当前建议", subtitle: "需要时再看下一步，不打断手头工作", symbol: "text.bubble", tint: .blue, action: onOpenAssistant)
                            ProfileActionButton(title: "通知与提醒", subtitle: "下一步可接入本地通知与日程时间块", symbol: "bell.badge", tint: .orange, action: {})
                            ProfileActionButton(title: "隐私与数据", subtitle: "未来可在这里管理同步、导出和本地数据设置", symbol: "lock.shield", tint: .green, action: {})
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
        .background(colorScheme == .dark ? Color(.secondarySystemBackground) : Color(.systemBackground), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .strokeBorder(colorScheme == .dark ? Color.white.opacity(0.08) : tint.opacity(0.10))
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
                            title: "建议",
                            subtitle: store.assistantContextSummary,
                            symbol: "lightbulb",
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

                    Text("当前内容为本地演示结果，后续会接入真实能力。")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.black.opacity(0.04), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

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
            .navigationTitle("建议")
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
        bubble
            .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var bubble: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(message.role == .assistant ? "Beeve 建议" : "你的输入")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)

                Spacer()

                Text(message.createdAt.formatted(date: .omitted, time: .shortened))
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Text(message.content)
                .font(.body)
                .foregroundStyle(.primary)
        }
        .padding(14)
        .background(backgroundStyle, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private var backgroundStyle: AnyShapeStyle {
        if message.role == .assistant {
            AnyShapeStyle(
                Color(.secondarySystemBackground)
            )
        } else {
            AnyShapeStyle(
                Color.accentColor.opacity(0.08)
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
