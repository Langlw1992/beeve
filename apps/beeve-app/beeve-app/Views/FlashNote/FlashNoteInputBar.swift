import SwiftUI

struct FlashNoteInputBar: View {
    @Environment(BeeveStore.self) private var store
    @FocusState private var isFocused: Bool
    @State private var draft = ""
    @State private var feedbackTrigger = 0
    var icon: String = "square.and.pencil"
    var placeholder: String = "先记下来，稍后再整理…"
    var onSend: (() -> Void)? = nil

    var body: some View {
        HStack(alignment: .bottom, spacing: 12) {
            HStack(spacing: 10) {
                CircleIconBadge(symbol: icon, tint: AppTheme.capture, size: 36, iconSize: 14)

                TextField(placeholder, text: $draft, axis: .vertical)
                    .font(.body)
                    .lineLimit(1...4)
                    .submitLabel(.send)
                    .focused($isFocused)
                    .onSubmit(send)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(AppTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .strokeBorder(AppTheme.capture.opacity(0.10), lineWidth: 0.8)
            )

            Button(action: send) {
                Image(systemName: "arrow.up")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(width: 46, height: 46)
                    .background(AppTheme.capture, in: Circle())
                    .shadow(color: AppTheme.capture.opacity(0.28), radius: 14, y: 8)
            }
            .buttonStyle(PressableScaleButtonStyle())
            .disabled(!canSend)
            .opacity(canSend ? 1 : 0.55)
        }
        .padding(.horizontal)
        .padding(.top, 12)
        .padding(.bottom, 10)
        .background(.ultraThinMaterial)
        .overlay(alignment: .top) {
            Divider().opacity(0.35)
        }
        .sensoryFeedback(.success, trigger: feedbackTrigger)
    }

    private var canSend: Bool {
        !draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func send() {
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
            store.addFlashNote(content: text, source: .text)
        }
        draft = ""
        feedbackTrigger += 1
        isFocused = true
        onSend?()
    }
}
