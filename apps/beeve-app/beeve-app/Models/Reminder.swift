import Foundation
import SwiftData

@Model
final class Reminder {
    @Attribute(.unique) var id: UUID
    var title: String
    var note: String
    var dueDate: Date?
    var category: ReminderCategory
    var priority: ReminderPriority
    var origin: ReminderOrigin
    var isCompleted: Bool
    var completedAt: Date?
    var sortOrder: Int
    var createdAt: Date
    var lastSuggestedAt: Date?

    // Subtask support
    @Relationship(deleteRule: .cascade, inverse: \Reminder.parent)
    var children: [Reminder]?
    var parent: Reminder?

    // Tags (many-to-many)
    var tags: [Tag]?

    // Repeat rule
    var repeatRule: RepeatRule?

    init(
        title: String,
        note: String = "",
        dueDate: Date? = nil,
        category: ReminderCategory = .work,
        priority: ReminderPriority = .medium,
        origin: ReminderOrigin = .manual,
        isCompleted: Bool = false,
        completedAt: Date? = nil,
        sortOrder: Int = 0,
        repeatRule: RepeatRule? = nil,
        lastSuggestedAt: Date? = nil
    ) {
        self.id = UUID()
        self.title = title
        self.note = note
        self.dueDate = dueDate
        self.category = category
        self.priority = priority
        self.origin = origin
        self.isCompleted = isCompleted
        self.completedAt = completedAt
        self.sortOrder = sortOrder
        self.createdAt = .now
        self.repeatRule = repeatRule
        self.lastSuggestedAt = lastSuggestedAt
    }
}

// MARK: - Enums

enum ReminderOrigin: String, CaseIterable, Codable, Identifiable {
    case manual
    case assistant
    case capture
    case recurring

    var id: String { rawValue }
}

enum ReminderPriority: String, CaseIterable, Codable, Identifiable {
    case high
    case medium
    case low

    var id: String { rawValue }

    var label: String {
        switch self {
        case .high: "高优先级"
        case .medium: "中优先级"
        case .low: "低优先级"
        }
    }

    var rank: Int {
        switch self {
        case .high: 0
        case .medium: 1
        case .low: 2
        }
    }
}

enum ReminderCategory: String, CaseIterable, Codable, Identifiable {
    case work
    case personal
    case health
    case idea

    var id: String { rawValue }

    var label: String {
        switch self {
        case .work: "工作"
        case .personal: "生活"
        case .health: "健康"
        case .idea: "灵感"
        }
    }
}

// MARK: - Convenience

extension Reminder {
    var isOverdue: Bool {
        guard !isCompleted, let dueDate else { return false }
        return dueDate < .now && !Calendar.current.isDateInToday(dueDate)
    }

    var isToday: Bool {
        guard !isCompleted, let dueDate else { return false }
        return Calendar.current.isDateInToday(dueDate)
    }

    var isUpcoming: Bool {
        guard !isCompleted, let dueDate else { return false }
        return !Calendar.current.isDateInToday(dueDate) && dueDate >= .now
    }

    var isInbox: Bool {
        !isCompleted && dueDate == nil && parent == nil
    }

    var isTopLevel: Bool {
        parent == nil
    }

    var subtasks: [Reminder] {
        (children ?? []).sorted { $0.sortOrder < $1.sortOrder }
    }

    var subtaskProgress: Double {
        let subs = subtasks
        guard !subs.isEmpty else { return isCompleted ? 1.0 : 0.0 }
        let done = subs.filter(\.isCompleted).count
        return Double(done) / Double(subs.count)
    }

    var subtaskSummary: String? {
        let subs = subtasks
        guard !subs.isEmpty else { return nil }
        let done = subs.filter(\.isCompleted).count
        return "\(done)/\(subs.count)"
    }

    var isRepeating: Bool {
        repeatRule != nil
    }

    var tagNames: [String] {
        (tags ?? []).map(\.name)
    }

    var completionDate: Date? {
        completedAt
    }
}
