import SwiftData
import SwiftUI

struct TodayView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var preferences: [UserPreferences]
    @Query(sort: \DailyFocus.createdAt, order: .reverse) private var focuses: [DailyFocus]
    @Query(sort: \DayEntry.createdAt, order: .reverse) private var entries: [DayEntry]
    @Query(sort: \AchievementCard.createdAt, order: .reverse) private var cards: [AchievementCard]
    @State private var isLogging = false
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
                    noteSection
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
                        isLogging = true
                    } label: {
                        Image(systemName: "plus")
                            .accessibilityLabel("记录一件事")
                    }
                }
            }
            .sheet(isPresented: $isLogging) {
                QuickLogSheet()
                    .presentationDetents([.medium])
            }
            .sheet(isPresented: $isEditingFocus) {
                FocusEditorView(focus: todayFocus)
                    .presentationDetents([.medium])
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

    private var noteSection: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .center, spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(zhDateText)
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(.secondary)
                    Text("给未来的自己")
                        .font(.title3.weight(.semibold))
                }
                Spacer()
                BeeveDayRing(progress: progressFraction)
            }

            Text(FutureSelfGenerator().note(for: context))
                .font(.title2.weight(.semibold))
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 8) {
                BeeveMiniMetric(title: "焦点", value: todayFocus == nil ? "未定" : "已定")
                BeeveMiniMetric(title: "记录", value: "\(todayEntries.count)")
                BeeveMiniMetric(title: "明天", value: "\(todayEntries.filter { $0.kind == .tomorrow }.count)")
            }
        }
        .beevePanel(padding: 22, tint: BeeveDesign.accent)
        .beeveReveal(hasAppeared)
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

#Preview {
    TodayView()
        .modelContainer(SampleData.previewContainer())
}
