import SwiftUI

// MARK: - Circle Icon Badge

struct CircleIconBadge: View {
    let symbol: String
    let tint: Color
    var size: CGFloat = 38
    var iconSize: CGFloat = 16

    var body: some View {
        Circle()
            .fill(Color(.tertiarySystemFill))
            .frame(width: size, height: size)
            .overlay(
                Image(systemName: symbol)
                    .font(.system(size: iconSize, weight: .semibold))
                    .foregroundStyle(.secondary)
            )
    }
}

// MARK: - Surface Kicker

struct SurfaceKicker: View {
    let title: String
    let symbol: String
    let tint: Color

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: symbol)
            Text(title)
                .lineLimit(1)
        }
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(.secondary)
    }
}

// MARK: - Priority Pill

struct PriorityPill: View {
    let priority: ReminderPriority

    var body: some View {
        Text(priority.label)
            .font(.caption.weight(.medium))
            .padding(.horizontal, 9)
            .padding(.vertical, 4)
            .background(priority.color.opacity(0.10), in: Capsule())
            .foregroundStyle(priority.color.opacity(0.9))
    }
}

// MARK: - Metric Mini Bars

struct MetricMiniBars: View {
    let tint: Color
    let level: Double

    var body: some View {
        HStack(alignment: .bottom, spacing: 4) {
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
            HStack(spacing: 8) {
                Image(systemName: systemImage)
                    .foregroundStyle(.secondary)
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
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
        VStack(alignment: .leading, spacing: 14) {
            SurfaceKicker(title: title, symbol: symbol, tint: tint)
            content
        }
        .padding(18)
        .appCard(tint: tint, cornerRadius: 26)
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
        VStack(alignment: .leading, spacing: 14) {
            Button {
                withAnimation(.spring(response: 0.32, dampingFraction: 0.82)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack(spacing: 10) {
                    SurfaceKicker(title: title, symbol: symbol, tint: tint)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.secondary)
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
        .padding(18)
        .appCard(tint: tint, cornerRadius: 26)
    }
}

// MARK: - Hero Mini Banner

struct HeroMiniBanner: View {
    let title: String
    let subtitle: String
    let symbol: String
    let tint: Color

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            CircleIconBadge(symbol: symbol, tint: tint, size: 44, iconSize: 18)

            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.headline)
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(18)
        .appCard(tint: tint, cornerRadius: 24)
    }
}

// MARK: - Assistant Toolbar Button

struct AssistantToolbarButton: View {
    let action: () -> Void
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: "lightbulb")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.secondary)
                Text("建议")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
            }
            .padding(.horizontal, 10)
            .frame(height: 36)
            .glassCapsule(tint: colorScheme == .dark ? .cyan : .indigo)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Segmented Filter Bar

struct SegmentedFilterBar: View {
    @Binding var selection: ReminderFilter
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(ReminderFilter.allCases) { filter in
                    Button {
                        selection = filter
                    } label: {
                        Text(filter.label)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(selection == filter ? AnyShapeStyle(.white) : AnyShapeStyle(.primary))
                            .padding(.horizontal, 16)
                            .frame(height: 36)
                            .background(
                                selection == filter
                                    ? AnyShapeStyle(
                                        LinearGradient(colors: [Color.cyan, Color.indigo], startPoint: .leading, endPoint: .trailing)
                                    )
                                    : AnyShapeStyle(.clear),
                                in: Capsule()
                            )
                            .glassCapsule(tint: selection == filter ? .cyan : (colorScheme == .dark ? .white : .indigo))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(6)
            .glassCapsule(tint: colorScheme == .dark ? .indigo : .cyan)
        }
    }
}
