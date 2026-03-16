import Foundation

enum AppTab: Hashable {
    case home
    case reminders
    case tools
    case profile
}

enum ReminderFilter: String, CaseIterable, Identifiable {
    case all
    case inbox
    case today
    case upcoming
    case completed

    var id: String { rawValue }

    var label: String {
        switch self {
        case .all: "全部"
        case .inbox: "收件箱"
        case .today: "今天"
        case .upcoming: "即将"
        case .completed: "已完成"
        }
    }
}

enum FollowUpDestination: String, Equatable {
    case reminders
    case tools
    case assistant
}

struct CompletionSuggestion: Equatable {
    let title: String
    let detail: String
    let primaryLabel: String
    let primaryDestination: FollowUpDestination
    let secondaryLabel: String?
    let secondaryDestination: FollowUpDestination?
}
