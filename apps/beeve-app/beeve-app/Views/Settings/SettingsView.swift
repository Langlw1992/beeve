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
                    DeepSeekSettingsForm()

                    Section {
                        Button("重置本机数据", role: .destructive) {
                            BeeveHaptics.lightImpact()
                            isShowingResetConfirmation = true
                        }
                    } header: {
                        Text("本机数据")
                    } footer: {
                        Text("只会影响当前设备上的 Beeve 数据。")
                    }
                } else {
                    Text("设置暂时还没有准备好。")
                        .foregroundStyle(BeeveDesign.mutedText)
                }
            }
            .scrollContentBackground(.hidden)
            .background { BeeveSceneBackground() }
            .navigationTitle("设置")
            .confirmationDialog("重置 Beeve 数据？", isPresented: $isShowingResetConfirmation) {
                Button("重置本机数据", role: .destructive) {
                    resetData()
                }
            } message: {
                Text("这会删除当前设备上的偏好设置、记录、焦点和卡片。")
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
        BeeveHaptics.success()
    }
}

private struct SettingsForm: View {
    @Environment(\.modelContext) private var modelContext
    @Bindable var preferences: UserPreferences
    @State private var isSavingSchedule = false

    var body: some View {
        Section("未来的你") {
            TextField("称呼", text: $preferences.preferredName)
                .textContentType(.name)
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
        }

        Section("工作节奏") {
            Stepper("开始：\(formatted(hour: preferences.workStartHour, minute: preferences.workStartMinute))", value: $preferences.workStartHour, in: 0...23)
            Stepper("结束：\(formatted(hour: preferences.workEndHour, minute: preferences.workEndMinute))", value: $preferences.workEndHour, in: 0...23)
            Toggle("每日提醒", isOn: $preferences.notificationsEnabled)
                .tint(BeeveDesign.accent)

            Button {
                BeeveHaptics.lightImpact()
                saveSchedule()
            } label: {
                if isSavingSchedule {
                    ProgressView()
                } else {
                    Text("保存提醒时间")
                }
            }
            .tint(BeeveDesign.accent)
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
            BeeveHaptics.success()
            isSavingSchedule = false
        }
    }

    private func formatted(hour: Int, minute: Int) -> String {
        String(format: "%02d:%02d", hour, minute)
    }
}

private struct DeepSeekSettingsForm: View {
    @State private var apiKey = DeepSeekSettings.apiKey
    @State private var model = DeepSeekSettings.model
    @State private var isSaved = false

    private let models = [
        "deepseek-v4-flash",
        "deepseek-v4-pro",
        "deepseek-chat",
    ]

    var body: some View {
        Section {
            SecureField("API Key", text: $apiKey)
                .textContentType(.password)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)

            Picker("模型", selection: $model) {
                ForEach(models, id: \.self) { model in
                    Text(model).tag(model)
                }
            }

            Button {
                DeepSeekSettings.apiKey = apiKey
                DeepSeekSettings.model = model
                isSaved = true
                BeeveHaptics.success()
            } label: {
                Label(isSaved ? "已保存" : "保存 DeepSeek 设置", systemImage: isSaved ? "checkmark" : "key")
            }
            .tint(BeeveDesign.accent)
        } header: {
            Text("DeepSeek")
        } footer: {
            Text("Key 仅保存在本机设置中。当前助手优先使用 DeepSeek，失败时回到本地建议。")
        }
        .onChange(of: apiKey) { _, _ in
            isSaved = false
        }
        .onChange(of: model) { _, _ in
            isSaved = false
        }
    }
}

#Preview {
    SettingsView()
        .modelContainer(SampleData.previewContainer())
}
