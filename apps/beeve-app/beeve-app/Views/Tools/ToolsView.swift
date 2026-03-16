import SwiftUI

struct ToolsView: View {
    @Environment(BeeveStore.self) private var store
    @State private var destination: ToolDestination?

    let onOpenAssistant: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    HeroMiniBanner(
                        title: "工具箱",
                        subtitle: "把高频动作收在一个地方，减少在不同 App 之间来回切换。",
                        symbol: "square.grid.2x2.fill",
                        tint: .orange
                    )

                    GlassSection(title: "核心工具", symbol: "star.fill", tint: .orange) {
                        VStack(spacing: 0) {
                            ToolNavRow(title: "专注计时", description: "番茄钟模式，关联任务深度专注", symbol: "timer", tint: .orange) {
                                destination = .focus
                            }
                            SectionDivider()
                            ToolNavRow(title: "习惯追踪", description: "每日打卡，积累连续天数", symbol: "flame.fill", tint: .green) {
                                destination = .habits
                            }
                            SectionDivider()
                            ToolNavRow(title: "快捷笔记", description: "灵感速记，支持收藏和归档", symbol: "note.text", tint: .cyan) {
                                destination = .notes
                            }
                            SectionDivider()
                            ToolNavRow(title: "数据统计", description: "完成率、专注时长、习惯连续天数", symbol: "chart.bar.xaxis.ascending", tint: .indigo) {
                                destination = .statistics
                            }
                        }
                    }

                    GlassSection(title: "快捷操作", symbol: "bolt.fill", tint: .purple) {
                        VStack(spacing: 0) {
                            ToolNavRow(title: "清空收件箱", description: "批量分拣未安排的事项", symbol: "tray.full", tint: .purple) {
                                // Navigate to reminders inbox filter
                            }
                            SectionDivider()
                            ToolNavRow(title: "问问助手", description: "让 Beeve 帮你安排、拆解、复盘", symbol: "bubble.left.and.bubble.right", tint: .indigo, action: onOpenAssistant)
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("工具")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton(action: onOpenAssistant)
                }
            }
            .navigationDestination(item: $destination) { dest in
                switch dest {
                case .focus:
                    FocusTimerView()
                case .habits:
                    HabitsView()
                case .notes:
                    NotesView()
                case .statistics:
                    StatisticsView()
                }
            }
        }
    }
}

enum ToolDestination: Hashable, Identifiable {
    case focus, habits, notes, statistics
    var id: Self { self }
}

struct ToolNavRow: View {
    let title: String
    let description: String
    let symbol: String
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                CircleIconBadge(symbol: symbol, tint: tint, size: 38, iconSize: 15)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                    Text(description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
    }
}
