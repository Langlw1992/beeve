import SwiftData
import SwiftUI
import UniformTypeIdentifiers

struct AssistantSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext

    let initialIntent: AssistantIntent
    let dayContext: DayContext

    @State private var selectedIntent: AssistantIntent
    @State private var draft: String
    @State private var reply: AssistantReply
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var hasAppeared = false
    @State private var isImporting = false
    @FocusState private var isDraftFocused: Bool

    init(initialIntent: AssistantIntent, context: DayContext, initialText: String? = nil) {
        let snapshot = AssistantContextSnapshot(context: context)
        let initialDraft = initialText ?? initialIntent.suggestedInput
        self.initialIntent = initialIntent
        dayContext = context
        _selectedIntent = State(initialValue: initialIntent)
        _draft = State(initialValue: initialDraft)
        _reply = State(initialValue: AssistantSuggestionEngine.makeReply(
            intent: initialIntent,
            userText: initialDraft,
            snapshot: snapshot
        ))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    assistantHeader
                    inputSection
                    replySection
                }
                .padding(.horizontal, BeeveDesign.contentPadding)
                .padding(.top, 16)
                .padding(.bottom, 32)
            }
            .background { BeeveSceneBackground() }
            .navigationTitle("Beeve AI")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("关闭") { dismiss() }
                }
            }
            .fileImporter(isPresented: $isImporting, allowedContentTypes: [.plainText, .text]) { result in
                importText(from: result)
            }
            .onAppear {
                hasAppeared = true
                runAssistant()
            }
        }
    }

    private var assistantHeader: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: "sparkles")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(width: 48, height: 48)
                    .background(Color.white.opacity(0.18))
                    .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

                VStack(alignment: .leading, spacing: 6) {
                    Text("Beeve AI 操作台")
                        .font(.title2.weight(.semibold))
                    Text("先选意图，再用导入或自然语言补充。")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.84))
                }

                Spacer()

                Text(DeepSeekSettings.isConfigured ? "DeepSeek" : "本地")
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .foregroundStyle(.primary)
                    .background(Color.white.opacity(0.92))
                    .clipShape(Capsule())
            }
            .foregroundStyle(.white)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(AssistantIntent.allCases) { intent in
                        AssistantIntentButton(
                            intent: intent,
                            isSelected: selectedIntent == intent
                        ) {
                            selectedIntent = intent
                            if draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                                draft = intent.suggestedInput
                            }
                            BeeveHaptics.selection()
                            runAssistant()
                        }
                    }
                }
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(BeeveDesign.accentGradient)
        .clipShape(RoundedRectangle(cornerRadius: 30, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .stroke(Color.white.opacity(0.26), lineWidth: 1)
        }
        .shadow(color: BeeveDesign.accent.opacity(0.14), radius: 18, x: 0, y: 10)
        .beeveReveal(hasAppeared)
    }

    private var inputSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 10) {
                Button {
                    selectedIntent = .importText
                    isImporting = true
                    BeeveHaptics.lightImpact()
                } label: {
                    Label("导入文本", systemImage: "square.and.arrow.down")
                }
                .buttonStyle(BeeveSecondaryButtonStyle())

                Button {
                    selectedIntent = .voiceCapture
                    isDraftFocused = true
                    BeeveHaptics.lightImpact()
                } label: {
                    Label("自然语言", systemImage: "waveform")
                }
                .buttonStyle(BeeveSecondaryButtonStyle())
            }

            ZStack(alignment: .topLeading) {
                if draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    Text("粘贴内容，或用一句话说明现在的情况")
                        .foregroundStyle(.tertiary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 16)
                }

                TextEditor(text: $draft)
                    .scrollContentBackground(.hidden)
                    .padding(10)
                    .focused($isDraftFocused)
                    .frame(minHeight: 104)
                    .onChange(of: draft) { _, _ in
                        errorMessage = nil
                    }
            }
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(Array(reply.quickPrompts.prefix(4)), id: \.self) { prompt in
                        Button {
                            draft = draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                                ? prompt
                                : "\(draft)\n\(prompt)"
                            BeeveHaptics.selection()
                            runAssistant()
                        } label: {
                            Text(prompt)
                                .font(.footnote.weight(.medium))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(BeeveDesign.elevatedSurface)
                                .clipShape(Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            Button {
                BeeveHaptics.lightImpact()
                runAssistant()
            } label: {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Label("生成建议", systemImage: "sparkles")
                }
            }
            .buttonStyle(BeevePrimaryButtonStyle())
        }
        .padding(18)
        .background(BeeveDesign.panelGradient(tint: BeeveDesign.accentDeep))
        .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous)
                .stroke(BeeveDesign.border, lineWidth: 1)
        }
        .beeveReveal(hasAppeared, delay: 0.04)
    }

    private var replySection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                BeeveIconBubble(systemImage: selectedIntent.systemImage, tint: BeeveDesign.warmAccent)
                VStack(alignment: .leading, spacing: 4) {
                    Text(reply.headline)
                        .font(.headline)
                    Text(reply.message)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }

            if let errorMessage {
                Label(errorMessage, systemImage: "exclamationmark.triangle")
                    .font(.footnote)
                    .foregroundStyle(Color(.systemOrange))
            }

            AssistantActionRow(
                title: "今日焦点",
                value: reply.focus,
                systemImage: "target",
                tint: BeeveDesign.accentDeep,
                actionTitle: "设定"
            ) {
                applyFocus()
            }

            AssistantActionRow(
                title: "推进记录",
                value: reply.done,
                systemImage: "checkmark.circle",
                tint: Color(.systemGreen),
                actionTitle: "记录"
            ) {
                addEntry(kind: .done, text: reply.done)
            }

            AssistantActionRow(
                title: "打断",
                value: reply.interrupted,
                systemImage: "arrow.triangle.branch",
                tint: Color(.systemOrange),
                actionTitle: "记录"
            ) {
                addEntry(kind: .interrupted, text: reply.interrupted)
            }

            AssistantActionRow(
                title: "明天",
                value: reply.tomorrow,
                systemImage: "arrow.right.circle",
                tint: BeeveDesign.warmAccent,
                actionTitle: "记录"
            ) {
                addEntry(kind: .tomorrow, text: reply.tomorrow)
            }

            Button {
                applyAll()
            } label: {
                Label("一键写入", systemImage: "tray.and.arrow.down.fill")
            }
            .buttonStyle(BeevePrimaryButtonStyle())
        }
        .beeveReveal(hasAppeared, delay: 0.08)
        .animation(.easeOut(duration: 0.2), value: reply)
    }

    private func runAssistant() {
        let snapshot = AssistantContextSnapshot(context: dayContext)
        let localReply = AssistantSuggestionEngine.makeReply(intent: selectedIntent, userText: draft, snapshot: snapshot)
        withAnimation(.easeOut(duration: 0.18)) {
            reply = localReply
            errorMessage = nil
        }

        guard DeepSeekSettings.isConfigured else { return }

        isLoading = true
        let intent = selectedIntent
        let text = draft
        let apiKey = DeepSeekSettings.apiKey
        let model = DeepSeekSettings.model
        Task {
            do {
                let remoteReply = try await DeepSeekClient(apiKey: apiKey, model: model).assistantReply(
                    intent: intent,
                    userText: text,
                    snapshot: snapshot
                )
                await MainActor.run {
                    withAnimation(.easeOut(duration: 0.2)) {
                        reply = remoteReply
                    }
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = "DeepSeek 暂时不可用，先用本地建议。"
                    isLoading = false
                }
            }
        }
    }

    private func importText(from result: Result<URL, Error>) {
        guard case let .success(url) = result else {
            errorMessage = "导入失败，请换一个文本文件。"
            return
        }

        let hasAccess = url.startAccessingSecurityScopedResource()
        defer {
            if hasAccess {
                url.stopAccessingSecurityScopedResource()
            }
        }

        do {
            let text = try String(contentsOf: url, encoding: .utf8)
            draft = String(text.prefix(1800))
            selectedIntent = .importText
            BeeveHaptics.success()
            runAssistant()
        } catch {
            errorMessage = "暂时只能导入 UTF-8 文本。"
        }
    }

    private func applyFocus() {
        let text = reply.focus.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        if let focus = dayContext.focus {
            focus.title = text
            focus.updatedAt = .now
        } else {
            modelContext.insert(DailyFocus(date: dayContext.date, title: text))
        }

        saveAndSignal()
    }

    private func addEntry(kind: DayEntryKind, text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        modelContext.insert(DayEntry(date: dayContext.date, kind: kind, text: trimmed))
        saveAndSignal()
    }

    private func applyAll() {
        let focusText = reply.focus.trimmingCharacters(in: .whitespacesAndNewlines)
        if !focusText.isEmpty {
            if let focus = dayContext.focus {
                focus.title = focusText
                focus.updatedAt = .now
            } else {
                modelContext.insert(DailyFocus(date: dayContext.date, title: focusText))
            }
        }

        insertEntryIfNeeded(kind: .done, text: reply.done)
        insertEntryIfNeeded(kind: .interrupted, text: reply.interrupted)
        insertEntryIfNeeded(kind: .tomorrow, text: reply.tomorrow)
        saveAndSignal()
        dismiss()
    }

    private func insertEntryIfNeeded(kind: DayEntryKind, text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        modelContext.insert(DayEntry(date: dayContext.date, kind: kind, text: trimmed))
    }

    private func saveAndSignal() {
        try? modelContext.save()
        BeeveHaptics.success()
    }
}

private struct AssistantIntentButton: View {
    let intent: AssistantIntent
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 7) {
                Image(systemName: intent.systemImage)
                    .font(.footnote.weight(.semibold))
                Text(intent.title)
                    .font(.footnote.weight(.semibold))
                    .lineLimit(1)
            }
            .foregroundStyle(isSelected ? Color.primary : Color.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 9)
            .background(isSelected ? Color.white.opacity(0.94) : Color.white.opacity(0.16))
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(intent.title)
        .accessibilityHint(intent.subtitle)
    }
}

private struct AssistantActionRow: View {
    let title: String
    let value: String
    let systemImage: String
    let tint: Color
    let actionTitle: String
    let action: () -> Void

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: systemImage)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(tint)
                .frame(width: 32, height: 32)
                .background(tint.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(.subheadline.weight(.medium))
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 8)

            Button(actionTitle, action: action)
                .font(.footnote.weight(.semibold))
                .buttonStyle(.bordered)
                .controlSize(.small)
                .tint(tint)
        }
        .padding(14)
        .background(BeeveDesign.elevatedSurface)
        .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: BeeveDesign.innerRadius, style: .continuous)
                .stroke(BeeveDesign.border, lineWidth: 1)
        }
    }
}

#Preview {
    AssistantSheet(initialIntent: .planToday, context: DayContext(
        date: .now,
        preferences: SampleData.preferences,
        focus: SampleData.focus,
        entries: SampleData.entries
    ))
    .modelContainer(SampleData.previewContainer())
}
