import Foundation

enum AppTab: Hashable {
    case today
    case cards
    case settings
}

enum DayEntryKind: String, Codable, CaseIterable, Identifiable {
    case done
    case interrupted
    case tomorrow

    var id: String { rawValue }

    var title: String {
        switch self {
        case .done: "Done"
        case .interrupted: "Interrupted"
        case .tomorrow: "Tomorrow"
        }
    }

    var sectionTitle: String {
        switch self {
        case .done: "Moved forward"
        case .interrupted: "Still counted"
        case .tomorrow: "Tomorrow remembers"
        }
    }

    var systemImage: String {
        switch self {
        case .done: "checkmark.circle"
        case .interrupted: "arrow.triangle.branch"
        case .tomorrow: "arrow.right.circle"
        }
    }

    var prompt: String {
        switch self {
        case .done: "What moved forward?"
        case .interrupted: "What pulled you away?"
        case .tomorrow: "What should future-you remember?"
        }
    }
}

enum FutureSelfTone: String, Codable, CaseIterable, Identifiable {
    case calm
    case concise
    case firm

    var id: String { rawValue }

    var label: String {
        switch self {
        case .calm: "Calm"
        case .concise: "Concise"
        case .firm: "Firm"
        }
    }
}
