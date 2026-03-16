import SwiftUI

struct ToolsView: View {
    @Environment(BeeveStore.self) private var store
    @State private var activeSummary: String?

    let onOpenAssistant: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    HeroMiniBanner(
                        title: "工具箱",
                        subtitle: "把高频动作收在一个地方，减少在不同 App 之间来回切换。",
                        symbol: "square.grid.2x2.fill",
                        tint: .orange
                    )

                    GlassSection(title: "常用工具", symbol: "square.grid.2x2", tint: .orange) {
                        VStack(spacing: 0) {
                            ForEach(Array(store.tools.enumerated()), id: \.element.id) { index, tool in
                                Button {
                                    activeSummary = store.runTool(tool)
                                } label: {
                                    ToolListRow(tool: tool)
                                }
                                .buttonStyle(.plain)

                                if index < store.tools.count - 1 {
                                    SectionDivider()
                                }
                            }
                        }
                    }

                    if let activeSummary {
                        GlassSection(title: "刚刚完成", symbol: "checkmark.circle", tint: .orange) {
                            VStack(alignment: .leading, spacing: 10) {
                                Text(activeSummary)
                                    .font(.body)
                                    .foregroundStyle(.secondary)

                                Button("继续整理", action: onOpenAssistant)
                                    .buttonStyle(.bordered)
                            }
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .navigationTitle("工具")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton(action: onOpenAssistant)
                }
            }
        }
    }
}

struct ToolListRow: View {
    let tool: ToolItem

    var body: some View {
        HStack(spacing: 12) {
            CircleIconBadge(symbol: tool.symbolName, tint: tool.tint, size: 38, iconSize: 15)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(tool.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)

                    Spacer()

                    Text(tool.statusText)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(tool.tint)
                }

                Text(tool.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 12)
    }
}
