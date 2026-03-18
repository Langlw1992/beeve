import Foundation
import SwiftData

@Model
final class FlashNote {
    @Attribute(.unique) var id: UUID
    var content: String
    var category: FlashNoteCategory
    var status: FlashNoteStatus
    var createdAt: Date
    var processedAt: Date?
    var linkedReminderId: UUID?
    var linkedNoteId: UUID?
    var aiSuggestion: String?

    init(
        content: String,
        category: FlashNoteCategory = .auto,
        status: FlashNoteStatus = .pending,
        createdAt: Date = .now,
        processedAt: Date? = nil,
        linkedReminderId: UUID? = nil,
        linkedNoteId: UUID? = nil,
        aiSuggestion: String? = nil
    ) {
        self.id = UUID()
        self.content = content
        self.category = category
        self.status = status
        self.createdAt = createdAt
        self.processedAt = processedAt
        self.linkedReminderId = linkedReminderId
        self.linkedNoteId = linkedNoteId
        self.aiSuggestion = aiSuggestion
    }
}

enum FlashNoteCategory: String, Codable, CaseIterable, Identifiable {
    case auto
    case reminder
    case note
    case idea
    case schedule

    var id: String { rawValue }

    var label: String {
        switch self {
        case .auto: "自动识别"
        case .reminder: "提醒"
        case .note: "笔记"
        case .idea: "想法"
        case .schedule: "日程"
        }
    }
}

enum FlashNoteStatus: String, Codable, CaseIterable, Identifiable {
    case pending
    case processed
    case archived

    var id: String { rawValue }

    var label: String {
        switch self {
        case .pending: "待处理"
        case .processed: "已处理"
        case .archived: "已归档"
        }
    }
}

extension FlashNote {
    var preview: String {
        let text = content.trimmingCharacters(in: .whitespacesAndNewlines)
        if text.isEmpty { return "空闪念" }
        return String(text.prefix(80))
    }
}

