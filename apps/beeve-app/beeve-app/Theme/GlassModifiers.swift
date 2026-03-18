import SwiftUI

// MARK: - Glass Card Modifier

struct AppCardModifier: ViewModifier {
    let tint: Color
    let cornerRadius: CGFloat

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(AppTheme.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(tint.opacity(0.10), lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 16, y: 8)
    }
}

// MARK: - Glass Capsule Modifier

struct GlassCapsuleModifier: ViewModifier {
    let tint: Color

    func body(content: Content) -> some View {
        content
            .background(
                Capsule()
                    .fill(tint.opacity(0.12))
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

    func appChrome(cornerRadius: CGFloat = 22) -> some View {
        background(AppTheme.chromeMaterial, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
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
                Color(uiColor: .systemGroupedBackground),
                AppTheme.brand.opacity(0.06),
                AppTheme.capture.opacity(0.05),
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
    var cornerRadius: CGFloat = 22

    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            .stroke(tint.opacity(0.16), lineWidth: 1)
            .blur(radius: 0.5)
    }
}
