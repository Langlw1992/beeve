import Foundation
import SwiftData

@Model
final class DayEntry {
    var date: Date
    var kindRawValue: String
    var text: String
    var createdAt: Date

    init(date: Date = .now, kind: DayEntryKind, text: String, createdAt: Date = .now) {
        self.date = Calendar.current.startOfDay(for: date)
        self.kindRawValue = kind.rawValue
        self.text = text
        self.createdAt = createdAt
    }

    var kind: DayEntryKind {
        DayEntryKind(rawValue: kindRawValue) ?? .done
    }
}
