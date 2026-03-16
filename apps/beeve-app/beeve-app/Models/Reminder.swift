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
    var isCompleted: Bool
    var sortOrder: Int
    var createdAt: Date

    // Subtask support (Phase 2)
    @Relationship(deleteRule: .cascade, inverse: \Reminder.parent)
    var children: [Reminder]?
    var parent: Reminder?

    init(
        title: String,
        note: String = "",
        dueDate: Date? = nil,
        category: ReminderCategory = .work,
        priority: ReminderPriority = .medium,
        isCompleted: Bool = false,
        sortOrder: Int = 0
    ) {
        self.id = UUID()
        self.title = title
        self.note = note
        self.dueDate = dueDate
        self.category = category
        self.priority = priority
        self.isCompleted = isCompleted
        self.sortOrder = sortOrder
        self.createdAt = .now
    }
}

// MARK: - Enums

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
        !isCompleted && dueDate == nil
    }
}
