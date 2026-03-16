import SwiftUI
import SwiftData

struct NotesView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var searchText = ""
    @State private var selectedNote: Note?
    @State private var showEditor = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    HeroMiniBanner(
                        title: "快捷笔记",
                        subtitle: "灵感转瞬即逝，先记下来再说。",
                        symbol: "note.text",
                        tint: .cyan
                    )

                    if filteredNotes.isEmpty {
                        emptyState
                    } else {
                        // Favorites
                        let favorites = filteredNotes.filter(\.isFavorite)
                        if !favorites.isEmpty {
                            GlassSection(title: "收藏", symbol: "star.fill", tint: .yellow) {
                                noteGrid(favorites)
                            }
                        }

                        // Recent
                        let recent = filteredNotes.filter { !$0.isFavorite && !$0.isArchived }
                        if !recent.isEmpty {
                            GlassSection(title: "最近", symbol: "clock", tint: .cyan) {
                                noteGrid(recent)
                            }
                        }

                        // Archived
                        let archived = filteredNotes.filter(\.isArchived)
                        if !archived.isEmpty {
                            GlassSection(title: "归档", symbol: "archivebox", tint: .secondary) {
                                noteGrid(archived)
                            }
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .searchable(text: $searchText, prompt: "搜索笔记")
            .navigationTitle("笔记")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("新增", systemImage: "plus") {
                        let note = Note()
                        modelContext.insert(note)
                        try? modelContext.save()
                        selectedNote = note
                        showEditor = true
                    }
                }
            }
            .sheet(isPresented: $showEditor) {
                if let note = selectedNote {
                    NoteEditorSheet(note: note)
                }
            }
        }
    }

    private var allNotes: [Note] {
        let descriptor = FetchDescriptor<Note>(sortBy: [SortDescriptor(\.updatedAt, order: .reverse)])
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    private var filteredNotes: [Note] {
        if searchText.isEmpty { return allNotes }
        let query = searchText.lowercased()
        return allNotes.filter {
            $0.title.lowercased().contains(query) || $0.content.lowercased().contains(query)
        }
    }

    @ViewBuilder
    private func noteGrid(_ notes: [Note]) -> some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            ForEach(notes) { note in
                NoteCard(note: note) {
                    selectedNote = note
                    showEditor = true
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "note.text")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("还没有笔记")
                .font(.headline)
            Text("点击右上角 + 开始记录。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }
}

// MARK: - Note Card

struct NoteCard: View {
    let note: Note
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(note.displayTitle)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                        .lineLimit(1)
                    Spacer()
                    if note.isFavorite {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundStyle(.yellow)
                    }
                }

                Text(note.preview)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)

                Text(note.updatedAt.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(12)
            .frame(maxWidth: .infinity, minHeight: 100, alignment: .topLeading)
            .appCard(tint: .cyan, cornerRadius: 16)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Note Editor

struct NoteEditorSheet: View {
    @Bindable var note: Note
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackgroundView()

                VStack(spacing: 0) {
                    TextField("标题", text: $note.title)
                        .font(.title2.bold())
                        .padding(.horizontal)
                        .padding(.top)

                    TextEditor(text: $note.content)
                        .font(.body)
                        .scrollContentBackground(.hidden)
                        .padding(.horizontal, 12)
                }
            }
            .navigationTitle("编辑")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("完成") {
                        note.updatedAt = .now
                        try? modelContext.save()
                        dismiss()
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button(note.isFavorite ? "取消收藏" : "收藏", systemImage: note.isFavorite ? "star.slash" : "star") {
                            note.isFavorite.toggle()
                            try? modelContext.save()
                        }
                        Button(note.isArchived ? "取消归档" : "归档", systemImage: note.isArchived ? "tray" : "archivebox") {
                            note.isArchived.toggle()
                            try? modelContext.save()
                        }
                        Button("删除", systemImage: "trash", role: .destructive) {
                            modelContext.delete(note)
                            try? modelContext.save()
                            dismiss()
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
    }
}
