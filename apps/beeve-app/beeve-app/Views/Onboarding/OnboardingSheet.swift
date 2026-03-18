import SwiftUI

struct OnboardingSheet: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var preferredName = ""
    @State private var workHours = "09:00 - 18:00"
    @State private var focusDuration = 25
    @State private var tone = "直接、简洁"

    let onFinish: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppSpacing.section) {
                    hero

                    GlassSection(title: "你的节奏", symbol: "person.crop.circle", tint: AppTheme.brand) {
                        VStack(spacing: 12) {
                            TextField("你希望 Beeve 怎么称呼你", text: $preferredName)
                                .textFieldStyle(.roundedBorder)

                            TextField("常用工作时段", text: $workHours)
                                .textFieldStyle(.roundedBorder)
                        }
                    }

                    GlassSection(title: "默认专注时长", symbol: "timer", tint: AppTheme.warning) {
                        Picker("默认专注时长", selection: $focusDuration) {
                            Text("15 分钟").tag(15)
                            Text("25 分钟").tag(25)
                            Text("50 分钟").tag(50)
                        }
                        .pickerStyle(.segmented)
                    }

                    GlassSection(title: "沟通风格", symbol: "bubble.left.and.bubble.right", tint: AppTheme.capture) {
                        Picker("风格", selection: $tone) {
                            Text("直接、简洁").tag("直接、简洁")
                            Text("温和、鼓励").tag("温和、鼓励")
                            Text("偏执行导向").tag("偏执行导向")
                        }
                        .pickerStyle(.segmented)
                    }
                }
                .padding()
                .padding(.bottom, 24)
            }
            .background(AppBackgroundView())
            .navigationTitle("欢迎使用 Beeve")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("跳过") {
                        onFinish()
                        dismiss()
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button("完成") {
                        store.saveOnboardingProfile(
                            preferredName: preferredName,
                            workHours: workHours,
                            focusDuration: focusDuration,
                            tone: tone
                        )
                        onFinish()
                        dismiss()
                    }
                }
            }
        }
    }

    private var hero: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("先告诉 Beeve 你平时怎么工作。")
                .font(.system(size: 30, weight: .bold, design: .rounded))
            Text("我只记录能直接帮你规划和推进事情的偏好，而且这些记忆都能随时查看、关闭或删除。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(22)
        .appCard(tint: AppTheme.brand, cornerRadius: 28)
    }
}
