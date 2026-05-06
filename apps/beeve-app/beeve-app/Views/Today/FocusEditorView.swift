import SwiftData
import SwiftUI

struct FocusEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    let focus: DailyFocus?
    @State private var title: String
    @FocusState private var isTitleFocused: Bool

    init(focus: DailyFocus?) {
        self.focus = focus
        self._title = State(initialValue: focus?.title ?? "")
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("今天只选一件")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(BeeveDesign.primaryText)
                    Text("写得越具体，越容易开始。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                TextField("例如：补齐今天页记录入口", text: $title, axis: .vertical)
                    .font(.body)
                    .lineLimit(2...4)
                    .textInputAutocapitalization(.sentences)
                    .focused($isTitleFocused)
                    .beeveInputSurface()

                HStack(alignment: .top, spacing: 12) {
                    BeeveIconBubble(systemImage: "target", tint: BeeveDesign.accent)
                    Text("一个清楚的主线，比一整张清单更容易接住今天。")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .beevePanel(padding: 14, tint: BeeveDesign.accent)

                Spacer()
            }
            .padding(BeeveDesign.contentPadding)
            .background { BeeveSceneBackground() }
            .navigationTitle("当前主线")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") { save() }
                        .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
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

#Preview("新主线") {
    FocusEditorView(focus: nil)
        .modelContainer(SampleData.previewContainer())
}

#Preview("编辑主线") {
    let container = SampleData.previewContainer()

    FocusEditorView(focus: SampleData.previewFocus(from: container))
        .modelContainer(container)
}
