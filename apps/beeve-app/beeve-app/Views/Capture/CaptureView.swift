import SwiftUI

struct CaptureView: View {
    @Environment(BeeveStore.self) private var store
    @State private var destination: SecondaryDestination?
    @State private var showAssistant = false

    let onSwitchTab: (AppTab) -> Void

    var body: some View {
        NavigationStack {
            List {
                Section {
                    header
                        .padding(.top, AppSpacing.pageTop)
                        .padding(.bottom, AppSpacing.section)
                }
                .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 0, trailing: 16))
                .listRowBackground(Color.clear)
                .listRowSeparator(.hidden)

                if store.pendingFlashNotes.isEmpty {
                    Section {
                        emptyState
                            .padding(.bottom, 24)
                    }
                    .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 0, trailing: 16))
                    .listRowBackground(Color.clear)
                    .listRowSeparator(.hidden)
                } else {
                    Section("待理解") {
                        ForEach(store.pendingFlashNotes) { flashNote in
                            PendingCaptureCard(
                                flashNote: flashNote,
                                onApply: { withAnimation(.snappy) { store.applySuggestedAction(for: flashNote) } },
                                onReminder: { withAnimation(.snappy) { store.convertFlashNoteToReminder(flashNote) } },
                                onNote: { withAnimation(.snappy) { store.convertFlashNoteToNote(flashNote) } },
                                onIdea: { withAnimation(.snappy) { store.keepFlashNoteAsIdea(flashNote) } },
                                onSchedule: { withAnimation(.snappy) { store.scheduleFlashNoteToday(flashNote) } },
                                onDelete: { withAnimation(.snappy) { store.deleteFlashNote(flashNote) } }
                            )
                            .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                        }
                    }
                }

                if !store.processedFlashNotes.isEmpty {
                    Section("已处理") {
                        ForEach(store.processedFlashNotes.prefix(8)) { flashNote in
                            FlashNoteRow(
                                flashNote: flashNote,
                                onArchive: { withAnimation(.snappy) { store.archiveFlashNote(flashNote) } },
                                onDelete: { withAnimation(.snappy) { store.deleteFlashNote(flashNote) } }
                            )
                            .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                        }
                    }
                }
            }
            .listStyle(.plain)
            .scrollIndicators(.hidden)
            .scrollContentBackground(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("Capture")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    if store.captureBacklogCount > 0 {
                        Button("回 Today") { onSwitchTab(.today) }
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton { showAssistant = true }
                }
            }
            .navigationDestination(item: $destination) { item in
                destinationView(for: item)
            }
            .sheet(isPresented: $showAssistant) {
                AssistantSheet { action in
                    handleAssistantAction(action)
                }
                .presentationDetents([.large])
            }
            .safeAreaInset(edge: .bottom) {
                FlashNoteInputBar(icon: "square.and.pencil", placeholder: "记录一句想法、任务或灵感…")
            }
        }
    }

    private var header: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 10) {
                SurfaceKicker(title: "Capture", symbol: "square.and.pencil", tint: AppTheme.capture)
                Text("先记下来，再决定它是提醒、笔记、想法还是今天的安排。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 16)

            VStack(alignment: .trailing, spacing: 8) {
                countBadge(title: "待理解", value: store.pendingFlashNotes.count, tint: AppTheme.capture)
                countBadge(title: "已处理", value: store.processedFlashNotes.count, tint: AppTheme.success)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            CircleIconBadge(symbol: "square.and.pencil", tint: AppTheme.capture, size: 56, iconSize: 22)
            Text("Capture 现在是空的")
                .font(.headline)
            Text("从底部输入条开始记录。Beeve 会先给出理解建议，再帮你落到任务或笔记。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("看看 Today") {
                onSwitchTab(.today)
            }
            .buttonStyle(.bordered)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 42)
        .padding(.horizontal, 20)
        .appCard(tint: AppTheme.capture, cornerRadius: 24)
    }

    private func countBadge(title: String, value: Int, tint: Color) -> some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text("\(value)")
                .font(.headline.bold())
                .contentTransition(.numericText())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .glassCapsule(tint: tint)
    }

    private func handleAssistantAction(_ action: AssistantActionSuggestion) {
        if action.kind == .capture {
            return
        }
        if let prompt = action.prompt {
            store.sendMessage(prompt)
        }
        if let destination = action.destination {
            self.destination = destination
        }
    }

    @ViewBuilder
    private func destinationView(for item: SecondaryDestination) -> some View {
        switch item {
        case .reminders:
            RemindersView()
        case .planner:
            DailyPlannerView()
        case .focus:
            FocusTimerView()
        case .notes:
            NotesView()
        case .habits:
            HabitsView()
        }
    }
}

private struct PendingCaptureCard: View {
    let flashNote: FlashNote
    let onApply: () -> Void
    let onReminder: () -> Void
    let onNote: () -> Void
    let onIdea: () -> Void
    let onSchedule: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                CircleIconBadge(symbol: flashNote.suggestedAction?.systemImage ?? "sparkles", tint: AppTheme.capture, size: 40, iconSize: 15)

                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        suggestionBadge
                        confidenceBadge
                    }

                    Text(flashNote.preview)
                        .font(.headline)
                        .multilineTextAlignment(.leading)

                    if let suggestion = flashNote.aiSuggestion, !suggestion.isEmpty {
                        Text("AI 建议：\(suggestion)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    Button {
                        onApply()
                    } label: {
                        Label("一键接受", systemImage: "checkmark.circle.fill")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(AppTheme.capture)

                    captureActionButton("提醒", systemImage: "checklist", action: onReminder)
                    captureActionButton("笔记", systemImage: "note.text", action: onNote)
                    captureActionButton("想法", systemImage: "lightbulb", action: onIdea)
                    captureActionButton("安排今天", systemImage: "calendar.badge.clock", action: onSchedule)
                }
            }
        }
        .padding(18)
        .appCard(tint: AppTheme.capture, cornerRadius: 24)
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button("删除", role: .destructive, action: onDelete)
        }
    }

    private var suggestionBadge: some View {
        Text(flashNote.suggestedAction?.label ?? "待理解")
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .glassCapsule(tint: AppTheme.capture)
    }

    private var confidenceBadge: some View {
        let confidence = Int((flashNote.aiConfidence ?? 0.6) * 100)
        return Text("\(confidence)%")
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .glassCapsule(tint: AppTheme.brand)
    }

    private func captureActionButton(_ title: String, systemImage: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
        }
        .buttonStyle(.bordered)
    }
}

#Preview {
    BeevePreview {
        CaptureView { _ in }
    }
}
