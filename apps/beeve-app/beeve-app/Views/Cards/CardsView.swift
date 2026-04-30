import SwiftData
import SwiftUI

struct CardsView: View {
    @Query(sort: \AchievementCard.createdAt, order: .reverse) private var cards: [AchievementCard]
    @State private var hasAppeared = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if cards.isEmpty {
                        VStack(alignment: .leading, spacing: 16) {
                            BeeveIconBubble(systemImage: "rectangle.stack.badge.plus", tint: BeeveDesign.warmAccent)
                            Text("还没有卡片")
                                .font(.title2.weight(.bold))
                            Text("先完成一次今天的收集。Beeve 会把推进、打断和明天的开头整理成一张可以回看的卡片。")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .beevePanel(padding: 22, tint: BeeveDesign.warmAccent)
                        .beeveReveal(hasAppeared)
                    } else {
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
            .navigationTitle("卡片")
            .background { BeeveSceneBackground() }
            .onAppear {
                hasAppeared = true
            }
        }
    }
}

#Preview("有卡片") {
    CardsView()
        .modelContainer(SampleData.previewContainer())
}

#Preview("空状态") {
    CardsView()
        .modelContainer(SampleData.previewContainer(includeHistory: false))
}
