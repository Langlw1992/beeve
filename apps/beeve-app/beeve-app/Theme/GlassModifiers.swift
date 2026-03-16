import SwiftUI

// MARK: - Glass Card Modifier

struct AppCardModifier: ViewModifier {
    let tint: Color
    let cornerRadius: CGFloat

    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(.ultraThinMaterial)
            )
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                .white.opacity(colorScheme == .dark ? 0.16 : 0.46),
                                tint.opacity(colorScheme == .dark ? 0.18 : 0.12),
                                .clear,
                                tint.opacity(colorScheme == .dark ? 0.12 : 0.07),
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
            .background(
                AuroraBackdrop(primary: tint, secondary: .white, cornerRadius: cornerRadius)
                    .opacity(colorScheme == .dark ? 0.8 : 0.55)
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(
                        LinearGradient(
                            colors: [
                                .white.opacity(colorScheme == .dark ? 0.26 : 0.70),
                                tint.opacity(colorScheme == .dark ? 0.20 : 0.18),
                                .white.opacity(colorScheme == .dark ? 0.06 : 0.22),
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(borderColor, lineWidth: 0.6)
                    .blur(radius: 0.6)
            )
            .shadow(color: tint.opacity(colorScheme == .dark ? 0.18 : 0.10), radius: 24, y: 12)
            .shadow(color: shadowColor, radius: 16, y: 8)
    }

    private var borderColor: Color {
        colorScheme == .dark ? .white.opacity(0.06) : tint.opacity(0.10)
    }

    private var shadowColor: Color {
        colorScheme == .dark ? .black.opacity(0.12) : .black.opacity(0.04)
    }
}

// MARK: - Glass Capsule Modifier

struct GlassCapsuleModifier: ViewModifier {
    let tint: Color

    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        content
            .background(.ultraThinMaterial, in: Capsule())
            .background(
                Capsule()
                    .fill(
                        LinearGradient(
                            colors: [
                                .white.opacity(colorScheme == .dark ? 0.10 : 0.55),
                                tint.opacity(colorScheme == .dark ? 0.18 : 0.12),
                                .clear,
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
            .overlay(
                Capsule()
                    .strokeBorder(
                        LinearGradient(
                            colors: [
                                .white.opacity(colorScheme == .dark ? 0.20 : 0.75),
                                tint.opacity(colorScheme == .dark ? 0.20 : 0.14),
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        lineWidth: 0.9
                    )
            )
            .shadow(color: tint.opacity(colorScheme == .dark ? 0.12 : 0.08), radius: 12, y: 6)
    }
}

// MARK: - View Extensions

extension View {
    func appCard(tint: Color = .indigo, cornerRadius: CGFloat = 24) -> some View {
        modifier(AppCardModifier(tint: tint, cornerRadius: cornerRadius))
    }

    func glassCapsule(tint: Color = .indigo) -> some View {
        modifier(GlassCapsuleModifier(tint: tint))
    }

    func immersiveScrollMotion() -> some View {
        scrollTransition(axis: .vertical) { content, phase in
            content
                .scaleEffect(phase.isIdentity ? 1 : 0.97)
                .opacity(phase.isIdentity ? 1 : 0.9)
                .offset(y: phase.isIdentity ? 0 : 10)
        }
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

// MARK: - Aurora Backdrop

struct AuroraBackdrop: View {
    let primary: Color
    let secondary: Color
    var cornerRadius: CGFloat = 30

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Circle()
                    .fill(primary.opacity(0.18))
                    .frame(width: geometry.size.width * 0.72)
                    .blur(radius: 24)
                    .offset(
                        x: -geometry.size.width * 0.18,
                        y: -geometry.size.height * 0.20
                    )

                Circle()
                    .fill(secondary.opacity(0.14))
                    .frame(width: geometry.size.width * 0.64)
                    .blur(radius: 22)
                    .offset(
                        x: geometry.size.width * 0.2,
                        y: geometry.size.height * 0.12
                    )

                LinearGradient(
                    colors: [
                        .white.opacity(0.18),
                        .clear,
                        secondary.opacity(0.08),
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
        }
        .allowsHitTesting(false)
    }
}

// MARK: - App Background

struct AppBackgroundView: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
            LinearGradient(
                colors: colorScheme == .dark
                    ? [
                        Color(red: 0.05, green: 0.07, blue: 0.16),
                        Color(red: 0.07, green: 0.09, blue: 0.19),
                        Color(red: 0.03, green: 0.04, blue: 0.10),
                    ]
                    : [
                        Color(red: 0.93, green: 0.96, blue: 1.0),
                        Color(red: 0.90, green: 0.94, blue: 1.0),
                        Color(red: 0.96, green: 0.95, blue: 1.0),
                    ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            Circle()
                .fill(Color.cyan.opacity(colorScheme == .dark ? 0.26 : 0.18))
                .frame(width: 320, height: 320)
                .blur(radius: 72)
                .offset(x: -120, y: -280)

            Circle()
                .fill(Color.indigo.opacity(colorScheme == .dark ? 0.24 : 0.16))
                .frame(width: 280, height: 280)
                .blur(radius: 68)
                .offset(x: 150, y: -180)

            Circle()
                .fill(Color.purple.opacity(colorScheme == .dark ? 0.18 : 0.14))
                .frame(width: 260, height: 260)
                .blur(radius: 70)
                .offset(x: 110, y: 250)

            Rectangle()
                .fill(.ultraThinMaterial.opacity(colorScheme == .dark ? 0.12 : 0.18))
        }
        .ignoresSafeArea()
    }
}

// MARK: - Dock Glow

struct DockGlowOverlay: View {
    let tint: Color
    var cornerRadius: CGFloat = 22

    var body: some View {
        GeometryReader { geometry in
            LinearGradient(
                colors: [
                    .clear,
                    tint.opacity(0.18),
                    .white.opacity(0.14),
                    .clear,
                ],
                startPoint: .leading,
                endPoint: .trailing
            )
            .frame(width: geometry.size.width * 0.52)
            .blur(radius: 14)
            .offset(x: geometry.size.width * 0.12)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
        .allowsHitTesting(false)
    }
}
