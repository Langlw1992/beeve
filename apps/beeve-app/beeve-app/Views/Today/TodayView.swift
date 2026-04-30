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
                VStack(alignment: .leading, spacing: 16) {
                    noteSection
                    focusSection
                    entrySection(kind: .done)
                    entrySection(kind: .interrupted)
                    entrySection(kind: .tomorrow)
                    cardActionSection
                }
                .padding(16)
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
        VStack(alignment: .leading, spacing: 8) {
            Text("From future-you")
                .font(.caption.weight(.semibold))
                .foregroundStyle(BeeveDesign.mutedText)
                .textCase(.uppercase)
            Text(FutureSelfGenerator().note(for: context))
                .font(.title3.weight(.semibold))
                .foregroundStyle(.primary)
        }
        .beevePanel()
    }

    private var focusSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("One real move")
                    .font(.headline)
                Spacer()
                Button(todayFocus == nil ? "Set" : "Edit") {
                    isEditingFocus = true
                }
                .buttonStyle(.bordered)
            }

            Text(todayFocus?.title ?? "Name the one thing that would make today feel less scattered.")
                .foregroundStyle(todayFocus == nil ? BeeveDesign.mutedText : .primary)
        }
        .beevePanel()
    }

    private func entrySection(kind: DayEntryKind) -> some View {
        let sectionEntries = todayEntries.filter { $0.kind == kind }

        return VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label(kind.sectionTitle, systemImage: kind.systemImage)
                    .font(.headline)
                Spacer()
                Text("\(sectionEntries.count)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(BeeveDesign.mutedText)
            }

            if sectionEntries.isEmpty {
                Text("Nothing logged yet.")
                    .foregroundStyle(BeeveDesign.mutedText)
            } else {
                ForEach(sectionEntries) { entry in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(entry.text)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        if entry.persistentModelID != sectionEntries.last?.persistentModelID {
                            Divider()
                        }
                    }
                }
            }
        }
        .beevePanel()
    }

    private var cardActionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Close the loop")
                .font(.headline)
            Text("Turn today's fragments into an achievement card and a lighter start for tomorrow.")
                .foregroundStyle(BeeveDesign.mutedText)

            Button {
                generateCard()
            } label: {
                Label("Generate today's card", systemImage: "sparkles")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
        }
        .beevePanel()
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
