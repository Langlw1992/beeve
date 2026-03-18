import SwiftUI

// MARK: - Glass Card Modifier

struct AppCardModifier: ViewModifier {
    let tint: Color
    let cornerRadius: CGFloat

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(Color(.secondarySystemGroupedBackground))
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(Color.primary.opacity(0.06), lineWidth: 1)
            )
    }
}

// MARK: - Glass Capsule Modifier

struct GlassCapsuleModifier: ViewModifier {
    let tint: Color

    func body(content: Content) -> some View {
        content
            .background(
                Capsule()
                    .fill(tint.opacity(0.1))
            )
    }
}

// MARK: - View Extensions

extension View {
    func appCard(tint: Color = .indigo, cornerRadius: CGFloat = AppSpacing.cardCornerRadius) -> some View {
        modifier(AppCardModifier(tint: tint, cornerRadius: cornerRadius))
    }

    func glassCapsule(tint: Color = .indigo) -> some View {
        modifier(GlassCapsuleModifier(tint: tint))
    }

    func immersiveScrollMotion() -> some View {
        self
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
        Color(.systemGroupedBackground)
        .ignoresSafeArea()
    }
}

// MARK: - Dock Glow

struct DockGlowOverlay: View {
    let tint: Color
    var cornerRadius: CGFloat = 22

    var body: some View {
        EmptyView()
    }
}
