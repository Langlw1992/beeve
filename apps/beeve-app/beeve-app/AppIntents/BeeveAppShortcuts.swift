import AppIntents
import Foundation

struct QuickCaptureIntent: AppIntent {
    static let title: LocalizedStringResource = "快速记录"
    static let description = IntentDescription("打开 Beeve 的 Capture 入口，立即记录任务、灵感或想法。")
    static let openAppWhenRun = true

    func perform() async throws -> some IntentResult & ProvidesDialog {
        UserDefaults.standard.set(AppIntentRoute.capture.rawValue, forKey: "beeve.intent.route")
        return .result(dialog: "已打开 Capture。")
    }
}

struct OpenTodayIntent: AppIntent {
    static let title: LocalizedStringResource = "打开 Today"
    static let description = IntentDescription("打开 Beeve 的 Today 页面，查看当前最值得推进的下一步。")
    static let openAppWhenRun = true

    func perform() async throws -> some IntentResult & ProvidesDialog {
        UserDefaults.standard.set(AppIntentRoute.today.rawValue, forKey: "beeve.intent.route")
        return .result(dialog: "已打开 Today。")
    }
}

struct StartFocusIntent: AppIntent {
    static let title: LocalizedStringResource = "开始专注"
    static let description = IntentDescription("打开 Beeve Today，并准备开始专注。")
    static let openAppWhenRun = true

    func perform() async throws -> some IntentResult & ProvidesDialog {
        UserDefaults.standard.set(AppIntentRoute.today.rawValue, forKey: "beeve.intent.route")
        return .result(dialog: "已打开 Today，可以开始专注。")
    }
}

struct BeeveAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        return [
            AppShortcut(
                intent: QuickCaptureIntent(),
                phrases: [
                    "在 \(.applicationName) 里快速记录",
                    "用 \(.applicationName) 记录一下",
                ],
                shortTitle: "快速记录",
                systemImageName: "square.and.pencil"
            ),
            AppShortcut(
                intent: OpenTodayIntent(),
                phrases: [
                    "打开 \(.applicationName) Today",
                    "查看 \(.applicationName) 的下一步",
                ],
                shortTitle: "打开 Today",
                systemImageName: "sparkles"
            ),
            AppShortcut(
                intent: StartFocusIntent(),
                phrases: [
                    "在 \(.applicationName) 开始专注",
                    "用 \(.applicationName) 进入专注",
                ],
                shortTitle: "开始专注",
                systemImageName: "timer"
            ),
        ]
    }
}
