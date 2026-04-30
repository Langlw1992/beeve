import SwiftUI
import UIKit

enum BeeveDesign {
    static let background = Color(.systemGroupedBackground)
    static let surface = Color(.secondarySystemGroupedBackground)
    static let elevatedSurface = Color(.systemBackground)
    static let border = Color(.separator).opacity(0.18)
    static let accent = Color(.systemTeal)
    static let accentDeep = Color(.systemIndigo)
    static let accentSoft = Color(.systemTeal).opacity(0.12)
    static let warmAccent = Color(.systemOrange)
    static let mutedText = Color.secondary
    static let radius: CGFloat = 22
    static let innerRadius: CGFloat = 12
    static let controlHeight: CGFloat = 50
    static let contentPadding: CGFloat = 20

    static var accentGradient: LinearGradient {
        LinearGradient(
            colors: [Color(.systemTeal), Color(.systemMint), Color(.systemCyan)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var warmGradient: LinearGradient {
        LinearGradient(
            colors: [Color(.systemOrange), Color(.systemPink)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var subtleBackgroundGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color(.systemGroupedBackground),
                Color(.secondarySystemGroupedBackground),
                Color(.systemGroupedBackground),
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}

struct BeevePanel: ViewModifier {
    var padding: CGFloat = 16
    var radius: CGFloat = BeeveDesign.radius
    var tint: Color?

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .fill(BeeveDesign.surface)
                    .overlay(alignment: .topLeading) {
                        if let tint {
                            LinearGradient(
                                colors: [tint.opacity(0.16), tint.opacity(0)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
                        }
                    }
            }
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
            }
            .shadow(color: Color(.label).opacity(0.045), radius: 20, x: 0, y: 10)
    }
}

extension View {
    func beevePanel(
        padding: CGFloat = 16,
        radius: CGFloat = BeeveDesign.radius,
        tint: Color? = nil
    ) -> some View {
        modifier(BeevePanel(padding: padding, radius: radius, tint: tint))
    }

    func beeveInputSurface() -> some View {
        padding(.horizontal, 16)
            .frame(minHeight: BeeveDesign.controlHeight)
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
            }
    }

    func beeveReveal(_ isActive: Bool, delay: Double = 0) -> some View {
        opacity(isActive ? 1 : 0)
            .offset(y: isActive ? 0 : 14)
            .animation(.smooth(duration: 0.48).delay(delay), value: isActive)
    }
}

struct BeevePrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: BeeveDesign.controlHeight)
            .background(BeeveDesign.accentGradient)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .shadow(
                color: BeeveDesign.accent.opacity(configuration.isPressed ? 0.08 : 0.22),
                radius: configuration.isPressed ? 4 : 14,
                x: 0,
                y: configuration.isPressed ? 2 : 8
            )
            .animation(.smooth(duration: 0.18), value: configuration.isPressed)
    }
}

struct BeeveSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(BeeveDesign.accent)
            .frame(maxWidth: .infinity, minHeight: BeeveDesign.controlHeight)
            .background(BeeveDesign.accentSoft)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.smooth(duration: 0.18), value: configuration.isPressed)
    }
}

struct BeeveIconButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .frame(minWidth: 44, minHeight: 44)
            .background(BeeveDesign.elevatedSurface)
            .clipShape(Circle())
            .overlay {
                Circle().stroke(BeeveDesign.border, lineWidth: 1)
            }
            .scaleEffect(configuration.isPressed ? 0.94 : 1)
            .animation(.snappy(duration: 0.18), value: configuration.isPressed)
    }
}

struct BeeveSectionHeader: View {
    let title: String
    var subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title.uppercased())
                .font(.caption2.weight(.semibold))
                .tracking(1.2)
                .foregroundStyle(.secondary)

            if let subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

struct BeeveIconBubble: View {
    let systemImage: String
    var tint: Color = BeeveDesign.accent

    var body: some View {
        Image(systemName: systemImage)
            .font(.subheadline.weight(.bold))
            .foregroundStyle(tint)
            .symbolRenderingMode(.hierarchical)
            .frame(width: 36, height: 36)
            .background(tint.opacity(0.13))
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .accessibilityHidden(true)
    }
}

struct BeeveCountBadge: View {
    let value: Int

    var body: some View {
        Text(value, format: .number)
            .font(.footnote.weight(.semibold))
            .monospacedDigit()
            .foregroundStyle(.secondary)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Color(.tertiarySystemGroupedBackground))
            .clipShape(Capsule())
    }
}

enum BeeveHaptics {
    static func lightImpact() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    static func selection() {
        UISelectionFeedbackGenerator().selectionChanged()
    }

    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }
}
