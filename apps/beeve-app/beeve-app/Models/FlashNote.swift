import Foundation
import SwiftData

@Model
final class FlashNote {
    @Attribute(.unique) var id: UUID
    var content: String
    var source: FlashNoteSource
    var transcript: String?
    var category: FlashNoteCategory
    var status: FlashNoteStatus
    var aiConfidence: Double?
    var suggestedAction: FlashNoteSuggestedAction?
    var createdAt: Date
    var processedAt: Date?
    var linkedReminderId: UUID?
    var linkedNoteId: UUID?
    var aiSuggestion: String?

    init(
        content: String,
        source: FlashNoteSource = .text,
        transcript: String? = nil,
        category: FlashNoteCategory = .auto,
        status: FlashNoteStatus = .pending,
        aiConfidence: Double? = nil,
        suggestedAction: FlashNoteSuggestedAction? = nil,
        createdAt: Date = .now,
        processedAt: Date? = nil,
        linkedReminderId: UUID? = nil,
        linkedNoteId: UUID? = nil,
        aiSuggestion: String? = nil
    ) {
        self.id = UUID()
        self.content = content
        self.source = source
        self.transcript = transcript
        self.category = category
        self.status = status
        self.aiConfidence = aiConfidence
        self.suggestedAction = suggestedAction
        self.createdAt = createdAt
        self.processedAt = processedAt
        self.linkedReminderId = linkedReminderId
        self.linkedNoteId = linkedNoteId
        self.aiSuggestion = aiSuggestion
    }
}

enum FlashNoteSource: String, Codable, CaseIterable, Identifiable {
    case text
    case voice

    var id: String { rawValue }
}

enum FlashNoteSuggestedAction: String, Codable, CaseIterable, Identifiable {
    case reminder
    case note
    case idea
    case schedule

    var id: String { rawValue }

    var label: String {
        switch self {
        case .reminder: "转提醒"
        case .note: "转笔记"
        case .idea: "保留想法"
        case .schedule: "安排今天"
        }
    }

    var systemImage: String {
        switch self {
        case .reminder: "checklist"
        case .note: "note.text"
        case .idea: "lightbulb"
        case .schedule: "calendar.badge.clock"
        }
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
        let text = rawText.trimmingCharacters(in: .whitespacesAndNewlines)
        if text.isEmpty { return "空闪念" }
        return String(text.prefix(80))
    }

    var rawText: String {
        let candidate = transcript?.trimmingCharacters(in: .whitespacesAndNewlines)
        if let candidate, !candidate.isEmpty {
            return candidate
        }
        return content
    }
}
