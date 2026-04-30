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
    @State private var generatedCard: AchievementCard?
    @State private var hasAppeared = false

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

    private var progressFraction: Double {
        let focusScore = todayFocus == nil ? 0 : 1
        let doneScore = min(todayEntries.filter { $0.kind == .done }.count, 1)
        let tomorrowScore = min(todayEntries.filter { $0.kind == .tomorrow }.count, 1)
        let interruptScore = min(todayEntries.filter { $0.kind == .interrupted }.count, 1)
        return Double(focusScore + doneScore + tomorrowScore + interruptScore) / 4
    }

    private var zhDateText: String {
        Self.zhDateFormatter.string(from: today)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    assistantSection
                    focusSection
                    entrySection(kind: .done)
                    entrySection(kind: .interrupted)
                    entrySection(kind: .tomorrow)
                    cardActionSection
                }
                .padding(.horizontal, BeeveDesign.contentPadding)
                .padding(.top, 12)
                .padding(.bottom, 120)
            }
            .background { BeeveSceneBackground() }
            .navigationTitle("今天")
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
            .sheet(item: $assistantLaunch) { launch in
                AssistantSheet(initialIntent: launch.intent, context: context, initialText: launch.seedText)
                    .presentationDetents([.large])
            }
            .sheet(item: $generatedCard) { card in
                NavigationStack {
                    ScrollView {
                        AchievementCardView(card: card)
                            .padding(16)
                    }
                    .navigationTitle("今日卡片")
                    .toolbar {
                        ToolbarItem(placement: .confirmationAction) {
                            Button("完成") {
                                generatedCard = nil
                            }
                        }
                    }
                }
            }
            .onAppear {
                hasAppeared = true
            }
        }
    }

    private var assistantSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            aiHero
            presetSection

            HStack(spacing: 8) {
                BeeveMiniMetric(title: "AI", value: DeepSeekSettings.isConfigured ? "DeepSeek" : "本地")
                BeeveMiniMetric(title: "焦点", value: todayFocus == nil ? "未定" : "已定")
                BeeveMiniMetric(title: "记录", value: "\(todayEntries.count)")
            }
        }
        .beeveReveal(hasAppeared)
    }

    private var aiHero: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: "sparkles")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(width: 46, height: 46)
                    .background(Color.white.opacity(0.18))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))

                VStack(alignment: .leading, spacing: 6) {
                    Text("Beeve AI")
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.82))
                    Text("说一句，直接生成今天。")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(.white)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text(zhDateText)
                        .font(.caption.weight(.semibold))
                    Text("\(Int(progressFraction * 100))%")
                        .font(.title3.weight(.bold))
                }
                .foregroundStyle(.white.opacity(0.86))
            }

            Text("优先用导入、自然语言和预设提示，不从空白输入框开始。")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.84))
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 10) {
                Button {
                    assistantLaunch = AssistantLaunch(intent: .voiceCapture, seedText: "我现在想说的是：")
                    BeeveHaptics.lightImpact()
                } label: {
                    Label("自然语言", systemImage: "waveform")
                }
                .buttonStyle(AIHeroButtonStyle())

                Button {
                    assistantLaunch = AssistantLaunch(intent: .importText)
                    BeeveHaptics.lightImpact()
                } label: {
                    Label("导入内容", systemImage: "square.and.arrow.down")
                }
                .buttonStyle(AIHeroButtonStyle())
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(BeeveDesign.accentGradient)
        .clipShape(RoundedRectangle(cornerRadius: 30, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .stroke(Color.white.opacity(0.26), lineWidth: 1)
        }
        .shadow(color: BeeveDesign.accent.opacity(0.16), radius: 18, x: 0, y: 10)
    }

    private var presetSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("预设提示")
                    .font(.headline)
                Spacer()
                Text(DeepSeekSettings.isConfigured ? "DeepSeek 已接入" : "本地建议")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                AssistantHomeAction(intent: .planToday, title: "安排今天", subtitle: "给我一个可执行焦点") {
                    assistantLaunch = AssistantLaunch(intent: .planToday, seedText: "我今天需要完成：")
                }
                AssistantHomeAction(intent: .recover, title: "被打断了", subtitle: "帮我找回下一步") {
                    assistantLaunch = AssistantLaunch(intent: .recover, seedText: "我刚刚被打断，因为：")
                }
                AssistantHomeAction(intent: .importText, title: "会议记录", subtitle: "提取待办和明天") {
                    assistantLaunch = AssistantLaunch(intent: .importText, seedText: "请从这段内容里提取今日焦点：")
                }
                AssistantHomeAction(intent: .handoff, title: "留给明天", subtitle: "压成明早第一步") {
                    assistantLaunch = AssistantLaunch(intent: .handoff, seedText: "明天需要接住：")
                }
            }
        }
    }

    private var focusSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .center, spacing: 12) {
                BeeveIconBubble(systemImage: "target", tint: BeeveDesign.accentDeep)
                VStack(alignment: .leading, spacing: 4) {
                    Text("今日焦点")
                        .font(.headline)
                    Text(todayFocus == nil ? "只选一件，今天先推进它。" : "今天先围绕这一件。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button {
                    BeeveHaptics.lightImpact()
                    isEditingFocus = true
                } label: {
                    Label(todayFocus == nil ? "设定" : "编辑", systemImage: todayFocus == nil ? "plus" : "pencil")
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            }

            if let todayFocus {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(BeeveDesign.accentDeep)
                        .padding(.top, 2)
                    Text(todayFocus.title)
                        .font(.body.weight(.medium))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(16)
                .background(BeeveDesign.elevatedSurface)
                .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
                .transition(.move(edge: .top).combined(with: .opacity))
            } else {
                Text("先定焦点，再记录。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .padding(.vertical, 2)
            }
        }
        .beevePanel(tint: BeeveDesign.accentDeep)
        .beeveReveal(hasAppeared, delay: 0.05)
        .animation(.snappy(duration: 0.28), value: todayFocus?.title)
    }

    private func entrySection(kind: DayEntryKind) -> some View {
        let sectionEntries = todayEntries.filter { $0.kind == kind }
        let sectionTint = tint(for: kind)

        return VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .center, spacing: 12) {
                BeeveIconBubble(systemImage: kind.systemImage, tint: sectionTint)
                VStack(alignment: .leading, spacing: 2) {
                    Text(kind.sectionTitle)
                        .font(.headline)
                    Text(kind.prompt)
                        .font(.footnote)
                        .foregroundStyle(sectionTint)
                }
                Spacer()
                BeeveCountBadge(value: sectionEntries.count)
            }

            if sectionEntries.isEmpty {
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "circle.dashed")
                        .foregroundStyle(.secondary)
                        .padding(.top, 2)
                    Text(emptyMessage(for: kind))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(14)
                .background(BeeveDesign.elevatedSurface)
                .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous)
                        .stroke(BeeveDesign.border, lineWidth: 1)
                }
            } else {
                VStack(spacing: 0) {
                    ForEach(sectionEntries) { entry in
                        VStack(spacing: 12) {
                            HStack(alignment: .top, spacing: 10) {
                                Image(systemName: "smallcircle.filled.circle")
                                    .font(.caption)
                                    .foregroundStyle(sectionTint)
                                    .padding(.top, 5)
                                Text(entry.text)
                                    .font(.body)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            if entry.persistentModelID != sectionEntries.last?.persistentModelID {
                                Divider()
                            }
                        }
                        .padding(.vertical, 6)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                }
            }
        }
        .beevePanel(tint: sectionTint)
        .beeveReveal(hasAppeared, delay: revealDelay(for: kind))
        .animation(.snappy(duration: 0.25), value: sectionEntries.count)
    }

    private var cardActionSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                BeeveIconBubble(systemImage: "rectangle.stack.badge.plus", tint: BeeveDesign.warmAccent)
                VStack(alignment: .leading, spacing: 4) {
                    Text("收束今天")
                        .font(.headline)
                    Text("把今天整理成一张卡。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }

            Button {
                BeeveHaptics.success()
                generateCard()
            } label: {
                Label("生成今日卡片", systemImage: "sparkles")
            }
            .buttonStyle(BeevePrimaryButtonStyle())
        }
        .beevePanel(tint: BeeveDesign.warmAccent)
        .beeveReveal(hasAppeared, delay: 0.25)
    }

    private func tint(for kind: DayEntryKind) -> Color {
        switch kind {
        case .done: Color(.systemGreen)
        case .interrupted: Color(.systemOrange)
        case .tomorrow: Color(.systemIndigo)
        }
    }

    private func emptyMessage(for kind: DayEntryKind) -> String {
        switch kind {
        case .done: "还没有推进记录。"
        case .interrupted: "还没有记录打断。"
        case .tomorrow: "还没有留给明天。"
        }
    }

    private func revealDelay(for kind: DayEntryKind) -> Double {
        switch kind {
        case .done: 0.10
        case .interrupted: 0.15
        case .tomorrow: 0.20
        }
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

private struct BeeveDayRing: View {
    let progress: Double

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color(.separator).opacity(0.18), lineWidth: 5)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    BeeveDesign.accentGradient,
                    style: StrokeStyle(lineWidth: 5, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.smooth(duration: 0.45), value: progress)
            Text("\(Int(progress * 100))%")
                .font(.caption.weight(.bold))
                .monospacedDigit()
                .foregroundStyle(.secondary)
        }
        .frame(width: 58, height: 58)
        .accessibilityLabel("今日进度")
        .accessibilityValue("\(Int(progress * 100))%")
    }
}

private struct BeeveMiniMetric: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.subheadline.weight(.semibold))
                .lineLimit(1)
                .minimumScaleFactor(0.75)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(BeeveDesign.elevatedSurface)
        .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous)
                .stroke(BeeveDesign.border, lineWidth: 1)
        }
        .accessibilityElement(children: .combine)
    }
}

private struct AIHeroButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.primary)
            .frame(maxWidth: .infinity, minHeight: 50)
            .background(Color.white.opacity(configuration.isPressed ? 0.76 : 0.92))
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

private struct AssistantHomeAction: View {
    let intent: AssistantIntent
    let title: String
    let subtitle: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                Image(systemName: intent.systemImage)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(BeeveDesign.accentDeep)
                    .frame(width: 30, height: 30)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }

                Spacer(minLength: 0)
            }
            .foregroundStyle(.primary)
            .padding(14)
            .frame(minHeight: 66)
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel(title)
        .accessibilityHint(subtitle)
    }
}

#Preview {
    TodayView()
        .modelContainer(SampleData.previewContainer())
}
