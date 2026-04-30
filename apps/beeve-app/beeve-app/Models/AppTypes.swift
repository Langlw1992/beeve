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
