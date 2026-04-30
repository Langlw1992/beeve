import Foundation

enum AppTab: Hashable {
    case today
    case cards
    case settings
}

enum DayEntryKind: String, Codable, CaseIterable, Identifiable, Equatable {
    case done
    case interrupted
    case tomorrow

    var id: String { rawValue }

    var title: String {
        switch self {
        case .done: "推进"
        case .interrupted: "打断"
        case .tomorrow: "明天"
        }
    }

    var sectionTitle: String {
        switch self {
        case .done: "今天推进了"
        case .interrupted: "被打断也算数"
        case .tomorrow: "留给明天"
        }
    }

    var systemImage: String {
        switch self {
        case .done: "checkmark.circle"
        case .interrupted: "arrow.triangle.branch"
        case .tomorrow: "arrow.right.circle"
        }
    }

    var prompt: String {
        switch self {
        case .done: "哪件事真的往前走了？"
        case .interrupted: "什么把你拉走了？"
        case .tomorrow: "明天的你需要记住什么？"
        }
    }
}

enum AssistantIntent: String, CaseIterable, Identifiable, Equatable {
    case planToday
    case importText
    case voiceCapture
    case recover
    case handoff

    var id: String { rawValue }

    var title: String {
        switch self {
        case .planToday: "安排今天"
        case .importText: "导入整理"
        case .voiceCapture: "自然语言"
        case .recover: "被打断了"
        case .handoff: "留给明天"
        }
    }

    var subtitle: String {
        switch self {
        case .planToday: "少选一点，先推进"
        case .importText: "粘贴会议、笔记或清单"
        case .voiceCapture: "用一句话补充上下文"
        case .recover: "快速找回下一步"
        case .handoff: "把线索交给明天"
        }
    }

    var systemImage: String {
        switch self {
        case .planToday: "wand.and.sparkles"
        case .importText: "square.and.arrow.down"
        case .voiceCapture: "waveform"
        case .recover: "arrow.triangle.branch"
        case .handoff: "arrow.right.circle"
        }
    }

    var suggestedInput: String {
        switch self {
        case .planToday:
            "今天我想推进："
        case .importText:
            ""
        case .voiceCapture:
            ""
        case .recover:
            "我刚刚被打断，因为："
        case .handoff:
            "明天需要接住："
        }
    }
}

enum FutureSelfTone: String, Codable, CaseIterable, Identifiable, Equatable {
    case calm
    case concise
    case firm

    var id: String { rawValue }

    var label: String {
        switch self {
        case .calm: "温和"
        case .concise: "干脆"
        case .firm: "直接"
        }
    }
}
