import SwiftUI

struct AchievementCardView: View {
    let card: AchievementCard

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .center, spacing: 12) {
                BeeveIconBubble(systemImage: "sparkles", tint: Color(.systemBrown))
                VStack(alignment: .leading, spacing: 2) {
                    Text(card.date.formatted(.dateTime.weekday(.wide).month().day()))
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(.secondary)
                    Text("Achievement card")
                        .font(.headline)
                }
            }

            Text(card.title)
                .font(.title2.weight(.semibold))
                .fixedSize(horizontal: false, vertical: true)

            VStack(alignment: .leading, spacing: 10) {
                ForEach(card.summaryBullets, id: \.self) { bullet in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.subheadline)
                            .foregroundStyle(Color(.systemGreen))
                            .padding(.top, 2)
                        Text(bullet)
                            .font(.body)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            .padding(14)
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))

            Text(card.interruptionReframe)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)

            if !card.tomorrowPriorities.isEmpty {
                Divider()
                VStack(alignment: .leading, spacing: 10) {
                    Text("Tomorrow")
                        .font(.headline)
                    ForEach(card.tomorrowPriorities, id: \.self) { priority in
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "arrow.right.circle.fill")
                                .font(.subheadline)
                                .foregroundStyle(BeeveDesign.accent)
                                .padding(.top, 2)
                            Text(priority)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }

            Divider()
            Text(card.closingLine)
                .font(.callout.weight(.semibold))
                .foregroundStyle(BeeveDesign.accent)
                .fixedSize(horizontal: false, vertical: true)
        }
        .beevePanel(padding: 18)
    }
}
