import AuthenticationServices
import SwiftUI

struct ProfileView: View {
    @Environment(BeeveStore.self) private var store
    @State private var authService = AuthService()
    @State private var showAddMemory = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    profileHero
                    memorySection
                    preferencesSection
                    accountSection
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("Me")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("新增记忆", systemImage: "plus") {
                        showAddMemory = true
                    }
                }
            }
            .sheet(isPresented: $showAddMemory) {
                AddMemorySheet()
            }
        }
    }

    private var profileHero: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 14) {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [AppTheme.brand, AppTheme.capture],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 64, height: 64)
                    .overlay(
                        Text((authService.currentUser?.name ?? store.preferredName ?? "Beeve").prefix(1).uppercased())
                            .font(.title2.bold())
                            .foregroundStyle(.white)
                    )

                VStack(alignment: .leading, spacing: 4) {
                    Text(authService.currentUser?.name ?? store.preferredName ?? "Beeve 用户")
                        .font(.title2.bold())
                    Text(authService.isAuthenticated ? "已登录" : "Beeve 会根据你的偏好逐步贴合你的工作方式")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            Text("你的记忆、通知和账号设置都集中在这里。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(20)
        .appCard(tint: AppTheme.brand, cornerRadius: 28)
    }

    private var memorySection: some View {
        GlassSection(title: "Memory", symbol: "brain.head.profile", tint: AppTheme.capture) {
            if store.allMemoryItems.isEmpty {
                Text("还没有保存任何偏好。你可以添加工作时段、默认专注时长或称呼。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                VStack(spacing: 12) {
                    ForEach(store.allMemoryItems) { item in
                        HStack(spacing: 12) {
                            CircleIconBadge(symbol: symbol(for: item.category), tint: item.isEnabled ? AppTheme.capture : .secondary)

                            VStack(alignment: .leading, spacing: 4) {
                                Text(item.title)
                                    .font(.subheadline.weight(.semibold))
                                Text(item.value)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }

                            Spacer()

                            Toggle("", isOn: Binding(
                                get: { item.isEnabled },
                                set: { _ in store.toggleMemory(item) }
                            ))
                            .labelsHidden()

                            Button(role: .destructive) {
                                store.deleteMemory(item)
                            } label: {
                                Image(systemName: "trash")
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
    }

    private var preferencesSection: some View {
        GlassSection(title: "偏好设置", symbol: "slider.horizontal.3", tint: AppTheme.brand) {
            VStack(spacing: 14) {
                ProfileSettingRow(
                    title: "当前主路径",
                    subtitle: "Today / Capture / Me 三段式，先收集再推进",
                    symbol: "square.grid.2x2",
                    tint: AppTheme.brand
                )
                ProfileSettingRow(
                    title: "默认快速收集",
                    subtitle: "先进入 Capture 队列，再决定它是任务还是笔记",
                    symbol: "square.and.pencil",
                    tint: AppTheme.capture
                )
                ProfileSettingRow(
                    title: "专注节奏",
                    subtitle: "\(store.defaultFocusDuration) 分钟专注 + 5 分钟回顾",
                    symbol: "timer",
                    tint: AppTheme.warning
                )
            }
        }
    }

    private var accountSection: some View {
        GlassSection(title: "账号与数据", symbol: "person.text.rectangle", tint: AppTheme.success) {
            VStack(spacing: 12) {
                if authService.isAuthenticated {
                    ProfileActionButton(
                        title: "已登录",
                        subtitle: authService.currentUser?.email ?? "已通过 Apple 账号登录",
                        symbol: "checkmark.shield.fill",
                        tint: AppTheme.success,
                        action: {}
                    )
                    ProfileActionButton(
                        title: "退出登录",
                        subtitle: "清除本地登录状态",
                        symbol: "rectangle.portrait.and.arrow.right",
                        tint: .red,
                        action: { authService.signOut() }
                    )
                } else {
                    SignInWithAppleButton(.signIn) { request in
                        request.requestedScopes = [.fullName, .email]
                    } onCompletion: { result in
                        switch result {
                        case .success(let auth):
                            if let credential = auth.credential as? ASAuthorizationAppleIDCredential {
                                Task { await authService.signInWithApple(credential: credential) }
                            }
                        case .failure:
                            break
                        }
                    }
                    .signInWithAppleButtonStyle(.whiteOutline)
                    .frame(height: 50)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                ProfileActionButton(
                    title: "通知与提醒",
                    subtitle: "管理晨间计划、晚间回顾和提醒权限",
                    symbol: "bell.badge",
                    tint: AppTheme.warning,
                    action: {}
                )
                ProfileActionButton(
                    title: "隐私与数据",
                    subtitle: "所有记忆都可查看、停用和删除",
                    symbol: "lock.shield",
                    tint: AppTheme.success,
                    action: {}
                )
            }
        }
    }

    private func symbol(for category: UserMemoryCategory) -> String {
        switch category {
        case .identity: "person"
        case .schedule: "calendar"
        case .focus: "timer"
        case .preference: "slider.horizontal.3"
        }
    }
}

private struct AddMemorySheet: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var value = ""
    @State private var category: UserMemoryCategory = .preference

    var body: some View {
        NavigationStack {
            VStack(spacing: AppSpacing.section) {
                GlassSection(title: "记忆内容", symbol: "brain.head.profile", tint: AppTheme.capture) {
                    VStack(spacing: 12) {
                        TextField("标题，例如：工作时段", text: $title)
                            .textFieldStyle(.roundedBorder)
                        TextField("值，例如：09:00 - 18:00", text: $value)
                            .textFieldStyle(.roundedBorder)
                    }
                }

                GlassSection(title: "分类", symbol: "line.3.horizontal.decrease.circle", tint: AppTheme.brand) {
                    Picker("分类", selection: $category) {
                        ForEach(UserMemoryCategory.allCases) { item in
                            Text(item.label).tag(item)
                        }
                    }
                    .pickerStyle(.segmented)
                }
            }
            .padding()
            .background(AppBackgroundView())
            .navigationTitle("新增记忆")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("取消") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("保存") {
                        store.upsertMemory(title: title, value: value, category: category)
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }
}

struct ProfileSettingRow: View {
    let title: String
    let subtitle: String
    let symbol: String
    let tint: Color

    var body: some View {
        HStack(spacing: 12) {
            CircleIconBadge(symbol: symbol, tint: tint)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
    }
}

struct ProfileActionButton: View {
    let title: String
    let subtitle: String
    let symbol: String
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                CircleIconBadge(symbol: symbol, tint: tint)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    BeevePreview {
        ProfileView()
    }
}
