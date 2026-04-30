import SwiftData
import SwiftUI

struct CardsView: View {
    @Query(sort: \AchievementCard.createdAt, order: .reverse) private var cards: [AchievementCard]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if cards.isEmpty {
                        VStack(alignment: .leading, spacing: 14) {
                            BeeveIconBubble(systemImage: "rectangle.stack.badge.plus")
                            Text("No cards yet")
                                .font(.title3.weight(.semibold))
                            Text("Collect today first. Beeve will turn your notes into a compact record you can revisit.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .beevePanel(padding: 18)
                    } else {
                        ForEach(cards) { card in
                            AchievementCardView(card: card)
                        }
                    }
                }
                .padding(.horizontal, BeeveDesign.contentPadding)
                .padding(.top, 12)
                .padding(.bottom, 120)
            }
            .navigationTitle("Cards")
            .background(BeeveDesign.background)
        }
    }
}

#Preview("With cards") {
    CardsView()
        .modelContainer(SampleData.previewContainer())
}

#Preview("Empty") {
    CardsView()
        .modelContainer(SampleData.previewContainer(includeHistory: false))
}
