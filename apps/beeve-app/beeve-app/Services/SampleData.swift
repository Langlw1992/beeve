import Foundation
import SwiftData

enum SampleData {
    static let preferences = UserPreferences(preferredName: "Lang", hasCompletedOnboarding: true)
    static let focus = DailyFocus(title: "把 Beeve 的第一个 iOS 闭环跑通")
    static let entries = [
        DayEntry(kind: .done, text: "敲定了产品方向和今天的主路径"),
        DayEntry(kind: .interrupted, text: "临时处理了一次构建问题"),
        DayEntry(kind: .tomorrow, text: "继续打磨第一张可分享的成就卡"),
    ]

    @MainActor
    static func previewContainer(
        hasCompletedOnboarding: Bool = true,
        includeHistory: Bool = true
    ) -> ModelContainer {
        let schema = Schema([
            UserPreferences.self,
            DailyFocus.self,
            DayEntry.self,
            AchievementCard.self,
        ])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        let container = try! ModelContainer(for: schema, configurations: [configuration])
        seedPreviewData(
            in: container.mainContext,
            hasCompletedOnboarding: hasCompletedOnboarding,
            includeHistory: includeHistory
        )
        return container
    }

    @MainActor
    static func previewPreferences(from container: ModelContainer) -> UserPreferences {
        let descriptor = FetchDescriptor<UserPreferences>()
        if let preferences = try? container.mainContext.fetch(descriptor).first {
            return preferences
        }

        let preferences = UserPreferences(preferredName: "Lang")
        container.mainContext.insert(preferences)
        return preferences
    }

    @MainActor
    static func previewFocus(from container: ModelContainer) -> DailyFocus {
        let descriptor = FetchDescriptor<DailyFocus>()
        if let focus = try? container.mainContext.fetch(descriptor).first {
            return focus
        }

        let focus = DailyFocus(title: "打磨 Beeve 的 iOS 预览体验")
        container.mainContext.insert(focus)
        return focus
    }

    @MainActor
    private static func seedPreviewData(
        in context: ModelContext,
        hasCompletedOnboarding: Bool,
        includeHistory: Bool
    ) {
        let today = Calendar.current.startOfDay(for: .now)
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: today) ?? today

        context.insert(UserPreferences(
            preferredName: "Lang",
            tone: .calm,
            hasCompletedOnboarding: hasCompletedOnboarding,
            notificationsEnabled: true
        ))

        guard includeHistory else {
            try? context.save()
            return
        }

        context.insert(DailyFocus(date: today, title: "把今天页做得更有呼吸感"))
        context.insert(DayEntry(date: today, kind: .done, text: "重做了今天页的信息层级"))
        context.insert(DayEntry(date: today, kind: .interrupted, text: "临时切去修复 Xcode 预览入口"))
        context.insert(DayEntry(date: today, kind: .tomorrow, text: "在小屏手机上检查首次使用文案"))
        context.insert(AchievementCard(
            date: yesterday,
            title: "一个更容易交接给明天的日子",
            summaryBullets: [
                "重做了首次使用节奏",
                "让今天页聚焦到一个推进",
                "在模拟器里验证了主流程",
            ],
            interruptionReframe: "打断也算进今天：Xcode 设置和预览数据都被处理掉了。",
            tomorrowPriorities: [
                "收紧回看分享体验",
                "补齐空状态的情绪表达",
            ],
            closingLine: "下一条线已经被命名，明天会轻一点。"
        ))

        try? context.save()
    }
}
