import SwiftData
import SwiftUI

private struct AssistantLaunch: Identifiable {
    let id = UUID()
    let intent: AssistantIntent
    var seedText: String?
}

struct TodayView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var preferences: [UserPreferences]
    @Query(sort: \DailyFocus.createdAt, order: .reverse) private var focuses: [DailyFocus]
    @Query(sort: \DayEntry.createdAt, order: .reverse) private var entries: [DayEntry]
    @Query(sort: \AchievementCard.createdAt, order: .reverse) private var cards: [AchievementCard]
    @State private var assistantLaunch: AssistantLaunch?
    @State private var isEditingFocus = false
    @State private var isShowingQuickLog = false
    @State private var generatedCard: AchievementCard?

    private static let zhDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_Hans_CN")
        formatter.dateFormat = "M月d日 EEEE"
        return formatter
    }()

    private var today: Date {
        Calendar.current.startOfDay(for: .now)
    }

    private var activePreferences: UserPreferences {
        preferences.first ?? UserPreferences(hasCompletedOnboarding: true)
    }

    private var todayFocus: DailyFocus? {
        focuses.first { Calendar.current.isDate($0.date, inSameDayAs: today) }
    }

    private var todayEntries: [DayEntry] {
        entries.filter { Calendar.current.isDate($0.date, inSameDayAs: today) }
    }

    private var context: DayContext {
        DayContext(date: today, preferences: activePreferences, focus: todayFocus, entries: todayEntries)
    }

    private var zhDateText: String {
        Self.zhDateFormatter.string(from: today)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    currentThreadSection
                    nextActionsSection
                    todaySignalsSection
                    handoffSection
                }
                .padding(.horizontal, BeeveDesign.contentPadding)
                .padding(.top, 8)
                .padding(.bottom, 110)
            }
            .background { BeeveSceneBackground() }
            .navigationTitle("今天")
            .safeAreaInset(edge: .bottom) {
                recordBar
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        BeeveHaptics.lightImpact()
                        assistantLaunch = AssistantLaunch(intent: .planToday)
                    } label: {
                        Image(systemName: "wand.and.sparkles")
                            .accessibilityLabel("打开 Beeve AI")
                    }
                }
            }
            .sheet(isPresented: $isEditingFocus) {
                FocusEditorView(focus: todayFocus)
                    .presentationDetents([.medium])
            }
            .sheet(isPresented: $isShowingQuickLog) {
                QuickLogSheet()
                    .presentationDetents([.large])
            }
            .sheet(item: $assistantLaunch) { launch in
                AssistantSheet(initialIntent: launch.intent, context: context, initialText: launch.seedText)
                    .presentationDetents([.large])
            }
            .sheet(item: $generatedCard) { card in
                NavigationStack {
                    ScrollView {
                        AchievementCardView(card: card)
                            .padding(BeeveDesign.contentPadding)
                    }
                    .background { BeeveSceneBackground() }
                    .navigationTitle("交接")
                    .toolbar {
                        ToolbarItem(placement: .confirmationAction) {
                            Button("完成") {
                                generatedCard = nil
                            }
                        }
                    }
                }
            }
        }
    }

    private var currentThreadSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(zhDateText)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text("当前主线")
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Button {
                    BeeveHaptics.lightImpact()
                    isEditingFocus = true
                } label: {
                    Text(todayFocus == nil ? "设定" : "编辑")
                }
                .font(.footnote.weight(.semibold))
                .buttonStyle(.bordered)
                .controlSize(.small)
                .tint(BeeveDesign.accent)
            }

            Text(todayFocus?.title ?? "先写下今天最值得推进的一件事")
                .font(.title2.weight(.semibold))
                .foregroundStyle(BeeveDesign.primaryText)
                .fixedSize(horizontal: false, vertical: true)

            Text(todayFocus == nil ? "主线越具体，今天越容易开始。" : nextStepText)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 8) {
                TodayMetric(value: context.doneEntries.count, label: "推进")
                TodayMetric(value: context.interruptedEntries.count, label: "打断")
                TodayMetric(value: context.tomorrowEntries.count, label: "交接")
            }
            .padding(.top, 4)
        }
        .beevePanel(padding: 18, tint: BeeveDesign.accent)
    }

    private var nextStepText: String {
        if context.tomorrowEntries.isEmpty {
            "下一步很小：记录一个刚刚发生的片段。"
        } else {
            "明天已经有线索，今天可以轻一点收束。"
        }
    }

    private var nextActionsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("现在可以做")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(.secondary)
                .padding(.horizontal, 4)

            VStack(spacing: 0) {
                TodayActionRow(
                    systemImage: "square.and.pencil",
                    title: "记录刚刚发生的事",
                    subtitle: "一句话就够"
                ) {
                    BeeveHaptics.lightImpact()
                    isShowingQuickLog = true
                }

                Divider().padding(.leading, 58)

                TodayActionRow(
                    systemImage: "arrow.uturn.backward",
                    title: "找回下一步",
                    subtitle: "被打断后继续"
                ) {
                    BeeveHaptics.lightImpact()
                    assistantLaunch = AssistantLaunch(intent: .recover, seedText: "我刚刚被打断，因为：")
                }

                Divider().padding(.leading, 58)

                TodayActionRow(
                    systemImage: "sunrise",
                    title: "留给明天",
                    subtitle: "生成明早开头"
                ) {
                    BeeveHaptics.lightImpact()
                    assistantLaunch = AssistantLaunch(intent: .handoff, seedText: "明天需要接住：")
                }
            }
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
                    .allowsHitTesting(false)
            }
        }
    }

    private var todaySignalsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("今天留下的线索")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(.secondary)
                .padding(.horizontal, 4)

            VStack(spacing: 0) {
                SignalSummaryRow(kind: .done, entries: context.doneEntries)
                Divider().padding(.leading, 58)
                SignalSummaryRow(kind: .interrupted, entries: context.interruptedEntries)
                Divider().padding(.leading, 58)
                SignalSummaryRow(kind: .tomorrow, entries: context.tomorrowEntries)
            }
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
                    .allowsHitTesting(false)
            }
        }
    }

    private var handoffSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            BeeveSectionHeader(
                title: "交接",
                subtitle: "把今天压成明天能接住的一句话。"
            )

            Button {
                BeeveHaptics.success()
                generateCard()
            } label: {
                Label("生成今日交接", systemImage: "rectangle.and.pencil.and.ellipsis")
            }
            .buttonStyle(BeeveSecondaryButtonStyle())
        }
        .beevePanel(padding: 16, tint: BeeveDesign.warmAccent)
    }

    private var recordBar: some View {
        Button {
            BeeveHaptics.lightImpact()
            isShowingQuickLog = true
        } label: {
            HStack {
                Text("发生了什么？")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("记录")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(BeeveDesign.accentDeep)
                    .padding(.horizontal, 13)
                    .padding(.vertical, 9)
                    .background(BeeveDesign.accent.opacity(0.16))
                    .clipShape(Capsule())
            }
            .padding(.horizontal, 15)
            .frame(height: 54)
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
                    .allowsHitTesting(false)
            }
            .padding(.horizontal, BeeveDesign.contentPadding)
            .padding(.top, 8)
            .padding(.bottom, 8)
            .background(.regularMaterial)
        }
        .buttonStyle(.plain)
    }

    private func generateCard() {
        let existing = cards.first { Calendar.current.isDate($0.date, inSameDayAs: today) }
        if let existing {
            generatedCard = existing
            return
        }

        let card = FutureSelfGenerator().makeAchievementCard(from: context)
        modelContext.insert(card)
        try? modelContext.save()
        generatedCard = card
    }
}

private struct TodayMetric: View {
    let value: Int
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value, format: .number)
                .font(.title3.weight(.semibold))
                .monospacedDigit()
                .foregroundStyle(BeeveDesign.primaryText)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(BeeveDesign.elevatedSurface.opacity(0.62))
        .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
    }
}

private struct TodayActionRow: View {
    let systemImage: String
    let title: String
    let subtitle: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                BeeveIconBubble(systemImage: systemImage)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.body.weight(.medium))
                        .foregroundStyle(BeeveDesign.primaryText)
                    Text(subtitle)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

private struct SignalSummaryRow: View {
    let kind: DayEntryKind
    let entries: [DayEntry]

    private var latestText: String {
        entries.first?.text ?? emptyText
    }

    private var emptyText: String {
        switch kind {
        case .done: "还没有推进片段"
        case .interrupted: "还没有记录打断"
        case .tomorrow: "还没有明天线索"
        }
    }

    private var tint: Color {
        switch kind {
        case .done: BeeveDesign.accent
        case .interrupted: BeeveDesign.warmAccent
        case .tomorrow: Color(red: 0.49, green: 0.53, blue: 0.68)
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            BeeveIconBubble(systemImage: kind.systemImage, tint: tint)

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(kind.title)
                        .font(.body.weight(.medium))
                    BeeveCountBadge(value: entries.count)
                }
                Text(latestText)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
    }
}

#Preview {
    TodayView()
        .modelContainer(SampleData.previewContainer())
}
