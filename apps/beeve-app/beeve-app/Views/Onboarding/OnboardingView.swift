import SwiftData
import SwiftUI

struct OnboardingView: View {
    @Environment(\.modelContext) private var modelContext
    @Bindable var preferences: UserPreferences
    @State private var isSaving = false

    var body: some View {
        NavigationStack {
            Form {
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

                Section("Workday rhythm") {
                    Stepper("Start: \(formatted(hour: preferences.workStartHour, minute: preferences.workStartMinute))", value: $preferences.workStartHour, in: 0...23)
                    Stepper("End: \(formatted(hour: preferences.workEndHour, minute: preferences.workEndMinute))", value: $preferences.workEndHour, in: 0...23)
                    Toggle("Daily reminders", isOn: $preferences.notificationsEnabled)
                }

                Section {
                    Button {
                        complete()
                    } label: {
                        if isSaving {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        } else {
                            Text("Start with today")
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .disabled(isSaving)
                }
            }
            .navigationTitle("Set your rhythm")
        }
    }

    private func complete() {
        isSaving = true
        Task {
            if preferences.notificationsEnabled {
                preferences.notificationsEnabled = await NotificationScheduler().requestAuthorization()
                await NotificationScheduler().scheduleDailyReminders(preferences: preferences)
            }

            preferences.hasCompletedOnboarding = true
            preferences.updatedAt = .now
            try? modelContext.save()
            isSaving = false
        }
    }

    private func formatted(hour: Int, minute: Int) -> String {
        String(format: "%02d:%02d", hour, minute)
    }
}
