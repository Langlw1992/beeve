import SwiftUI

struct AchievementCardView: View {
    let card: AchievementCard

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(card.date.formatted(.dateTime.weekday(.wide).month().day()))
                .font(.caption.weight(.semibold))
                .foregroundStyle(BeeveDesign.mutedText)
                .textCase(.uppercase)

            Text(card.title)
                .font(.title3.weight(.semibold))

            ForEach(card.summaryBullets, id: \.self) { bullet in
                Label(bullet, systemImage: "checkmark.circle")
                    .labelStyle(.titleAndIcon)
            }

            Text(card.interruptionReframe)
                .foregroundStyle(BeeveDesign.mutedText)

            if !card.tomorrowPriorities.isEmpty {
                Divider()
                Text("Tomorrow")
                    .font(.headline)
                ForEach(card.tomorrowPriorities, id: \.self) { priority in
                    Text(priority)
                }
            }

            Divider()
            Text(card.closingLine)
                .font(.callout.weight(.medium))
        }
        .beevePanel()
    }
}
