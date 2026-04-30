import SwiftData
import SwiftUI

struct QuickLogSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var kind: DayEntryKind = .done
    @State private var text = ""

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Log one thing")
                        .font(.title2.weight(.semibold))
                    Text("Small, specific notes work better than a perfect recap.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Picker("Kind", selection: $kind) {
                    ForEach(DayEntryKind.allCases) { kind in
                        Text(kind.title).tag(kind)
                    }
                }
                .pickerStyle(.segmented)

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
                    }
                    .frame(minHeight: 160)
                    .background(BeeveDesign.elevatedSurface)
                    .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous)
                            .stroke(BeeveDesign.border, lineWidth: 1)
                    }
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
                    .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
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
        case .done: "Example: shipped the first version of the focus screen"
        case .interrupted: "Example: context switch pulled me into admin work"
        case .tomorrow: "Example: start by tightening the card copy"
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
