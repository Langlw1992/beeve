import SwiftData
import SwiftUI

struct FocusEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    let focus: DailyFocus?
    @State private var title: String

    init(focus: DailyFocus?) {
        self.focus = focus
        self._title = State(initialValue: focus?.title ?? "")
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Today's focus")
                        .font(.title2.weight(.semibold))
                    Text("Keep it narrow enough that future-you can see whether it moved.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                VStack(alignment: .leading, spacing: 14) {
                    HStack(spacing: 12) {
                        BeeveIconBubble(systemImage: "target", tint: Color(.systemIndigo))
                        BeeveSectionHeader(title: "One real move")
                    }

                    TextField("What would make today feel less scattered?", text: $title)
                        .font(.body)
                        .textInputAutocapitalization(.sentences)
                        .padding(.horizontal, 16)
                        .frame(minHeight: BeeveDesign.controlHeight)
                        .background(BeeveDesign.elevatedSurface)
                        .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
                        .overlay {
                            RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous)
                                .stroke(BeeveDesign.border, lineWidth: 1)
                        }

                    Text("Good focus: a concrete move you can finish or clearly advance today.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                .beevePanel()

                Spacer()
            }
            .padding(BeeveDesign.contentPadding)
            .background(BeeveDesign.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        save()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
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
        dismiss()
    }
}

#Preview("New focus") {
    FocusEditorView(focus: nil)
        .modelContainer(SampleData.previewContainer())
}

#Preview("Edit focus") {
    let container = SampleData.previewContainer()

    FocusEditorView(focus: SampleData.previewFocus(from: container))
        .modelContainer(container)
}
