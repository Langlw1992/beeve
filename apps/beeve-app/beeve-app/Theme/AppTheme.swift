import SwiftUI
import UIKit

// MARK: - Design Tokens

enum AppSpacing {
    static let pageTop: CGFloat = 12
    static let pageBottom: CGFloat = 42
    static let section: CGFloat = 16
    static let cardContent: CGFloat = 12
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
    appearance.configureWithTransparentBackground()
    appearance.backgroundEffect = UIBlurEffect(style: .systemUltraThinMaterialDark)
    appearance.backgroundColor = UIColor.systemBackground.withAlphaComponent(0.50)
    appearance.shadowColor = UIColor.white.withAlphaComponent(0.08)

    let itemAppearance = UITabBarItemAppearance(style: .stacked)
    itemAppearance.normal.iconColor = UIColor.secondaryLabel
    itemAppearance.normal.titleTextAttributes = [.foregroundColor: UIColor.secondaryLabel]
    itemAppearance.selected.iconColor = UIColor.systemCyan
    itemAppearance.selected.titleTextAttributes = [.foregroundColor: UIColor.systemCyan]

    appearance.stackedLayoutAppearance = itemAppearance
    appearance.inlineLayoutAppearance = itemAppearance
    appearance.compactInlineLayoutAppearance = itemAppearance

    UITabBar.appearance().standardAppearance = appearance
    UITabBar.appearance().scrollEdgeAppearance = appearance
}
