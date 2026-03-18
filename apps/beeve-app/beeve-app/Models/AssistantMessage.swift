import Foundation

enum MessageRole: String, Codable {
    case assistant
    case user
}

struct AssistantMessage: Identifiable, Codable, Equatable {
    let id: UUID
    let role: MessageRole
    let content: String
    let createdAt: Date
    let suggestedActions: [AssistantActionSuggestion]?

    init(
        role: MessageRole,
        content: String,
        suggestedActions: [AssistantActionSuggestion]? = nil
    ) {
        self.id = UUID()
        self.role = role
        self.content = content
        self.createdAt = .now
        self.suggestedActions = suggestedActions
    }
}
