import SwiftUI
import UIKit

enum BeeveDesign {
    static let background = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.058, green: 0.064, blue: 0.078, alpha: 1)
            : UIColor(red: 0.965, green: 0.972, blue: 0.984, alpha: 1)
    })

    static let surface = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.094, green: 0.102, blue: 0.122, alpha: 1)
            : UIColor(red: 0.992, green: 0.996, blue: 1.000, alpha: 1)
    })

    static let elevatedSurface = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.128, green: 0.139, blue: 0.166, alpha: 1)
            : UIColor.white.withAlphaComponent(0.88)
    })

    static let panelStart = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.118, green: 0.128, blue: 0.154, alpha: 1)
            : UIColor(red: 0.996, green: 0.998, blue: 1.000, alpha: 1)
    })

    static let panelEnd = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.082, green: 0.090, blue: 0.108, alpha: 1)
            : UIColor(red: 0.936, green: 0.956, blue: 0.988, alpha: 1)
    })

    static let border = Color(.separator).opacity(0.12)
    static let darkBorder = Color(.label).opacity(0.06)
    static let primaryText = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.930, green: 0.942, blue: 0.966, alpha: 1)
            : UIColor(red: 0.100, green: 0.116, blue: 0.150, alpha: 1)
    })
    static let accent = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.360, green: 0.610, blue: 1.000, alpha: 1)
            : UIColor(red: 0.050, green: 0.360, blue: 0.860, alpha: 1)
    })
    static let accentDeep = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.700, green: 0.830, blue: 1.000, alpha: 1)
            : UIColor(red: 0.020, green: 0.230, blue: 0.580, alpha: 1)
    })
    static let accentPressed = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.160, green: 0.390, blue: 0.780, alpha: 1)
            : UIColor(red: 0.020, green: 0.270, blue: 0.680, alpha: 1)
    })
    static let warmAccent = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 1.000, green: 0.650, blue: 0.310, alpha: 1)
            : UIColor(red: 0.810, green: 0.420, blue: 0.100, alpha: 1)
    })
    static let tomorrowAccent = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.720, green: 0.680, blue: 1.000, alpha: 1)
            : UIColor(red: 0.350, green: 0.350, blue: 0.760, alpha: 1)
    })
    static let mutedText = Color.secondary
    static let radius: CGFloat = 22
    static let innerRadius: CGFloat = 16
    static let controlHeight: CGFloat = 52
    static let contentPadding: CGFloat = 20

    static var accentGradient: LinearGradient {
        LinearGradient(
            colors: [accent.opacity(0.95), tomorrowAccent.opacity(0.76)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static func panelGradient(tint: Color? = nil) -> LinearGradient {
        let tint = tint ?? accent
        return LinearGradient(
            colors: [
                panelStart,
                tint.opacity(0.055),
                panelEnd,
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

struct BeevePanel: ViewModifier {
    var padding: CGFloat = 18
    var radius: CGFloat = BeeveDesign.radius
    var tint: Color?

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .fill(BeeveDesign.panelGradient(tint: tint))
            }
            .overlay {
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .strokeBorder(BeeveDesign.border, lineWidth: 1)
                    .allowsHitTesting(false)
            }
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
    }
}

struct BeeveSceneBackground: View {
    var body: some View {
        ZStack {
            BeeveDesign.background
            RadialGradient(
                colors: [
                    BeeveDesign.accent.opacity(0.13),
                    .clear,
                ],
                center: .topTrailing,
                startRadius: 20,
                endRadius: 320
            )
            RadialGradient(
                colors: [
                    BeeveDesign.warmAccent.opacity(0.10),
                    .clear,
                ],
                center: .topLeading,
                startRadius: 40,
                endRadius: 300
            )
        }
        .ignoresSafeArea()
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
                    .allowsHitTesting(false)
            }
    }

    func beeveReveal(_ isActive: Bool, delay: Double = 0) -> some View {
        opacity(isActive ? 1 : 0)
            .offset(y: isActive ? 0 : 6)
            .animation(.easeOut(duration: 0.22).delay(delay), value: isActive)
    }
}

struct BeevePrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: BeeveDesign.controlHeight)
            .background(configuration.isPressed ? BeeveDesign.accentPressed : BeeveDesign.accent)
            .clipShape(RoundedRectangle(cornerRadius: 17, style: .continuous))
            .opacity(configuration.isPressed ? 0.92 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

struct BeeveSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(BeeveDesign.accentDeep)
            .frame(maxWidth: .infinity, minHeight: BeeveDesign.controlHeight)
            .background(BeeveDesign.elevatedSurface.opacity(configuration.isPressed ? 0.68 : 1))
            .clipShape(RoundedRectangle(cornerRadius: 17, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 17, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
                    .allowsHitTesting(false)
            }
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

struct BeeveIconButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(BeeveDesign.accentDeep)
            .frame(minWidth: 44, minHeight: 44)
            .background(BeeveDesign.elevatedSurface.opacity(configuration.isPressed ? 0.68 : 1))
            .clipShape(Circle())
            .overlay {
                Circle()
                    .stroke(BeeveDesign.border, lineWidth: 1)
                    .allowsHitTesting(false)
            }
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

struct BeeveSectionHeader: View {
    let title: String
    var subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.footnote.weight(.semibold))
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
            .symbolRenderingMode(.hierarchical)
            .frame(width: 32, height: 32)
            .background(tint.opacity(0.12))
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
            .padding(.horizontal, 9)
            .padding(.vertical, 5)
            .background(BeeveDesign.elevatedSurface)
            .overlay {
                Capsule()
                    .stroke(BeeveDesign.border, lineWidth: 1)
                    .allowsHitTesting(false)
            }
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
