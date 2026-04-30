import SwiftData
import SwiftUI

struct OnboardingView: View {
    @Environment(\.modelContext) private var modelContext
    @Bindable var preferences: UserPreferences
    @State private var isSaving = false
    @State private var hasAppeared = false

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
            .background(BeeveDesign.subtleBackgroundGradient.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .safeAreaInset(edge: .bottom) {
                Button {
                    BeeveHaptics.lightImpact()
                    complete()
                } label: {
                    if isSaving {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("从今天开始")
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
            .onAppear {
                hasAppeared = true
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 16) {
            BeeveIconBubble(systemImage: "sparkles", tint: BeeveDesign.accent)

            Text("给明天留一条清晰线索")
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(.primary)
                .lineLimit(2)
                .minimumScaleFactor(0.75)

            Text("Beeve 不要求你完美复盘。每天只收集一个推进、一次打断和一个明天的开头。")
                .font(.body)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.top, 8)
        .beeveReveal(hasAppeared)
    }

    private var futureSelfPanel: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                BeeveIconBubble(systemImage: "person.crop.circle.badge.checkmark")
                BeeveSectionHeader(
                    title: "未来的你",
                    subtitle: "选择一个不会打扰你、但能把你拉回来的声音。"
                )
            }

            TextField("你希望 Beeve 怎么称呼你", text: $preferences.preferredName)
                .textContentType(.name)
                .textInputAutocapitalization(.words)
                .font(.body)
                .beeveInputSurface()

            Picker("语气", selection: Binding(
                get: { preferences.tone },
                set: {
                    BeeveHaptics.selection()
                    preferences.tone = $0
                }
            )) {
                ForEach(FutureSelfTone.allCases) { tone in
                    Text(tone.label).tag(tone)
                }
            }
            .pickerStyle(.segmented)
        }
        .beevePanel(tint: BeeveDesign.accent)
        .beeveReveal(hasAppeared, delay: 0.06)
    }

    private var rhythmPanel: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                BeeveIconBubble(systemImage: "clock.badge.checkmark")
                BeeveSectionHeader(
                    title: "工作节奏",
                    subtitle: "提醒只会出现在你设定的时间里。"
                )
            }

            VStack(spacing: 0) {
                Stepper(value: $preferences.workStartHour, in: 0...23) {
                    scheduleRow(
                        title: "开始",
                        value: formatted(hour: preferences.workStartHour, minute: preferences.workStartMinute)
                    )
                }
                .accessibilityLabel("工作日开始时间")
                .accessibilityValue(formatted(hour: preferences.workStartHour, minute: preferences.workStartMinute))

                Divider()
                    .padding(.vertical, 12)

                Stepper(value: $preferences.workEndHour, in: 0...23) {
                    scheduleRow(
                        title: "结束",
                        value: formatted(hour: preferences.workEndHour, minute: preferences.workEndMinute)
                    )
                }
                .accessibilityLabel("工作日结束时间")
                .accessibilityValue(formatted(hour: preferences.workEndHour, minute: preferences.workEndMinute))

                Divider()
                    .padding(.vertical, 12)

                Toggle(isOn: $preferences.notificationsEnabled) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("每日提醒")
                            .font(.body)
                        Text("当一天开始散掉时，给你一个轻提示。")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
                .tint(BeeveDesign.accent)
            }
        }
        .beevePanel(tint: BeeveDesign.accentDeep)
        .beeveReveal(hasAppeared, delay: 0.12)
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
            BeeveHaptics.success()
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
