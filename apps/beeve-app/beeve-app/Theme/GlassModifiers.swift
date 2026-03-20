import SwiftUI

// MARK: - Glass Card Modifier

struct AppCardModifier: ViewModifier {
    let tint: Color
    let cornerRadius: CGFloat
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        let shadow = DSShadow.card(for: colorScheme)

        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(DSColor.surface1)
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(DSColor.stroke.opacity(colorScheme == .dark ? 0.24 : 0.12), lineWidth: 1)
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(tint.opacity(colorScheme == .dark ? 0.16 : 0.10), lineWidth: 1)
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(shadow.compensationColor, lineWidth: shadow.compensationLineWidth)
            )
            .shadow(color: shadow.color, radius: shadow.radius, x: shadow.x, y: shadow.y)
    }
}

// MARK: - Glass Capsule Modifier

struct GlassCapsuleModifier: ViewModifier {
    let tint: Color
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        content
            .background(
                Capsule()
                    .fill(tint.opacity(colorScheme == .dark ? 0.18 : 0.12))
            )
            .overlay(
                Capsule()
                    .strokeBorder(tint.opacity(colorScheme == .dark ? 0.18 : 0.12), lineWidth: 1)
            )
    }
}

// MARK: - View Extensions

extension View {
    func appCard(tint: Color = DSColor.brand, cornerRadius: CGFloat = DSRadius.card) -> some View {
        modifier(AppCardModifier(tint: tint, cornerRadius: cornerRadius))
    }

    func glassCapsule(tint: Color = DSColor.brand) -> some View {
        modifier(GlassCapsuleModifier(tint: tint))
    }

    func appChrome(cornerRadius: CGFloat = DSRadius.hero) -> some View {
        background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(DSColor.stroke.opacity(0.12), lineWidth: 1)
            )
    }
}

// MARK: - Button Styles

struct PressableScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .brightness(configuration.isPressed ? -0.02 : 0)
            .animation(.spring(response: 0.22, dampingFraction: 0.78), value: configuration.isPressed)
    }
}

// MARK: - App Background

struct AppBackgroundView: View {
    var body: some View {
        LinearGradient(
            colors: [
                DSColor.bg,
                DSColor.brand.opacity(0.06),
                DSColor.ping.opacity(0.05),
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}

// MARK: - Dock Glow

struct DockGlowOverlay: View {
    let tint: Color
    var cornerRadius: CGFloat = DSRadius.hero

    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            .stroke(tint.opacity(0.16), lineWidth: 1)
            .blur(radius: 0.5)
    }
}
