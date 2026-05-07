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
                    BeeveAPISettingsForm()

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

private struct BeeveAPISettingsForm: View {
    @State private var apiBaseURL = BeeveAPISettings.apiBaseURL
    @State private var isSaved = false

    var body: some View {
        Section {
            TextField("API 地址", text: $apiBaseURL)
                .textContentType(.URL)
                .keyboardType(.URL)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)

            Button {
                BeeveAPISettings.apiBaseURL = apiBaseURL
                isSaved = true
                BeeveHaptics.success()
            } label: {
                Label(isSaved ? "已保存" : "保存 Beeve API 设置", systemImage: isSaved ? "checkmark" : "network")
            }
            .tint(BeeveDesign.accent)
        } header: {
            Text("Beeve API")
        } footer: {
            Text("App 只连接 Beeve 后端，模型服务密钥保存在服务端环境变量中。默认本机地址适合模拟器调试。")
        }
        .onChange(of: apiBaseURL) { _, _ in
            isSaved = false
        }
    }
}

#Preview {
    SettingsView()
        .modelContainer(SampleData.previewContainer())
}
