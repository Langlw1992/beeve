import SwiftUI
import UIKit

// MARK: - Design Tokens

enum DSColor {
    static let brand = Color(red: 0.20, green: 0.36, blue: 0.94)
    static let brandSoft = Color(red: 0.43, green: 0.58, blue: 1.0)
    static let ping = Color(red: 0.15, green: 0.66, blue: 0.70)
    static let focus = Color(red: 0.36, green: 0.52, blue: 1.0)

    static let success = Color(red: 0.13, green: 0.60, blue: 0.35)
    static let warning = Color(red: 0.95, green: 0.58, blue: 0.14)
    static let danger = Color(red: 0.86, green: 0.25, blue: 0.29)
    static let info = Color(red: 0.19, green: 0.56, blue: 0.96)

    static let bg = Color(uiColor: .systemGroupedBackground)
    static let surface1 = Color(uiColor: .secondarySystemGroupedBackground)
    static let surface2 = Color(uiColor: .systemBackground)
    static let stroke = Color(uiColor: .separator)
    static let textPrimary = Color(uiColor: .label)
    static let textSecondary = Color(uiColor: .secondaryLabel)
    static let textTertiary = Color(uiColor: .tertiaryLabel)
}

enum DSRadius {
    static let micro: CGFloat = 8
    static let control: CGFloat = 12
    static let card: CGFloat = 16
    static let hero: CGFloat = 24
    static let full: CGFloat = 999
}

enum DSSpace {
    static let xxs: CGFloat = 4
    static let xs: CGFloat = 8
    static let sm: CGFloat = 12
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
}

enum DSType {
    static let hero = Font.system(size: 34, weight: .bold, design: .rounded)
    static let pageTitle = Font.system(size: 28, weight: .bold, design: .rounded)
    static let section = Font.system(size: 18, weight: .semibold, design: .rounded)
    static let body = Font.body
    static let meta = Font.footnote
    static let numericLarge = Font.system(size: 32, weight: .bold, design: .rounded)
}

struct DSShadowStyle {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
    let compensationColor: Color
    let compensationLineWidth: CGFloat
}

enum DSShadow {
    static func card(for colorScheme: ColorScheme) -> DSShadowStyle {
        switch colorScheme {
        case .dark:
            DSShadowStyle(
                color: .black.opacity(0.14),
                radius: 10,
                x: 0,
                y: 6,
                compensationColor: DSColor.stroke.opacity(0.28),
                compensationLineWidth: 0.8
            )
        default:
            DSShadowStyle(
                color: .black.opacity(0.06),
                radius: 18,
                x: 0,
                y: 10,
                compensationColor: .clear,
                compensationLineWidth: 0
            )
        }
    }

    static func floating(for colorScheme: ColorScheme) -> DSShadowStyle {
        switch colorScheme {
        case .dark:
            DSShadowStyle(
                color: .black.opacity(0.24),
                radius: 18,
                x: 0,
                y: 10,
                compensationColor: .clear,
                compensationLineWidth: 0
            )
        default:
            DSShadowStyle(
                color: .black.opacity(0.12),
                radius: 22,
                x: 0,
                y: 12,
                compensationColor: .clear,
                compensationLineWidth: 0
            )
        }
    }
}

struct DSPrimaryButtonStyle: ButtonStyle {
    var tint: Color = DSColor.brand
    @Environment(\.colorScheme) private var colorScheme

    func makeBody(configuration: Configuration) -> some View {
        let shadow = DSShadow.floating(for: colorScheme)

        return configuration.label
            .font(DSType.body.weight(.semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, DSSpace.md)
            .frame(minHeight: 44)
            .background(
                RoundedRectangle(cornerRadius: DSRadius.control, style: .continuous)
                    .fill(tint)
            )
            .shadow(color: shadow.color, radius: shadow.radius, x: shadow.x, y: shadow.y)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .brightness(configuration.isPressed ? -0.04 : 0)
            .animation(.spring(response: 0.22, dampingFraction: 0.78), value: configuration.isPressed)
    }
}

struct DSSecondaryButtonStyle: ButtonStyle {
    var tint: Color = DSColor.brand

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(DSType.body.weight(.semibold))
            .foregroundStyle(tint)
            .padding(.horizontal, DSSpace.md)
            .frame(minHeight: 44)
            .background(
                RoundedRectangle(cornerRadius: DSRadius.control, style: .continuous)
                    .fill(DSColor.surface2)
            )
            .overlay(
                RoundedRectangle(cornerRadius: DSRadius.control, style: .continuous)
                    .strokeBorder(tint.opacity(0.16), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .brightness(configuration.isPressed ? -0.02 : 0)
            .animation(.spring(response: 0.22, dampingFraction: 0.78), value: configuration.isPressed)
    }
}

struct DSTextButtonStyle: ButtonStyle {
    var tint: Color = DSColor.brand

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(DSType.body.weight(.semibold))
            .foregroundStyle(tint)
            .padding(.horizontal, DSSpace.xs)
            .frame(minHeight: 44)
            .opacity(configuration.isPressed ? 0.72 : 1)
            .animation(.easeOut(duration: 0.16), value: configuration.isPressed)
    }
}

struct DSCapsuleButtonStyle: ButtonStyle {
    var tint: Color = DSColor.brand
    @Environment(\.colorScheme) private var colorScheme

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(DSType.body.weight(.semibold))
            .padding(.horizontal, DSSpace.sm)
            .frame(minHeight: 40)
            .background(
                Capsule()
                    .fill(tint.opacity(colorScheme == .dark ? 0.18 : 0.12))
            )
            .overlay(
                Capsule()
                    .strokeBorder(tint.opacity(colorScheme == .dark ? 0.18 : 0.12), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .brightness(configuration.isPressed ? -0.02 : 0)
            .animation(.spring(response: 0.22, dampingFraction: 0.78), value: configuration.isPressed)
    }
}

@available(*, deprecated, message: "Use DSSpace tokens instead.")
enum AppSpacing {
    static let pageTop: CGFloat = 20
    static let pageBottom: CGFloat = 42
    static let section: CGFloat = DSSpace.lg
    static let cardContent: CGFloat = DSSpace.md
    static let cardCornerRadius: CGFloat = DSRadius.card
}

@available(*, deprecated, message: "Use DSColor / DSShadow tokens instead.")
enum AppTheme {
    static let brand = DSColor.brand
    static let brandSoft = DSColor.brandSoft
    static let ping = DSColor.ping
    static let success = DSColor.success
    static let warning = DSColor.warning
    static let surface = DSColor.surface1
    static let elevatedSurface = DSColor.surface2
    static let chromeMaterial: Material = .ultraThinMaterial
}

// MARK: - Priority Color

extension ReminderPriority {
    var color: Color {
        switch self {
        case .high: DSColor.danger
        case .medium: DSColor.warning
        case .low: DSColor.success
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
