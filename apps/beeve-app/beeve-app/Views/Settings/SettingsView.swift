import SwiftData
import SwiftUI

struct SettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var preferences: [UserPreferences]
    @Query private var focuses: [DailyFocus]
    @Query private var entries: [DayEntry]
    @Query private var cards: [AchievementCard]
    @State private var isShowingResetConfirmation = false

    var body: some View {
        NavigationStack {
            Form {
                if let active = preferences.first {
                    SettingsForm(preferences: active)

                    Section {
                        Button("Reset local data", role: .destructive) {
                            isShowingResetConfirmation = true
                        }
                    }
                } else {
                    Text("Settings are not ready yet.")
                        .foregroundStyle(BeeveDesign.mutedText)
                }
            }
            .navigationTitle("Settings")
            .confirmationDialog("Reset Beeve data?", isPresented: $isShowingResetConfirmation) {
                Button("Reset local data", role: .destructive) {
                    resetData()
                }
            } message: {
                Text("This removes preferences, entries, focuses, and cards from this device.")
            }
        }
    }

    private func resetData() {
        preferences.forEach(modelContext.delete)
        focuses.forEach(modelContext.delete)
        entries.forEach(modelContext.delete)
        cards.forEach(modelContext.delete)
        modelContext.insert(UserPreferences())
        try? modelContext.save()
    }
}

private struct SettingsForm: View {
    @Environment(\.modelContext) private var modelContext
    @Bindable var preferences: UserPreferences
    @State private var isSavingSchedule = false

    var body: some View {
        Section("Future-you") {
            TextField("Preferred name", text: $preferences.preferredName)
            Picker("Tone", selection: Binding(
                get: { preferences.tone },
                set: { preferences.tone = $0 }
            )) {
                ForEach(FutureSelfTone.allCases) { tone in
                    Text(tone.label).tag(tone)
                }
            }
        }

        Section("Workday") {
            Stepper("Start: \(formatted(hour: preferences.workStartHour, minute: preferences.workStartMinute))", value: $preferences.workStartHour, in: 0...23)
            Stepper("End: \(formatted(hour: preferences.workEndHour, minute: preferences.workEndMinute))", value: $preferences.workEndHour, in: 0...23)
            Toggle("Daily reminders", isOn: $preferences.notificationsEnabled)

            Button {
                saveSchedule()
            } label: {
                if isSavingSchedule {
                    ProgressView()
                } else {
                    Text("Save reminder schedule")
                }
            }
        }
    }

    private func saveSchedule() {
        isSavingSchedule = true
        Task {
            if preferences.notificationsEnabled {
                preferences.notificationsEnabled = await NotificationScheduler().requestAuthorization()
            }
            preferences.updatedAt = .now
            try? modelContext.save()
            await NotificationScheduler().scheduleDailyReminders(preferences: preferences)
            isSavingSchedule = false
        }
    }

    private func formatted(hour: Int, minute: Int) -> String {
        String(format: "%02d:%02d", hour, minute)
    }
}
