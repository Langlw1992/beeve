import SwiftData
import SwiftUI

struct QuickLogSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var kind: DayEntryKind = .done
    @State private var text = ""

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Picker("Kind", selection: $kind) {
                    ForEach(DayEntryKind.allCases) { kind in
                        Text(kind.title).tag(kind)
                    }
                }
                .pickerStyle(.segmented)

                Text(kind.prompt)
                    .font(.headline)

                TextEditor(text: $text)
                    .frame(minHeight: 140)
                    .padding(8)
                    .overlay {
                        RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous)
                            .stroke(BeeveDesign.border, lineWidth: 1)
                    }

                Spacer()
            }
            .padding(16)
            .navigationTitle("Log one thing")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        save()
                    }
                    .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }

    private func save() {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        modelContext.insert(DayEntry(kind: kind, text: trimmed))
        try? modelContext.save()
        dismiss()
    }
}
