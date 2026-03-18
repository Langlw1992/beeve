import Foundation
import SwiftData

@Model
final class UserMemoryItem {
    @Attribute(.unique) var id: UUID
    var title: String
    var value: String
    var category: UserMemoryCategory
    var isEnabled: Bool
    var createdAt: Date
    var updatedAt: Date

    init(
        title: String,
        value: String,
        category: UserMemoryCategory,
        isEnabled: Bool = true
    ) {
        self.id = UUID()
        self.title = title
        self.value = value
        self.category = category
        self.isEnabled = isEnabled
        self.createdAt = .now
        self.updatedAt = .now
    }
}

enum UserMemoryCategory: String, Codable, CaseIterable, Identifiable {
    case identity
    case schedule
    case focus
    case preference

    var id: String { rawValue }

    var label: String {
        switch self {
        case .identity: "身份"
        case .schedule: "节奏"
        case .focus: "专注"
        case .preference: "偏好"
        }
    }
}

extension UserMemoryItem {
    var summaryLine: String {
        "\(title)：\(value)"
    }
}
