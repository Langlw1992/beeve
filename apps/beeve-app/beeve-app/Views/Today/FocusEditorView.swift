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
            Form {
                Section("One real move") {
                    TextField("What would make today feel less scattered?", text: $title)
                }
            }
            .navigationTitle("Today's focus")
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
