import Foundation
import SwiftUI

struct AchievementCardView: View {
    let card: AchievementCard

    private static let zhDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_Hans_CN")
        formatter.dateFormat = "M月d日 EEEE"
        return formatter
    }()

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .center, spacing: 12) {
                BeeveIconBubble(systemImage: "sparkles", tint: BeeveDesign.warmAccent)
                VStack(alignment: .leading, spacing: 2) {
                    Text(Self.zhDateFormatter.string(from: card.date))
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(.secondary)
                    Text("今日收束")
                        .font(.headline)
                }
                Spacer()
                Image(systemName: "seal.fill")
                    .font(.title3)
                    .foregroundStyle(BeeveDesign.warmAccent)
                    .accessibilityHidden(true)
            }

            Text(card.title)
                .font(.title2.weight(.bold))
                .fixedSize(horizontal: false, vertical: true)

            VStack(alignment: .leading, spacing: 12) {
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
            .padding(16)
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))

            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "arrow.triangle.2.circlepath")
                    .foregroundStyle(BeeveDesign.warmAccent)
                    .padding(.top, 2)
                Text(card.interruptionReframe)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if !card.tomorrowPriorities.isEmpty {
                Divider()
                VStack(alignment: .leading, spacing: 12) {
                    Text("明天先做")
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

            Text(card.closingLine)
                .font(.callout.weight(.semibold))
                .foregroundStyle(.white)
                .fixedSize(horizontal: false, vertical: true)
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(BeeveDesign.warmGradient)
                .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
        }
        .beevePanel(padding: 20, tint: BeeveDesign.warmAccent)
        .accessibilityElement(children: .contain)
    }
}

#Preview {
    AchievementCardView(card: AchievementCard(
        title: "一个更容易交接给明天的日子",
        summaryBullets: [
            "重做了首次使用节奏",
            "让今天页聚焦到一个推进",
            "在模拟器里验证了主流程",
        ],
        interruptionReframe: "打断也算进今天：Xcode 设置和预览数据都被处理掉了。",
        tomorrowPriorities: [
            "收紧卡片分享体验",
            "在 iPhone SE 上检查首次使用文案",
        ],
        closingLine: "下一条线已经被命名，明天会轻一点。"
    ))
    .padding(20)
    .background(BeeveDesign.background)
}
