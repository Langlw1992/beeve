import AuthenticationServices
import SwiftUI

struct ProfileView: View {
    @Environment(BeeveStore.self) private var store
    @State private var authService = AuthService()
    @State private var showAddMemory = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DSSpace.lg) {
                    profileHero
                    memorySection
                    preferencesSection
                    accountSection
                }
                .padding(.horizontal, DSSpace.md)
                .padding(.top, DSComponent.pageTopInset)
                .padding(.bottom, DSComponent.pageBottomInset)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("设置")
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
        VStack(alignment: .leading, spacing: DSSpace.sm) {
            HStack(spacing: DSSpace.sm) {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [DSColor.brand, DSColor.ping],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 64, height: 64)
                    .overlay(
                        Text((authService.currentUser?.name ?? store.preferredName ?? "Beeve").prefix(1).uppercased())
                            .font(DSType.title)
                            .foregroundStyle(DSColor.surface2)
                    )

                VStack(alignment: .leading, spacing: DSSpace.xxs) {
                    Text(authService.currentUser?.name ?? store.preferredName ?? "Beeve 用户")
                        .font(DSType.title)
                        .foregroundStyle(DSColor.textPrimary)
                    Text(authService.isAuthenticated ? "已登录" : "Beeve 会根据你的偏好逐步贴合你的工作方式")
                        .font(DSType.body)
                        .foregroundStyle(DSColor.textSecondary)
                }
            }

            Text("你的记忆、通知和账号设置都集中在这里。")
                .font(DSType.body)
                .foregroundStyle(DSColor.textSecondary)
        }
        .padding(DSSpace.md)
        .appCard(tint: DSColor.brand, cornerRadius: DSRadius.hero)
    }

    private var memorySection: some View {
        GlassSection(title: "记忆", symbol: "brain.head.profile", tint: DSColor.ping) {
            if store.allMemoryItems.isEmpty {
                Text("还没有保存任何偏好。你可以添加工作时段、默认专注时长或称呼。")
                    .font(DSType.body)
                    .foregroundStyle(DSColor.textSecondary)
            } else {
                VStack(spacing: DSSpace.sm) {
                    ForEach(store.allMemoryItems) { item in
                        HStack(spacing: DSSpace.sm) {
                            CircleIconBadge(symbol: symbol(for: item.category), tint: item.isEnabled ? DSColor.ping : DSColor.textSecondary)

                            VStack(alignment: .leading, spacing: DSSpace.xxs) {
                                Text(item.title)
                                    .font(DSType.labelBold)
                                    .foregroundStyle(DSColor.textPrimary)
                                Text(item.value)
                                    .font(DSType.caption)
                                    .foregroundStyle(DSColor.textSecondary)
                            }
                            .layoutPriority(1)

                            Spacer()

                            Toggle("", isOn: Binding(
                                get: { item.isEnabled },
                                set: { _ in store.toggleMemory(item) }
                            ))
                            .labelsHidden()
                            .scaleEffect(DSComponent.toggleScale)

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
        GlassSection(title: "偏好设置", symbol: "slider.horizontal.3", tint: DSColor.brand) {
            VStack(spacing: DSSpace.sm) {
                ProfileSettingRow(
                    title: "当前主路径",
                    subtitle: "今日 / Ping / 工作台 三段式，先 Ping 再推进",
                    symbol: "square.grid.2x2",
                    tint: DSColor.brand
                )
                ProfileSettingRow(
                    title: "默认快速 Ping",
                    subtitle: "先进入 Ping 收件箱，再决定它是任务还是笔记",
                    symbol: "antenna.radiowaves.left.and.right",
                    tint: DSColor.ping
                )
                ProfileSettingRow(
                    title: "专注节奏",
                    subtitle: "\(store.defaultFocusDuration) 分钟专注 + 5 分钟回顾",
                    symbol: "timer",
                    tint: DSColor.warning
                )
            }
        }
    }

    private var accountSection: some View {
        GlassSection(title: "账号与数据", symbol: "person.text.rectangle", tint: DSColor.success) {
            VStack(spacing: DSSpace.sm) {
                if authService.isAuthenticated {
                    ProfileActionButton(
                        title: "已登录",
                        subtitle: authService.currentUser?.email ?? "已通过 Apple 账号登录",
                        symbol: "checkmark.shield.fill",
                        tint: DSColor.success,
                        action: {}
                    )
                    ProfileActionButton(
                        title: "退出登录",
                        subtitle: "清除本地登录状态",
                        symbol: "rectangle.portrait.and.arrow.right",
                        tint: DSColor.danger,
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
                    .frame(height: DSComponent.rowMinHeight)
                    .clipShape(RoundedRectangle(cornerRadius: DSRadius.control, style: .continuous))
                }

                ProfileActionButton(
                    title: "通知与任务",
                    subtitle: "管理晨间计划、晚间回顾和任务通知",
                    symbol: "bell.badge",
                    tint: DSColor.warning,
                    action: {}
                )
                ProfileActionButton(
                    title: "隐私与数据",
                    subtitle: "所有记忆都可查看、停用和删除",
                    symbol: "lock.shield",
                    tint: DSColor.success,
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
            VStack(spacing: DSSpace.lg) {
                GlassSection(title: "记忆内容", symbol: "brain.head.profile", tint: DSColor.ping) {
                    VStack(spacing: DSSpace.sm) {
                        TextField("标题，例如：工作时段", text: $title)
                            .textFieldStyle(.roundedBorder)
                        TextField("值，例如：09:00 - 18:00", text: $value)
                            .textFieldStyle(.roundedBorder)
                    }
                }

                GlassSection(title: "分类", symbol: "line.3.horizontal.decrease.circle", tint: DSColor.brand) {
                    Picker("分类", selection: $category) {
                        ForEach(UserMemoryCategory.allCases) { item in
                            Text(item.label).tag(item)
                        }
                    }
                    .pickerStyle(.segmented)
                }
            }
            .padding(DSSpace.md)
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
        HStack(spacing: DSSpace.sm) {
            CircleIconBadge(symbol: symbol, tint: tint)

            VStack(alignment: .leading, spacing: DSSpace.xxs) {
                Text(title)
                    .font(DSType.labelBold)
                    .foregroundStyle(DSColor.textPrimary)
                Text(subtitle)
                    .font(DSType.caption)
                    .foregroundStyle(DSColor.textSecondary)
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
            HStack(spacing: DSSpace.sm) {
                CircleIconBadge(symbol: symbol, tint: tint)

                VStack(alignment: .leading, spacing: DSSpace.xxs) {
                    Text(title)
                        .font(DSType.labelBold)
                        .foregroundStyle(DSColor.textPrimary)
                    Text(subtitle)
                        .font(DSType.caption)
                        .foregroundStyle(DSColor.textSecondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(DSType.captionBold)
                    .foregroundStyle(DSColor.textTertiary)
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
