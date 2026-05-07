import SwiftData
import SwiftUI

struct CardsView: View {
    @Query(sort: \AchievementCard.createdAt, order: .reverse) private var cards: [AchievementCard]
    @State private var hasAppeared = false

    private static let zhDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_Hans_CN")
        formatter.dateFormat = "M月d日"
        return formatter
    }()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    ReviewOverview(cards: cards, formattedLatestDate: latestDateText)
                        .beeveReveal(hasAppeared)

                    if cards.isEmpty {
                        VStack(alignment: .leading, spacing: 16) {
                            BeeveIconBubble(systemImage: "clock.badge.questionmark", tint: BeeveDesign.warmAccent)
                            Text("还没有可回看的内容")
                                .font(.title2.weight(.bold))
                            Text("先完成一次今天的整理。Beeve 会把推进、打断和明天的开头收束成之后能接上的线索。")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .beevePanel(padding: 22, tint: BeeveDesign.warmAccent)
                        .beeveReveal(hasAppeared)
                    } else {
                        Text("最近")
                            .font(.footnote.weight(.semibold))
                            .foregroundStyle(.secondary)
                            .padding(.horizontal, 4)

                        ForEach(cards) { card in
                            AchievementCardView(card: card)
                                .beeveReveal(hasAppeared)
                        }
                    }
                }
                .padding(.horizontal, BeeveDesign.contentPadding)
                .padding(.top, 12)
                .padding(.bottom, 120)
            }
            .navigationTitle("回看")
            .background { BeeveSceneBackground() }
            .onAppear {
                hasAppeared = true
            }
        }
    }

    private var latestDateText: String {
        guard let date = cards.first?.date else {
            return "还没有"
        }

        return Self.zhDateFormatter.string(from: date)
    }
}

private struct ReviewOverview: View {
    let cards: [AchievementCard]
    let formattedLatestDate: String

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 12) {
                BeeveIconBubble(systemImage: "clock.arrow.circlepath", tint: BeeveDesign.warmAccent)

                VStack(alignment: .leading, spacing: 4) {
                    Text("回看之前的线索")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(BeeveDesign.primaryText)
                    Text("不是存档，是帮你接上之前的主线。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer()
            }

            HStack(spacing: 8) {
                ReviewMetric(value: "\(cards.count)", label: "已整理")
                ReviewMetric(value: formattedLatestDate, label: "最近一次")
            }
        }
        .beevePanel(padding: 18, tint: BeeveDesign.warmAccent)
    }
}

private struct ReviewMetric: View {
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value)
                .font(.headline.weight(.semibold))
                .foregroundStyle(BeeveDesign.primaryText)
                .lineLimit(1)
                .minimumScaleFactor(0.75)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(BeeveDesign.elevatedSurface.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
    }
}

#Preview("有回看") {
    CardsView()
        .modelContainer(SampleData.previewContainer())
}

#Preview("空状态") {
    CardsView()
        .modelContainer(SampleData.previewContainer(includeHistory: false))
}
