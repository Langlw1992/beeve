import SwiftUI

enum BeeveDesign {
    static let background = Color(.systemGroupedBackground)
    static let surface = Color(.secondarySystemGroupedBackground)
    static let elevatedSurface = Color(.systemBackground)
    static let border = Color(.separator).opacity(0.22)
    static let accent = Color(.systemTeal)
    static let accentSoft = Color(.systemTeal).opacity(0.14)
    static let mutedText = Color.secondary
    static let radius: CGFloat = 18
    static let innerRadius: CGFloat = 12
    static let controlHeight: CGFloat = 50
    static let contentPadding: CGFloat = 20
}

struct BeevePanel: ViewModifier {
    var padding: CGFloat = 16
    var radius: CGFloat = BeeveDesign.radius

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(BeeveDesign.surface)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
            }
            .shadow(color: Color(.label).opacity(0.035), radius: 18, x: 0, y: 8)
    }
}

extension View {
    func beevePanel(padding: CGFloat = 16, radius: CGFloat = BeeveDesign.radius) -> some View {
        modifier(BeevePanel(padding: padding, radius: radius))
    }
}

struct BeevePrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: BeeveDesign.controlHeight)
            .background(BeeveDesign.accent)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
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
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(tint)
            .frame(width: 34, height: 34)
            .background(tint.opacity(0.14))
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
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
