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
