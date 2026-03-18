import Foundation

enum AppTab: Hashable {
    case today
    case capture
    case me
}

enum AppIntentRoute: String {
    case today
    case capture
}

enum SecondaryDestination: String, Hashable, Identifiable, Codable {
    case reminders
    case planner
    case focus
    case notes
    case habits

    var id: String { rawValue }

    var label: String {
        switch self {
        case .reminders: "任务"
        case .planner: "规划"
        case .focus: "专注"
        case .notes: "笔记"
        case .habits: "习惯"
        }
    }

    var systemImage: String {
        switch self {
        case .reminders: "checklist"
        case .planner: "calendar"
        case .focus: "timer"
        case .notes: "note.text"
        case .habits: "flame"
        }
    }
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

enum AssistantActionKind: String, Codable, Hashable {
    case reminders
    case planner
    case focus
    case notes
    case habits
    case capture
}

struct AssistantActionSuggestion: Identifiable, Codable, Hashable, Equatable {
    let id: UUID
    let title: String
    let systemImage: String
    let kind: AssistantActionKind
    let prompt: String?

    init(
        id: UUID = UUID(),
        title: String,
        systemImage: String,
        kind: AssistantActionKind,
        prompt: String? = nil
    ) {
        self.id = id
        self.title = title
        self.systemImage = systemImage
        self.kind = kind
        self.prompt = prompt
    }

    var destination: SecondaryDestination? {
        switch kind {
        case .reminders:
            return .reminders
        case .planner:
            return .planner
        case .focus:
            return .focus
        case .notes:
            return .notes
        case .habits:
            return .habits
        case .capture:
            return nil
        }
    }
}

struct TodayPrimaryAction: Equatable {
    let title: String
    let detail: String
    let buttonTitle: String
    let buttonSystemImage: String
    let destination: SecondaryDestination?
    let preferredTab: AppTab?
}
