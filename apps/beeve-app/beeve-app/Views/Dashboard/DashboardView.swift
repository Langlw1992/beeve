import SwiftUI

struct DashboardView: View {
    @Environment(BeeveStore.self) private var store
    @State private var isTodayExpanded = true

    let onAddReminder: () -> Void
    let onOpenFlashNotes: () -> Void

    var body: some View {
        NavigationStack {
            ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: AppSpacing.section) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(store.greetingTitle)
                                .font(.largeTitle.bold())
                            Text(store.formattedToday)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }

                        HeroOverviewCard(
                            focusScore: store.focusScore,
                            completedCount: store.completedCount,
                            pendingCount: store.pendingCount,
                            inboxCount: store.inboxReminders.count,
                            homeSuggestion: store.homeSuggestion
                        )

                        if let nextReminder = store.nextImportantReminder {
                            NextReminderCard(reminder: nextReminder) {
                                withAnimation(.snappy) {
                                    isTodayExpanded = true
                                    proxy.scrollTo(todaySectionID, anchor: .top)
                                }
                            }
                        }

                        if !store.pendingPreviewReminders.isEmpty {
                            ExpandableSectionCard(
                                title: "今天进行中",
                                symbol: "bolt.badge.clock",
                                tint: .blue,
                                isExpanded: $isTodayExpanded
                            ) {
                                VStack(spacing: 12) {
                                    ForEach(store.pendingPreviewReminders) { reminder in
                                        ReminderPreviewRow(reminder: reminder) {
                                            withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                                                store.toggleReminder(reminder)
                                            }
                                        }
                                    }
                                }
                            }
                            .id(todaySectionID)
                        }

                        GlassSection(title: "最近闪念", symbol: "bolt.fill", tint: .purple) {
                            VStack(spacing: 12) {
                                if recentFlashNotes.isEmpty {
                                    VStack(alignment: .leading, spacing: 10) {
                                        Text("还没有闪念")
                                            .font(.headline)
                                        Text("记录页可随手记录，先收集再整理。")
                                            .font(.subheadline)
                                            .foregroundStyle(.secondary)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                } else {
                                    ForEach(recentFlashNotes) { flashNote in
                                        DashboardFlashNotePreview(flashNote: flashNote)
                                    }
                                }

                                ActionChip(title: "查看全部", systemImage: "arrow.right", tint: .purple, action: onOpenFlashNotes)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.top, AppSpacing.pageTop)
                    .padding(.bottom, AppSpacing.pageBottom)
                }
                .scrollIndicators(.hidden)
                .background(AppBackgroundView())
                .navigationTitle("Beeve")
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("新增", systemImage: "plus", action: onAddReminder)
                    }
                }
                .sensoryFeedback(.success, trigger: store.completedCount)
                .sensoryFeedback(.impact(weight: .light), trigger: store.pendingCount)
            }
        }
    }

    private var todaySectionID: String {
        "dashboard-today-section"
    }

    private var recentFlashNotes: [FlashNote] {
        Array(store.recentFlashNotes.prefix(3))
    }
}

private struct DashboardFlashNotePreview: View {
    let flashNote: FlashNote

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            CircleIconBadge(symbol: flashNote.category.symbol, tint: flashNote.category.tint, size: 36, iconSize: 14)

            VStack(alignment: .leading, spacing: 6) {
                Text(flashNote.preview)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.leading)
                    .lineLimit(2)

                HStack(spacing: 8) {
                    Text(flashNote.status.label)
                        .font(.caption.weight(.semibold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .foregroundStyle(.secondary)
                        .background(Color(.tertiarySystemFill), in: Capsule())

                    Text(flashNote.createdAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer(minLength: 0)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard(cornerRadius: 20)
    }
}
