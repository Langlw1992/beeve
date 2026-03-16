import SwiftUI

struct ProfileView: View {
    @Environment(BeeveStore.self) private var store

    let onOpenAssistant: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 14) {
                            Circle()
                                .fill(
                                    LinearGradient(colors: [Color.indigo, Color.blue], startPoint: .topLeading, endPoint: .bottomTrailing)
                                )
                                .frame(width: 64, height: 64)
                                .overlay(
                                    Text("L")
                                        .font(.title2.bold())
                                        .foregroundStyle(.white)
                                )

                            VStack(alignment: .leading, spacing: 4) {
                                Text("Lang")
                                    .font(.title2.bold())
                                Text("Beeve 会逐步贴合你的节奏")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(18)
                    .appCard(tint: .cyan, cornerRadius: 28)

                    HeroMiniBanner(
                        title: "本周状态",
                        subtitle: "已完成 \(store.completedCount) 项，当前待处理 \(store.pendingCount) 项。继续保持轻量推进节奏。",
                        symbol: "chart.bar.fill",
                        tint: .indigo
                    )

                    GlassSection(title: "偏好设置", symbol: "slider.horizontal.3", tint: .indigo) {
                        VStack(spacing: 14) {
                            ProfileSettingRow(title: "建议入口", subtitle: "需要时再查看，不主动打断当前流程", symbol: "lightbulb", tint: .indigo)
                            ProfileSettingRow(title: "默认快速收集", subtitle: "先进入收件箱，稍后再分拣", symbol: "tray.full", tint: .purple)
                            ProfileSettingRow(title: "专注节奏", subtitle: "25 分钟专注 + 5 分钟回顾", symbol: "timer", tint: .orange)
                        }
                    }

                    GlassSection(title: "账号与数据", symbol: "person.text.rectangle", tint: .blue) {
                        VStack(spacing: 12) {
                            ProfileActionButton(title: "查看当前建议", subtitle: "需要时再看下一步，不打断手头工作", symbol: "text.bubble", tint: .blue, action: onOpenAssistant)
                            ProfileActionButton(title: "通知与提醒", subtitle: "下一步可接入本地通知与日程时间块", symbol: "bell.badge", tint: .orange, action: {})
                            ProfileActionButton(title: "隐私与数据", subtitle: "未来可在这里管理同步、导出和本地数据设置", symbol: "lock.shield", tint: .green, action: {})
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .navigationTitle("我的")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton(action: onOpenAssistant)
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
