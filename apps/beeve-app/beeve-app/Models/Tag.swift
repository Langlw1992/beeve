import Foundation
import SwiftData

@Model
final class Tag {
    @Attribute(.unique) var id: UUID
    var name: String
    var colorHex: String
    var createdAt: Date

    @Relationship(inverse: \Reminder.tags)
    var reminders: [Reminder]?

    init(name: String, colorHex: String = "6366F1") {
        self.id = UUID()
        self.name = name
        self.colorHex = colorHex
        self.createdAt = .now
    }
}

import SwiftUI

extension Tag {
    var color: Color {
        Color(hex: colorHex)
    }

    static let defaultTags: [(String, String)] = [
        ("工作", "6366F1"),
        ("生活", "06B6D4"),
        ("学习", "F59E0B"),
        ("健康", "10B981"),
        ("灵感", "8B5CF6"),
    ]
}

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex.trimmingCharacters(in: CharacterSet(charactersIn: "#")))
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        self.init(
            red: Double((rgb >> 16) & 0xFF) / 255,
            green: Double((rgb >> 8) & 0xFF) / 255,
            blue: Double(rgb & 0xFF) / 255
        )
    }
}
