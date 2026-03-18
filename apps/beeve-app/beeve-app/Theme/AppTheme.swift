import SwiftUI
import UIKit

// MARK: - Design Tokens

enum AppSpacing {
    static let pageTop: CGFloat = 20
    static let pageBottom: CGFloat = 42
    static let section: CGFloat = 24
    static let cardContent: CGFloat = 16
    static let cardCornerRadius: CGFloat = 16
}

enum AppTheme {
    static let brand = Color(red: 0.20, green: 0.36, blue: 0.94)
    static let brandSoft = Color(red: 0.43, green: 0.58, blue: 1.0)
    static let capture = Color(red: 0.15, green: 0.66, blue: 0.70)
    static let success = Color(red: 0.13, green: 0.60, blue: 0.35)
    static let warning = Color(red: 0.95, green: 0.58, blue: 0.14)
    static let surface = Color(uiColor: .secondarySystemGroupedBackground)
    static let elevatedSurface = Color(uiColor: .systemBackground)
    static let chromeMaterial: Material = .ultraThinMaterial
}

// MARK: - Priority Color

extension ReminderPriority {
    var color: Color {
        switch self {
        case .high: .red
        case .medium: .orange
        case .low: .green
        }
    }
}

// MARK: - Tab Bar Appearance

func configureTabBarAppearance() {
    let appearance = UITabBarAppearance()
    appearance.configureWithDefaultBackground()

    UITabBar.appearance().standardAppearance = appearance
    UITabBar.appearance().scrollEdgeAppearance = appearance
}
