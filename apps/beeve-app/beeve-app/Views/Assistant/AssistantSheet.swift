import SwiftUI

struct AssistantSheet: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var draft = ""

    var onSelectAction: ((AssistantActionSuggestion) -> Void)? = nil

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        contextCard

                        ForEach(store.messages) { message in
                            MessageBubble(message: message, onSelectAction: onSelectAction)
                        }
                    }
                    .padding()
                    .padding(.bottom, 8)
                }

                Divider()

                VStack(alignment: .leading, spacing: 12) {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(store.suggestedAssistantPrompts(), id: \.self) { prompt in
                                Button(prompt) {
                                    store.sendMessage(prompt)
                                }
                                .buttonStyle(.bordered)
                            }
                        }
                    }

                    Text("Beeve 会基于你的当前任务、Capture 队列和已保存偏好给出建议。")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .appCard(tint: AppTheme.brand, cornerRadius: 12)

                    HStack(alignment: .bottom, spacing: 12) {
                        TextField("比如：帮我拆解今天的任务", text: $draft, axis: .vertical)
                            .textFieldStyle(.roundedBorder)
                            .lineLimit(1...4)

                        Button {
                            store.sendMessage(draft)
                            draft = ""
                        } label: {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.system(size: 30))
                        }
                        .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
                .padding()
                .background(AppBackgroundView())
            }
            .navigationTitle("建议")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("关闭") { dismiss() }
                }
            }
        }
    }

    private var contextCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            SurfaceKicker(title: "上下文", symbol: "brain.head.profile", tint: AppTheme.brand)
            Text(store.assistantContextSummary)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            if !store.memorySummaryLines.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(store.memorySummaryLines, id: \.self) { item in
                            Text(item)
                                .font(.caption.weight(.medium))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .glassCapsule(tint: AppTheme.brand)
                        }
                    }
                }
            }
        }
        .padding(16)
        .appCard(tint: AppTheme.brand, cornerRadius: 22)
    }
}

struct MessageBubble: View {
    let message: AssistantMessage
    let onSelectAction: ((AssistantActionSuggestion) -> Void)?

    var body: some View {
        bubble
            .frame(maxWidth: .infinity, alignment: message.role == .assistant ? .leading : .trailing)
    }

    private var bubble: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(message.role == .assistant ? "Beeve 建议" : "你的输入")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)

                Spacer()

                Text(message.createdAt.formatted(date: .omitted, time: .shortened))
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Text(message.content)
                .font(.body)
                .foregroundStyle(.primary)

            if let actions = message.suggestedActions, !actions.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(actions) { action in
                            Button {
                                onSelectAction?(action)
                            } label: {
                                Label(action.title, systemImage: action.systemImage)
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                    .padding(.top, 4)
                }
            }
        }
        .padding(14)
        .appCard(tint: message.role == .assistant ? AppTheme.brand : AppTheme.capture, cornerRadius: 20)
    }
}
