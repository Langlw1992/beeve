import Foundation
import SwiftData

@Model
final class Note {
    @Attribute(.unique) var id: UUID
    var title: String
    var content: String
    var isFavorite: Bool
    var isArchived: Bool
    var createdAt: Date
    var updatedAt: Date
    var linkedReminderId: UUID?

    init(
        title: String = "",
        content: String = "",
        isFavorite: Bool = false,
        linkedReminderId: UUID? = nil
    ) {
        self.id = UUID()
        self.title = title
        self.content = content
        self.isFavorite = isFavorite
        self.isArchived = false
        self.createdAt = .now
        self.updatedAt = .now
        self.linkedReminderId = linkedReminderId
    }
}

extension Note {
    var preview: String {
        let text = content.trimmingCharacters(in: .whitespacesAndNewlines)
        if text.isEmpty { return "空笔记" }
        return String(text.prefix(80))
    }

    var displayTitle: String {
        let t = title.trimmingCharacters(in: .whitespacesAndNewlines)
        return t.isEmpty ? "无标题" : t
    }

    var isToday: Bool {
        Calendar.current.isDateInToday(updatedAt)
    }
}
