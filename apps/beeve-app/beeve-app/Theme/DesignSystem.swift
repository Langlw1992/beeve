import SwiftUI
import UIKit

enum BeeveDesign {
    static let background = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.025, green: 0.027, blue: 0.037, alpha: 1)
            : UIColor(red: 0.955, green: 0.968, blue: 0.984, alpha: 1)
    })
    static let surface = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.085, green: 0.091, blue: 0.118, alpha: 0.82)
            : UIColor(red: 1, green: 1, blue: 1, alpha: 0.72)
    })
    static let elevatedSurface = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor(red: 0.115, green: 0.122, blue: 0.155, alpha: 0.86)
            : UIColor(red: 1, green: 1, blue: 1, alpha: 0.82)
    })
    static let border = Color.white.opacity(0.34)
    static let darkBorder = Color(.label).opacity(0.08)
    static let accent = Color(.systemCyan)
    static let accentDeep = Color(.systemIndigo)
    static let warmAccent = Color(.systemPink)
    static let mutedText = Color.secondary
    static let radius: CGFloat = 30
    static let innerRadius: CGFloat = 22
    static let controlHeight: CGFloat = 54
    static let contentPadding: CGFloat = 20

    static var accentGradient: LinearGradient {
        LinearGradient(
            colors: [Color(.systemCyan), Color(.systemIndigo), Color(.systemPink)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var softGlassGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color.white.opacity(0.42),
                Color.white.opacity(0.12),
                Color(.systemCyan).opacity(0.10),
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

struct BeevePanel: ViewModifier {
    var padding: CGFloat = 20
    var radius: CGFloat = BeeveDesign.radius
    var tint: Color?

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay {
                        RoundedRectangle(cornerRadius: radius, style: .continuous)
                            .fill(BeeveDesign.softGlassGradient)
                    }
                    .overlay(alignment: .topLeading) {
                        if let tint {
                            Circle()
                                .fill(tint.opacity(0.22))
                                .frame(width: 180, height: 180)
                                .blur(radius: 42)
                                .offset(x: -62, y: -72)
                                .allowsHitTesting(false)
                        }
                    }
            }
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .strokeBorder(
                        LinearGradient(
                            colors: [Color.white.opacity(0.72), Color.white.opacity(0.18), BeeveDesign.darkBorder],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            }
            .padding(5)
            .background {
                RoundedRectangle(cornerRadius: radius + 5, style: .continuous)
                    .fill(Color.white.opacity(0.12))
                    .overlay {
                        RoundedRectangle(cornerRadius: radius + 5, style: .continuous)
                            .stroke(Color.white.opacity(0.22), lineWidth: 1)
                    }
            }
            .shadow(color: Color(.label).opacity(0.10), radius: 24, x: 0, y: 16)
    }
}

struct BeeveSceneBackground: View {
    var body: some View {
        TimelineView(.animation) { timeline in
            let phase = timeline.date.timeIntervalSinceReferenceDate

            ZStack {
                BeeveDesign.background
                LinearGradient(
                    colors: [
                        Color(.systemCyan).opacity(0.30),
                        Color(.systemIndigo).opacity(0.12),
                        Color(.systemPink).opacity(0.20),
                        Color(.systemBackground).opacity(0.14),
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                AngularGradient(
                    colors: [
                        Color.white.opacity(0.24),
                        Color(.systemCyan).opacity(0.14),
                        Color(.systemPink).opacity(0.12),
                        Color(.systemIndigo).opacity(0.10),
                        Color.white.opacity(0.20),
                    ],
                    center: .center
                )
                .rotationEffect(.degrees(phase.truncatingRemainder(dividingBy: 32) * 2))
                .opacity(0.52)
                .blur(radius: 42)
            }
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
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous)
                    .stroke(Color.white.opacity(0.34), lineWidth: 1)
            }
    }

    func beeveReveal(_ isActive: Bool, delay: Double = 0) -> some View {
        opacity(isActive ? 1 : 0)
            .offset(y: isActive ? 0 : 18)
            .scaleEffect(isActive ? 1 : 0.985)
            .blur(radius: isActive ? 0 : 8)
            .animation(.spring(response: 0.62, dampingFraction: 0.86).delay(delay), value: isActive)
    }
}

struct BeevePrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: BeeveDesign.controlHeight)
            .background(BeeveDesign.accentGradient)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(Color.white.opacity(0.32), lineWidth: 1)
            }
            .scaleEffect(configuration.isPressed ? 0.975 : 1)
            .shadow(color: BeeveDesign.accent.opacity(configuration.isPressed ? 0.08 : 0.24), radius: 18, x: 0, y: 10)
            .animation(.spring(response: 0.24, dampingFraction: 0.72), value: configuration.isPressed)
    }
}

struct BeeveSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(.primary)
            .frame(maxWidth: .infinity, minHeight: BeeveDesign.controlHeight)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(Color.white.opacity(0.34), lineWidth: 1)
            }
            .scaleEffect(configuration.isPressed ? 0.975 : 1)
            .animation(.spring(response: 0.24, dampingFraction: 0.72), value: configuration.isPressed)
    }
}

struct BeeveIconButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .frame(minWidth: 44, minHeight: 44)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(Color.white.opacity(0.32), lineWidth: 1)
            }
            .scaleEffect(configuration.isPressed ? 0.94 : 1)
            .animation(.spring(response: 0.22, dampingFraction: 0.68), value: configuration.isPressed)
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
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(Color.white.opacity(0.28), lineWidth: 1)
            }
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
            .background(BeeveDesign.elevatedSurface)
            .overlay {
                Capsule().stroke(BeeveDesign.border, lineWidth: 1)
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
