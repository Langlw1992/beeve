import SwiftData
import SwiftUI

struct OnboardingView: View {
    @Environment(\.modelContext) private var modelContext
    @Bindable var preferences: UserPreferences
    @State private var isSaving = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    header
                    futureSelfPanel
                    rhythmPanel
                }
                .padding(.horizontal, BeeveDesign.contentPadding)
                .padding(.top, 24)
                .padding(.bottom, 96)
            }
            .background(BeeveDesign.background)
            .navigationBarTitleDisplayMode(.inline)
            .safeAreaInset(edge: .bottom) {
                Button {
                    complete()
                } label: {
                    if isSaving {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Start with today")
                    }
                }
                .buttonStyle(BeevePrimaryButtonStyle())
                .disabled(isSaving)
                .opacity(isSaving ? 0.7 : 1)
                .padding(.horizontal, BeeveDesign.contentPadding)
                .padding(.top, 12)
                .padding(.bottom, 12)
                .background(.regularMaterial)
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Set your rhythm")
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(.primary)
                .lineLimit(2)
                .minimumScaleFactor(0.75)

            Text("Choose how future-you should speak, then give tomorrow a cleaner start.")
                .font(.body)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.top, 8)
    }

    private var futureSelfPanel: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                BeeveIconBubble(systemImage: "person.crop.circle.badge.checkmark")
                BeeveSectionHeader(
                    title: "Future-you",
                    subtitle: "A short voice that keeps the day honest."
                )
            }

            TextField("Preferred name", text: $preferences.preferredName)
                .textContentType(.name)
                .textInputAutocapitalization(.words)
                .font(.body)
                .padding(.horizontal, 16)
                .frame(minHeight: BeeveDesign.controlHeight)
                .background(BeeveDesign.elevatedSurface)
                .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous)
                        .stroke(BeeveDesign.border, lineWidth: 1)
                }

            Picker("Tone", selection: Binding(
                get: { preferences.tone },
                set: { preferences.tone = $0 }
            )) {
                ForEach(FutureSelfTone.allCases) { tone in
                    Text(tone.label).tag(tone)
                }
            }
            .pickerStyle(.segmented)
        }
        .beevePanel()
    }

    private var rhythmPanel: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                BeeveIconBubble(systemImage: "clock.badge.checkmark")
                BeeveSectionHeader(
                    title: "Workday rhythm",
                    subtitle: "Reminders stay inside the hours you choose."
                )
            }

            VStack(spacing: 0) {
                Stepper(value: $preferences.workStartHour, in: 0...23) {
                    scheduleRow(
                        title: "Start",
                        value: formatted(hour: preferences.workStartHour, minute: preferences.workStartMinute)
                    )
                }
                .accessibilityLabel("Workday start time")
                .accessibilityValue(formatted(hour: preferences.workStartHour, minute: preferences.workStartMinute))

                Divider()
                    .padding(.vertical, 12)

                Stepper(value: $preferences.workEndHour, in: 0...23) {
                    scheduleRow(
                        title: "End",
                        value: formatted(hour: preferences.workEndHour, minute: preferences.workEndMinute)
                    )
                }
                .accessibilityLabel("Workday end time")
                .accessibilityValue(formatted(hour: preferences.workEndHour, minute: preferences.workEndMinute))

                Divider()
                    .padding(.vertical, 12)

                Toggle(isOn: $preferences.notificationsEnabled) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Daily reminders")
                            .font(.body)
                        Text("Gentle prompts when the day starts to blur.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
                .tint(BeeveDesign.accent)
            }
        }
        .beevePanel()
    }

    private func scheduleRow(title: String, value: String) -> some View {
        HStack(spacing: 12) {
            Text(title)
                .font(.body)
            Spacer()
            Text(value)
                .font(.body.monospacedDigit().weight(.medium))
                .foregroundStyle(.secondary)
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

#Preview {
    let container = SampleData.previewContainer(
        hasCompletedOnboarding: false,
        includeHistory: false
    )

    OnboardingView(preferences: SampleData.previewPreferences(from: container))
        .modelContainer(container)
}
