import SwiftUI

struct WorkspaceView: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DSSpace.lg) {
                    introCard

                    VStack(spacing: DSSpace.md) {
                        entryLink(title: "任务", description: "收件箱、今天、即将到来的一站管理", systemImage: "checkmark.circle", tint: DSColor.brand) {
                            RemindersView()
                        }
                        entryLink(title: "日程", description: "把今天与接下来几天排成一条时间线", systemImage: "calendar", tint: DSColor.info) {
                            DailyPlannerView()
                        }
                        entryLink(title: "笔记", description: "沉淀长文本、会议记录与灵感脉络", systemImage: "note.text", tint: DSColor.ping) {
                            NotesView()
                        }
                        entryLink(title: "习惯", description: "追踪日常节奏和连续完成情况", systemImage: "flame", tint: DSColor.warning) {
                            HabitsView()
                        }
                        entryLink(title: "统计", description: "查看专注、任务与习惯的推进情况", systemImage: "chart.bar", tint: DSColor.success) {
                            StatisticsView()
                        }
                    }
                }
                .padding(.horizontal, DSSpace.md)
                .padding(.top, DSSpace.lg)
                .padding(.bottom, DSSpace.xl)
            }
            .background(DSColor.bg.ignoresSafeArea())
            .navigationTitle("工作台")
        }
    }

    private var introCard: some View {
        VStack(alignment: .leading, spacing: DSSpace.sm) {
            Text("统一入口")
                .font(DSType.section)
                .foregroundStyle(DSColor.textPrimary)

            Text("把任务、日程、笔记、习惯和统计集中到这里，需要推进时直接进入对应模块。")
                .font(DSType.body)
                .foregroundStyle(DSColor.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(DSSpace.lg)
        .background(cardBackground(tint: DSColor.brandSoft))
    }

    private func entryLink<Destination: View>(
        title: String,
        description: String,
        systemImage: String,
        tint: Color,
        @ViewBuilder destination: @escaping () -> Destination
    ) -> some View {
        NavigationLink {
            destination()
        } label: {
            HStack(spacing: DSSpace.md) {
                ZStack {
                    RoundedRectangle(cornerRadius: DSRadius.control, style: .continuous)
                        .fill(tint.opacity(0.12))
                        .frame(width: 48, height: 48)

                    Image(systemName: systemImage)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(tint)
                }

                VStack(alignment: .leading, spacing: DSSpace.xxs) {
                    Text(title)
                        .font(DSType.section)
                        .foregroundStyle(DSColor.textPrimary)

                    Text(description)
                        .font(DSType.meta)
                        .foregroundStyle(DSColor.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer(minLength: DSSpace.sm)

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(DSColor.textTertiary)
            }
            .padding(DSSpace.md)
            .background(cardBackground(tint: tint))
        }
        .buttonStyle(.plain)
    }

    private func cardBackground(tint: Color) -> some View {
        let shadow = DSShadow.card(for: colorScheme)

        return RoundedRectangle(cornerRadius: DSRadius.hero, style: .continuous)
            .fill(DSColor.surface2)
            .overlay(
                RoundedRectangle(cornerRadius: DSRadius.hero, style: .continuous)
                    .strokeBorder(tint.opacity(0.12), lineWidth: 1)
            )
            .shadow(color: shadow.color, radius: shadow.radius, x: shadow.x, y: shadow.y)
            .overlay(
                RoundedRectangle(cornerRadius: DSRadius.hero, style: .continuous)
                    .strokeBorder(shadow.compensationColor, lineWidth: shadow.compensationLineWidth)
            )
    }
}

#Preview {
    BeevePreview {
        WorkspaceView()
    }
}