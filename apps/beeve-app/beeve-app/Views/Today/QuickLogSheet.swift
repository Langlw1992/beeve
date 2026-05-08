import SwiftData
import SwiftUI

struct QuickLogSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var kind: DayEntryKind = .done
    @State private var text = ""
    @FocusState private var isTextFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 18) {
                Text("不用整理。写下片段，Beeve 会帮你放到合适的位置。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                TextEditor(text: $text)
                    .scrollContentBackground(.hidden)
                    .padding(12)
                    .frame(minHeight: 150)
                    .background(BeeveDesign.elevatedSurface)
                    .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous))
                    .overlay(alignment: .topLeading) {
                        if text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                            Text(placeholder(for: kind))
                                .font(.body)
                                .foregroundStyle(.tertiary)
                                .padding(.horizontal, 18)
                                .padding(.vertical, 20)
                                .allowsHitTesting(false)
                        }
                    }
                    .overlay {
                        RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous)
                            .stroke(BeeveDesign.border, lineWidth: 1)
                            .allowsHitTesting(false)
                    }
                    .focused($isTextFocused)

                Picker("类型", selection: $kind) {
                    ForEach(DayEntryKind.allCases) { kind in
                        Text(kind.title).tag(kind)
                    }
                }
                .pickerStyle(.segmented)
                .onChange(of: kind) { _, _ in
                    BeeveHaptics.selection()
                }

                suggestion

                Spacer()
            }
            .padding(BeeveDesign.contentPadding)
            .background { BeeveSceneBackground() }
            .navigationTitle("先说一句")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") { save() }
                        .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .safeAreaInset(edge: .bottom) {
                Button {
                    save()
                } label: {
                    Text("写入今天")
                }
                .buttonStyle(BeevePrimaryButtonStyle())
                .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                .opacity(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.55 : 1)
                .padding(.horizontal, BeeveDesign.contentPadding)
                .padding(.top, 8)
                .padding(.bottom, 8)
                .background(.regularMaterial)
            }
            .onAppear {
                isTextFocused = false
            }
        }
    }

    private var suggestion: some View {
        HStack(alignment: .top, spacing: 12) {
            BeeveIconBubble(systemImage: kind.systemImage, tint: tint(for: kind))
            VStack(alignment: .leading, spacing: 4) {
                Text("建议写入\(kind.title)")
                    .font(.body.weight(.medium))
                    .foregroundStyle(BeeveDesign.primaryText)
                Text(kind.prompt)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .beevePanel(padding: 14, tint: tint(for: kind))
    }

    private func tint(for kind: DayEntryKind) -> Color {
        switch kind {
        case .done: BeeveDesign.accent
        case .interrupted: BeeveDesign.warmAccent
        case .tomorrow: BeeveDesign.tomorrowAccent
        }
    }

    private func placeholder(for kind: DayEntryKind) -> String {
        switch kind {
        case .done: "例如：确认了入口缺失的原因"
        case .interrupted: "例如：被构建问题打断"
        case .tomorrow: "例如：明早先补今天页记录入口"
        }
    }

    private func save() {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        modelContext.insert(DayEntry(kind: kind, text: trimmed))
        try? modelContext.save()
        BeeveHaptics.success()
        dismiss()
    }
}

#Preview {
    QuickLogSheet()
        .modelContainer(SampleData.previewContainer())
}
