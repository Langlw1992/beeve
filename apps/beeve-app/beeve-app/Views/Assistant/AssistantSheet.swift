import SwiftUI

struct AssistantSheet: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var draft = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        HeroMiniBanner(
                            title: "建议",
                            subtitle: store.assistantContextSummary,
                            symbol: "lightbulb",
                            tint: .indigo
                        )

                        ForEach(store.messages) { message in
                            MessageBubble(message: message)
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

                    Text("当前内容为本地演示结果，后续会接入真实能力。")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .appCard(tint: .indigo, cornerRadius: 12)

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
}

struct MessageBubble: View {
    let message: AssistantMessage

    var body: some View {
        bubble
            .frame(maxWidth: .infinity, alignment: .leading)
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
        }
        .padding(14)
        .appCard(tint: message.role == .assistant ? .indigo : .cyan, cornerRadius: 20)
    }
}
