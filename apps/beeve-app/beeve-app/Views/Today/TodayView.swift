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

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
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
            .background(BeeveDesign.background)
            .navigationTitle("Today")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isLogging = true
                    } label: {
                        Label("Log one thing", systemImage: "plus")
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
                    .navigationTitle("Today's card")
                    .toolbar {
                        ToolbarItem(placement: .confirmationAction) {
                            Button("Done") {
                                generatedCard = nil
                            }
                        }
                    }
                }
            }
        }
    }

    private var noteSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                BeeveIconBubble(systemImage: "sparkle.magnifyingglass", tint: BeeveDesign.accent)

                VStack(alignment: .leading, spacing: 4) {
                    Text(today.formatted(.dateTime.weekday(.wide).month().day()))
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(.secondary)
                    Text("From future-you")
                        .font(.headline)
                }
            }

            Text(FutureSelfGenerator().note(for: context))
                .font(.title3.weight(.semibold))
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .beevePanel(padding: 18)
    }

    private var focusSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                BeeveIconBubble(systemImage: todayFocus == nil ? "target" : "target", tint: Color(.systemIndigo))
                VStack(alignment: .leading, spacing: 4) {
                    Text("One real move")
                        .font(.headline)
                    Text(todayFocus == nil ? "Pick the smallest thing that would make today feel less scattered." : "Keep the day pointed at one clear move.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button(todayFocus == nil ? "Set" : "Edit") {
                    isEditingFocus = true
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            }

            if let todayFocus {
                Text(todayFocus.title)
                    .font(.body.weight(.medium))
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(14)
                    .background(BeeveDesign.elevatedSurface)
                    .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
            }
        }
        .beevePanel()
    }

    private func entrySection(kind: DayEntryKind) -> some View {
        let sectionEntries = todayEntries.filter { $0.kind == kind }

        return VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .center, spacing: 12) {
                BeeveIconBubble(systemImage: kind.systemImage, tint: tint(for: kind))
                VStack(alignment: .leading, spacing: 2) {
                    Text(kind.sectionTitle)
                        .font(.headline)
                    Text(kind.prompt)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                BeeveCountBadge(value: sectionEntries.count)
            }

            if sectionEntries.isEmpty {
                Text(emptyMessage(for: kind))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, 4)
            } else {
                VStack(spacing: 0) {
                    ForEach(sectionEntries) { entry in
                        VStack(alignment: .leading, spacing: 10) {
                            Text(entry.text)
                                .font(.body)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .fixedSize(horizontal: false, vertical: true)
                            if entry.persistentModelID != sectionEntries.last?.persistentModelID {
                                Divider()
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
        .beevePanel()
    }

    private var cardActionSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                BeeveIconBubble(systemImage: "rectangle.stack.badge.plus", tint: Color(.systemBrown))
                VStack(alignment: .leading, spacing: 4) {
                    Text("Close the loop")
                        .font(.headline)
                    Text("Turn today's fragments into an achievement card and a lighter start for tomorrow.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }

            Button {
                generateCard()
            } label: {
                Label("Generate today's card", systemImage: "sparkles")
            }
            .buttonStyle(BeevePrimaryButtonStyle())
        }
        .beevePanel()
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
        case .done: "No wins logged yet. Add even the smallest useful move."
        case .interrupted: "No interruptions named. Capture one when it pulls you away."
        case .tomorrow: "No handoff yet. Leave future-you one clear thread."
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

#Preview {
    TodayView()
        .modelContainer(SampleData.previewContainer())
}
