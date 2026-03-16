import SwiftUI

// MARK: - Spotlight Carousel

struct SpotlightCarousel: View {
    @Binding var selection: Int
    let overdueCount: Int
    let inboxCount: Int
    let todayCount: Int
    let upcomingCount: Int
    let nextReminderTitle: String?
    let onAddReminder: () -> Void
    let onOpenReminders: () -> Void
    let onOpenAssistant: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                SurfaceKicker(title: "Focus", symbol: "viewfinder.circle", tint: selectionTint)
                Spacer()
                Text("\(selection + 1)/3")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .contentTransition(.numericText())
            }

            Text("焦点视图")
                .font(.title3.bold())
                .foregroundStyle(.primary)

            TabView(selection: $selection) {
                EditorialSpotlightCard(
                    eyebrow: "INBOX",
                    title: inboxCount > 0 ? "还有 \(inboxCount) 条想法等你落地" : "收件箱已经清空",
                    detail: inboxCount > 0 ? "现在适合做一轮快速分拣，把模糊任务变成具体安排。" : "可以顺手记录新想法，保持列表轻盈。",
                    accent: .purple,
                    symbol: "tray.full.fill",
                    primaryTitle: "去分拣",
                    primaryAction: onOpenReminders
                )
                .tag(0)

                EditorialSpotlightCard(
                    eyebrow: "FOCUS",
                    title: nextReminderTitle ?? "把最重要的一项先推起来",
                    detail: nextReminderTitle != nil ? "先推进眼前最关键的动作，再决定今天剩余时间怎么分配。" : "如果你还没开始，先挑一件最想完成的事。",
                    accent: .indigo,
                    symbol: "sparkles.rectangle.stack",
                    primaryTitle: "看建议",
                    primaryAction: onOpenAssistant
                )
                .tag(1)

                EditorialSpotlightCard(
                    eyebrow: "FLOW",
                    title: "今天 \(todayCount) 项，接下来 \(upcomingCount) 项",
                    detail: overdueCount > 0 ? "先处理逾期，再回到今天主线，你会更有掌控感。" : "当前节奏不错，可以趁状态顺手补一条新提醒。",
                    accent: .orange,
                    symbol: "calendar.day.timeline.left",
                    primaryTitle: "快速收集",
                    primaryAction: onAddReminder
                )
                .tag(2)
            }
            .frame(height: 188)
            .tabViewStyle(.page(indexDisplayMode: .never))

            HStack(spacing: 8) {
                ForEach(0..<3, id: \.self) { index in
                    Capsule()
                        .fill(index == selection ? Color.accentColor : Color.primary.opacity(0.12))
                        .frame(width: index == selection ? 18 : 8, height: 8)
                        .animation(.snappy, value: selection)
                }
            }
        }
    }

    private var selectionTint: Color {
        switch selection {
        case 0: .purple
        case 1: .indigo
        default: .orange
        }
    }
}

// MARK: - Editorial Spotlight Card

struct EditorialSpotlightCard: View {
    let eyebrow: String
    let title: String
    let detail: String
    let accent: Color
    let symbol: String
    let primaryTitle: String
    let primaryAction: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    SurfaceKicker(title: eyebrow, symbol: symbol, tint: accent)
                    Text(title)
                        .font(.title3.bold())
                        .foregroundStyle(.primary)
                        .multilineTextAlignment(.leading)
                }

                Spacer()

                CircleIconBadge(symbol: symbol, tint: accent, size: 42, iconSize: 17)
            }

            Text(detail)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.leading)

            Spacer(minLength: 0)

            Button(primaryTitle, action: primaryAction)
                .buttonStyle(.borderedProminent)
                .tint(accent)
        }
        .padding(20)
        .appCard(tint: accent, cornerRadius: 28)
        .contentShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .buttonStyle(PressableScaleButtonStyle())
    }
}
