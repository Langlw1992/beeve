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
    @State private var hasGenerated = false
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

    private var canGenerate: Bool {
        !draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isLoading
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    header
                    intentRail

                    if hasGenerated {
                        replySection
                    } else {
                        starterSection
                    }
                }
                .padding(.horizontal, BeeveDesign.contentPadding)
                .padding(.top, 12)
                .padding(.bottom, hasGenerated ? 112 : 172)
            }
            .background { BeeveSceneBackground() }
            .navigationTitle("Beeve AI")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("关闭") { dismiss() }
                }
            }
            .safeAreaInset(edge: .bottom) {
                bottomBar
            }
            .fileImporter(isPresented: $isImporting, allowedContentTypes: [.plainText, .text]) { result in
                importText(from: result)
            }
            .onAppear {
                hasAppeared = true
                isDraftFocused = draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            }
        }
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 12) {
            BeeveIconBubble(systemImage: "sparkles", tint: BeeveDesign.accent)

            VStack(alignment: .leading, spacing: 4) {
                Text("帮你收束今天")
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(BeeveDesign.primaryText)
                Text("描述现在的情况，Beeve 会压成一条主线和几条可写入的线索。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 8)

            Text(BeeveAPISettings.isConfigured ? "在线建议" : "基础建议")
                .font(.caption.weight(.semibold))
                .foregroundStyle(BeeveDesign.accentDeep)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(BeeveDesign.accent.opacity(0.12))
                .clipShape(Capsule())
        }
        .beeveReveal(hasAppeared)
    }

    private var intentRail: some View {
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
                        hasGenerated = false
                        errorMessage = nil
                        BeeveHaptics.selection()
                    }
                }
            }
            .padding(.vertical, 2)
        }
        .beeveReveal(hasAppeared, delay: 0.04)
    }

    private var starterSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            BeeveSectionHeader(
                title: "当前模式",
                subtitle: selectedIntent.subtitle
            )

            VStack(alignment: .leading, spacing: 12) {
                AssistantStarterRow(
                    systemImage: "target",
                    title: "先定主线",
                    subtitle: "把今天压成一件能开始的事。"
                )
                Divider().padding(.leading, 44)
                AssistantStarterRow(
                    systemImage: "text.badge.checkmark",
                    title: "再写入线索",
                    subtitle: "推进、打断、明天分别只留一句。"
                )
            }
            .padding(16)
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous))
        }
        .beeveReveal(hasAppeared, delay: 0.08)
    }

    private var replySection: some View {
        VStack(alignment: .leading, spacing: 14) {
            VStack(alignment: .leading, spacing: 6) {
                Text(reply.headline)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(BeeveDesign.primaryText)
                Text(reply.message)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if let errorMessage {
                Label(errorMessage, systemImage: "exclamationmark.triangle")
                    .font(.footnote)
                    .foregroundStyle(Color(.systemOrange))
                    .padding(.vertical, 4)
            }

            VStack(spacing: 0) {
                AssistantActionRow(
                    title: "今日主线",
                    value: reply.focus,
                    systemImage: "target",
                    tint: BeeveDesign.accentDeep,
                    actionTitle: "设定"
                ) {
                    applyFocus()
                }

                Divider().padding(.leading, 58)

                AssistantActionRow(
                    title: "推进",
                    value: reply.done,
                    systemImage: "checkmark.circle",
                    tint: Color(.systemGreen),
                    actionTitle: "记录"
                ) {
                    addEntry(kind: .done, text: reply.done)
                }

                Divider().padding(.leading, 58)

                AssistantActionRow(
                    title: "打断",
                    value: reply.interrupted,
                    systemImage: "arrow.triangle.branch",
                    tint: Color(.systemOrange),
                    actionTitle: "记录"
                ) {
                    addEntry(kind: .interrupted, text: reply.interrupted)
                }

                Divider().padding(.leading, 58)

                AssistantActionRow(
                    title: "明天",
                    value: reply.tomorrow,
                    systemImage: "arrow.right.circle",
                    tint: BeeveDesign.warmAccent,
                    actionTitle: "记录"
                ) {
                    addEntry(kind: .tomorrow, text: reply.tomorrow)
                }
            }
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
                    .allowsHitTesting(false)
            }
        }
        .beeveReveal(hasAppeared, delay: 0.08)
        .animation(.easeOut(duration: 0.2), value: reply)
    }

    @ViewBuilder
    private var bottomBar: some View {
        if hasGenerated {
            generatedActionBar
        } else {
            composerBar
        }
    }

    private var composerBar: some View {
        VStack(spacing: 10) {
            if !reply.quickPrompts.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(reply.quickPrompts.prefix(3)), id: \.self) { prompt in
                            Button {
                                draft = draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                                    ? prompt
                                    : "\(draft)\n\(prompt)"
                                errorMessage = nil
                                BeeveHaptics.selection()
                            } label: {
                                Text(prompt)
                                    .font(.footnote.weight(.medium))
                                    .foregroundStyle(BeeveDesign.primaryText)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(BeeveDesign.elevatedSurface)
                                    .clipShape(Capsule())
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, BeeveDesign.contentPadding)
                }
            }

            HStack(alignment: .bottom, spacing: 10) {
                Button {
                    selectedIntent = .importText
                    isImporting = true
                    BeeveHaptics.lightImpact()
                } label: {
                    Image(systemName: "doc.text")
                        .accessibilityLabel("导入文本")
                }
                .buttonStyle(BeeveIconButtonStyle())

                TextField("今天想推进什么？", text: $draft, axis: .vertical)
                    .lineLimit(1...4)
                    .textInputAutocapitalization(.sentences)
                    .focused($isDraftFocused)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    .background(BeeveDesign.elevatedSurface)
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .stroke(BeeveDesign.border, lineWidth: 1)
                            .allowsHitTesting(false)
                    }
                    .onChange(of: draft) { _, _ in
                        errorMessage = nil
                    }

                Button {
                    BeeveHaptics.lightImpact()
                    runAssistant()
                } label: {
                    if isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "arrow.up")
                            .font(.body.weight(.bold))
                            .accessibilityLabel("生成建议")
                    }
                }
                .buttonStyle(AssistantSendButtonStyle())
                .disabled(!canGenerate)
                .opacity(canGenerate ? 1 : 0.45)
            }
            .padding(.horizontal, BeeveDesign.contentPadding)
        }
        .padding(.top, 10)
        .padding(.bottom, 10)
        .background(.regularMaterial)
    }

    private var generatedActionBar: some View {
        HStack(spacing: 12) {
            Button {
                hasGenerated = false
                isDraftFocused = true
                BeeveHaptics.selection()
            } label: {
                Text("继续调整")
                    .font(.body.weight(.medium))
                    .frame(maxWidth: .infinity, minHeight: 50)
            }
            .buttonStyle(.plain)
            .foregroundStyle(BeeveDesign.accentDeep)
            .background(BeeveDesign.elevatedSurface)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

            Button {
                applyAll()
            } label: {
                Label("写入今日", systemImage: "tray.and.arrow.down")
                    .font(.body.weight(.semibold))
                    .frame(maxWidth: .infinity, minHeight: 50)
            }
            .buttonStyle(.plain)
            .foregroundStyle(.white)
            .background(BeeveDesign.accent)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .padding(.horizontal, BeeveDesign.contentPadding)
        .padding(.top, 10)
        .padding(.bottom, 10)
        .background(.regularMaterial)
    }

    private func runAssistant() {
        let snapshot = AssistantContextSnapshot(context: dayContext)
        let localReply = AssistantSuggestionEngine.makeReply(intent: selectedIntent, userText: draft, snapshot: snapshot)
        withAnimation(.easeOut(duration: 0.18)) {
            reply = localReply
            errorMessage = nil
            hasGenerated = true
        }

        guard let client = BeeveAssistantClient() else { return }

        isLoading = true
        let intent = selectedIntent
        let text = draft
        Task {
            do {
                let remoteReply = try await client.assistantReply(
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
                    errorMessage = "暂时无法获取在线建议，先用基础建议。"
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
            hasGenerated = false
            BeeveHaptics.success()
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
            HStack(spacing: 6) {
                Image(systemName: intent.systemImage)
                    .font(.footnote.weight(.semibold))
                Text(intent.title)
                    .font(.footnote.weight(.semibold))
                    .lineLimit(1)
            }
            .foregroundStyle(isSelected ? .white : BeeveDesign.primaryText)
            .padding(.horizontal, 12)
            .padding(.vertical, 9)
            .background(isSelected ? BeeveDesign.accent : BeeveDesign.elevatedSurface)
            .clipShape(Capsule())
            .overlay {
                Capsule()
                    .stroke(BeeveDesign.border, lineWidth: 1)
                    .allowsHitTesting(false)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel(intent.title)
        .accessibilityHint(intent.subtitle)
    }
}

private struct AssistantStarterRow: View {
    let systemImage: String
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 12) {
            BeeveIconBubble(systemImage: systemImage)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.body.weight(.medium))
                    .foregroundStyle(BeeveDesign.primaryText)
                Text(subtitle)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
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
            BeeveIconBubble(systemImage: systemImage, tint: tint)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(BeeveDesign.primaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 8)

            Button(actionTitle, action: action)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(tint)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(tint.opacity(0.12))
                .clipShape(Capsule())
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 13)
        .contentShape(Rectangle())
    }
}

private struct AssistantSendButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundStyle(.white)
            .frame(width: 46, height: 46)
            .background(configuration.isPressed ? BeeveDesign.accentDeep : BeeveDesign.accent)
            .clipShape(Circle())
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
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
