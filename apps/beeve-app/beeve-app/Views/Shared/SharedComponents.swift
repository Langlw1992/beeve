import SwiftUI

// MARK: - Circle Icon Badge

struct CircleIconBadge: View {
    let symbol: String
    let tint: Color
    var size: CGFloat = 38
    var iconSize: CGFloat = 16

    var body: some View {
        Circle()
            .fill(tint.opacity(0.12))
            .frame(width: size, height: size)
            .overlay(
                Image(systemName: symbol)
                    .font(.system(size: iconSize, weight: .semibold))
                    .foregroundStyle(tint)
            )
    }
}

// MARK: - Surface Kicker

struct SurfaceKicker: View {
    let title: String
    let symbol: String
    let tint: Color

    var body: some View {
        HStack(spacing: DSSpace.xs) {
            Image(systemName: symbol)
                .foregroundStyle(tint)
            Text(title)
                .lineLimit(1)
        }
        .font(DSType.meta.weight(.semibold))
        .foregroundStyle(DSColor.textSecondary)
    }
}

// MARK: - Priority Pill

struct PriorityPill: View {
    let priority: ReminderPriority

    var body: some View {
        Text(priority.label)
            .font(DSType.meta.weight(.medium))
            .padding(.horizontal, DSSpace.xs)
            .padding(.vertical, DSSpace.xxs)
            .background(priority.color.opacity(0.10), in: Capsule())
            .foregroundStyle(priority.color.opacity(0.9))
    }
}

// MARK: - Metric Mini Bars

struct MetricMiniBars: View {
    let tint: Color
    let level: Double

    var body: some View {
        HStack(alignment: .bottom, spacing: DSSpace.xxs) {
            ForEach(0..<5, id: \.self) { index in
                RoundedRectangle(cornerRadius: 3, style: .continuous)
                    .fill(index < highlightedBars ? tint : tint.opacity(0.18))
                    .frame(width: 6, height: CGFloat(8 + index * 5))
            }
        }
        .animation(.snappy, value: highlightedBars)
    }

    private var highlightedBars: Int {
        max(1, min(5, Int((level * 5).rounded(.up))))
    }
}

// MARK: - Action Chip

struct ActionChip: View {
    let title: String
    let systemImage: String
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: DSSpace.xs) {
                Image(systemName: systemImage)
                    .foregroundStyle(DSColor.textSecondary)
                Text(title)
                    .font(DSType.body.weight(.semibold))
                    .foregroundStyle(DSColor.textPrimary)
            }
            .padding(.horizontal, DSSpace.sm)
            .padding(.vertical, DSSpace.xs)
            .glassCapsule(tint: tint)
        }
        .buttonStyle(PressableScaleButtonStyle())
    }
}

// MARK: - Section Divider

struct SectionDivider: View {
    var body: some View {
        Divider()
            .padding(.leading, 50)
    }
}

// MARK: - Glass Section

struct GlassSection<Content: View>: View {
    let title: String
    let symbol: String
    let tint: Color
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: DSSpace.sm) {
            SurfaceKicker(title: title, symbol: symbol, tint: tint)
            content
        }
        .padding(DSSpace.md)
        .appCard(tint: tint, cornerRadius: DSRadius.hero)
    }
}

// MARK: - Expandable Section Card

struct ExpandableSectionCard<Content: View>: View {
    let title: String
    let symbol: String
    let tint: Color
    @Binding var isExpanded: Bool
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: DSSpace.sm) {
            Button {
                withAnimation(.spring(response: 0.32, dampingFraction: 0.82)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack(spacing: DSSpace.xs) {
                    SurfaceKicker(title: title, symbol: symbol, tint: tint)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .font(DSType.meta.weight(.bold))
                        .foregroundStyle(DSColor.textSecondary)
                        .rotationEffect(.degrees(isExpanded ? 0 : -90))
                }
            }
            .buttonStyle(.plain)
            .buttonStyle(PressableScaleButtonStyle())

            if isExpanded {
                content
                    .transition(.asymmetric(insertion: .move(edge: .top).combined(with: .opacity), removal: .opacity))
            }
        }
        .padding(DSSpace.md)
        .appCard(tint: tint, cornerRadius: DSRadius.hero)
    }
}

// MARK: - Hero Mini Banner

struct HeroMiniBanner: View {
    let title: String
    let subtitle: String
    let symbol: String
    let tint: Color

    var body: some View {
        HStack(alignment: .top, spacing: DSSpace.sm) {
            CircleIconBadge(symbol: symbol, tint: tint, size: 44, iconSize: 18)

            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(DSType.section)
                    .foregroundStyle(DSColor.textPrimary)
                Text(subtitle)
                    .font(DSType.body)
                    .foregroundStyle(DSColor.textSecondary)
            }
            Spacer()
        }
        .padding(DSSpace.md)
        .appCard(tint: tint, cornerRadius: DSRadius.hero)
    }
}

// MARK: - Assistant Toolbar Button

struct AssistantToolbarButton: View {
    let action: () -> Void
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        let capsuleTint = colorScheme == .dark ? DSColor.brandSoft : DSColor.brand

        Button(action: action) {
            HStack(spacing: DSSpace.xs) {
                Image(systemName: "lightbulb")
                    .font(DSType.body.weight(.semibold))
                    .foregroundStyle(DSColor.brand)
                Text("建议")
                    .font(DSType.body.weight(.semibold))
                    .foregroundStyle(DSColor.textPrimary)
            }
        }
        .buttonStyle(DSCapsuleButtonStyle(tint: capsuleTint))
    }
}

// MARK: - Segmented Filter Bar

struct SegmentedFilterBar: View {
    @Binding var selection: ReminderFilter
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DSSpace.xs) {
                ForEach(ReminderFilter.allCases) { filter in
                    Button {
                        selection = filter
                    } label: {
                        Text(filter.label)
                            .font(DSType.body.weight(.semibold))
                            .foregroundStyle(selection == filter ? AnyShapeStyle(.white) : AnyShapeStyle(DSColor.textPrimary))
                            .padding(.horizontal, DSSpace.md)
                            .frame(height: 40)
                            .background(
                                selection == filter
                                    ? AnyShapeStyle(
                                        LinearGradient(colors: [DSColor.ping, DSColor.brand], startPoint: .leading, endPoint: .trailing)
                                    )
                                    : AnyShapeStyle(.clear),
                                in: Capsule()
                            )
                            .glassCapsule(tint: selection == filter ? DSColor.ping : (colorScheme == .dark ? DSColor.stroke : DSColor.brand))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(DSSpace.xxs)
            .glassCapsule(tint: colorScheme == .dark ? DSColor.brandSoft : DSColor.ping)
        }
    }
}
