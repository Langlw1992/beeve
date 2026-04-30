import SwiftData
import SwiftUI

struct CardsView: View {
    @Query(sort: \AchievementCard.createdAt, order: .reverse) private var cards: [AchievementCard]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if cards.isEmpty {
                        Text("No cards yet. Collect one day first.")
                            .foregroundStyle(BeeveDesign.mutedText)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .beevePanel()
                    } else {
                        ForEach(cards) { card in
                            AchievementCardView(card: card)
                        }
                    }
                }
                .padding(16)
            }
            .navigationTitle("Cards")
            .background(BeeveDesign.background)
        }
    }
}
