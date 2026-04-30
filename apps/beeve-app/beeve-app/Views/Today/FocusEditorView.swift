import SwiftData
import SwiftUI

struct FocusEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    let focus: DailyFocus?
    @State private var title: String
    @State private var hasAppeared = false
    @FocusState private var isTitleFocused: Bool

    init(focus: DailyFocus?) {
        self.focus = focus
        self._title = State(initialValue: focus?.title ?? "")
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("今日焦点")
                        .font(.title2.weight(.semibold))
                    Text("只写今天要推进的一件事。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .beeveReveal(hasAppeared)

                VStack(alignment: .leading, spacing: 14) {
                    HStack(spacing: 12) {
                        BeeveIconBubble(systemImage: "target", tint: BeeveDesign.accentDeep)
                        BeeveSectionHeader(title: "一个真实推进")
                    }

                    TextField("今天最值得推进的一件事", text: $title)
                        .font(.body)
                        .textInputAutocapitalization(.sentences)
                        .focused($isTitleFocused)
                        .beeveInputSurface()

                    Text("越具体，越容易开始。")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                .beevePanel(tint: BeeveDesign.accentDeep)
                .beeveReveal(hasAppeared, delay: 0.06)

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
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                hasAppeared = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.30) {
                    isTitleFocused = true
                }
            }
        }
    }

    private func save() {
        let trimmed = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        if let focus {
            focus.title = trimmed
            focus.updatedAt = .now
        } else {
            modelContext.insert(DailyFocus(title: trimmed))
        }

        try? modelContext.save()
        BeeveHaptics.success()
        dismiss()
    }
}

#Preview("新焦点") {
    FocusEditorView(focus: nil)
        .modelContainer(SampleData.previewContainer())
}

#Preview("编辑焦点") {
    let container = SampleData.previewContainer()

    FocusEditorView(focus: SampleData.previewFocus(from: container))
        .modelContainer(container)
}
