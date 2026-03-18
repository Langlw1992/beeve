import SwiftUI

struct FlashNoteListView: View {
    @Environment(BeeveStore.self) private var store

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

                if flashNotes.isEmpty {
                    Section {
                        emptyState
                            .padding(.bottom, AppSpacing.pageBottom)
                    }
                    .listRowInsets(EdgeInsets(top: 0, leading: 16, bottom: 0, trailing: 16))
                    .listRowBackground(Color.clear)
                    .listRowSeparator(.hidden)
                } else {
                    Section {
                        ForEach(flashNotes) { flashNote in
                            FlashNoteRow(
                                flashNote: flashNote,
                                onArchive: {
                                    withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                                        store.archiveFlashNote(flashNote)
                                    }
                                },
                                onDelete: {
                                    withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                                        store.deleteFlashNote(flashNote)
                                    }
                                }
                            )
                            .immersiveScrollMotion()
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
            .navigationTitle("闪念")
            .safeAreaInset(edge: .bottom) {
                FlashNoteInputBar()
            }
        }
    }

    private var flashNotes: [FlashNote] {
        store.allFlashNotes
    }

    private var header: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 8) {
                SurfaceKicker(title: "Flash Note", symbol: "bolt.fill", tint: .purple)
                Text("先记下来，再决定它是提醒、笔记还是灵感。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 12)

            VStack(alignment: .trailing, spacing: 8) {
                countBadge(title: "待处理", value: store.pendingFlashNotes.count, tint: .purple)
                countBadge(title: "全部", value: flashNotes.count, tint: .indigo)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 14) {
            CircleIconBadge(symbol: "sparkles", tint: .purple, size: 52, iconSize: 20)
            Text("还没有闪念")
                .font(.headline)
            Text("用底部输入条记下临时想法，它们会按时间倒序出现在这里。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 36)
        .padding(.horizontal, 18)
        .appCard(tint: .purple, cornerRadius: 24)
    }

    private func countBadge(title: String, value: Int, tint: Color) -> some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text("\(value)")
                .font(.headline.bold())
                .foregroundStyle(.primary)
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .glassCapsule(tint: tint)
    }
}