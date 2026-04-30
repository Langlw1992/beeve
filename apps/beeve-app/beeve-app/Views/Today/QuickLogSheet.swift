import SwiftData
import SwiftUI

struct QuickLogSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var kind: DayEntryKind = .done
    @State private var text = ""
    @State private var hasAppeared = false
    @FocusState private var isTextFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("记录一件事")
                        .font(.title2.weight(.semibold))
                    Text("写一个具体片段。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .beeveReveal(hasAppeared)

                Picker("类型", selection: $kind) {
                    ForEach(DayEntryKind.allCases) { kind in
                        Text(kind.title).tag(kind)
                    }
                }
                .pickerStyle(.segmented)
                .onChange(of: kind) { _, _ in
                    BeeveHaptics.selection()
                }
                .beeveReveal(hasAppeared, delay: 0.05)

                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 12) {
                        BeeveIconBubble(systemImage: kind.systemImage, tint: tint(for: kind))
                        Text(kind.prompt)
                            .font(.headline)
                    }

                    ZStack(alignment: .topLeading) {
                        if text.isEmpty {
                            Text(placeholder(for: kind))
                                .foregroundStyle(.tertiary)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 16)
                        }

                        TextEditor(text: $text)
                            .scrollContentBackground(.hidden)
                            .padding(10)
                            .focused($isTextFocused)
                    }
                    .frame(minHeight: 160)
                    .background(BeeveDesign.elevatedSurface)
                    .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous)
                            .stroke(BeeveDesign.border, lineWidth: 1)
                    }
                }
                .beevePanel(tint: tint(for: kind))
                .beeveReveal(hasAppeared, delay: 0.10)
                .animation(.snappy(duration: 0.2), value: kind)

                Spacer()
            }
            .padding(BeeveDesign.contentPadding)
            .background { BeeveSceneBackground() }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        save()
                    }
                    .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                hasAppeared = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                    isTextFocused = true
                }
            }
        }
    }

    private func tint(for kind: DayEntryKind) -> Color {
        switch kind {
        case .done: Color(.systemGreen)
        case .interrupted: Color(.systemOrange)
        case .tomorrow: Color(.systemIndigo)
        }
    }

    private func placeholder(for kind: DayEntryKind) -> String {
        switch kind {
        case .done: "例如：收紧了首页层级"
        case .interrupted: "例如：被构建问题打断"
        case .tomorrow: "例如：明早先看分享文案"
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
