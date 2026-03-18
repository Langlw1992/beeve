import SwiftUI

struct FlashNoteRow: View {
    let flashNote: FlashNote
    let onArchive: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                CircleIconBadge(symbol: flashNote.category.symbol, tint: flashNote.category.tint, size: 40, iconSize: 16)

                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 8) {
                        statusBadge
                        categoryBadge
                        Spacer(minLength: 0)
                    }

                    Text(flashNote.preview)
                        .font(.headline)
                        .foregroundStyle(.primary)
                        .multilineTextAlignment(.leading)
                        .lineLimit(4)
                }
            }

            HStack(spacing: 8) {
                Image(systemName: "clock")
                    .foregroundStyle(.secondary)
                Text(flashNote.createdAt.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .font(.caption)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard(cornerRadius: 24)
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button("删除", role: .destructive, action: onDelete)
            if flashNote.status != .archived {
                Button("归档", action: onArchive)
                    .tint(.orange)
            }
        }
    }

    private var statusBadge: some View {
        Text(flashNote.status.label)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .foregroundStyle(.secondary)
            .background(Color(.tertiarySystemFill), in: Capsule())
    }

    private var categoryBadge: some View {
        Label(flashNote.category.label, systemImage: flashNote.category.symbol)
            .font(.caption.weight(.medium))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .foregroundStyle(.secondary)
            .background(Color(.tertiarySystemFill), in: Capsule())
    }
}

extension FlashNoteCategory {
    var tint: Color {
        switch self {
        case .auto: .purple
        case .reminder: .orange
        case .note: .blue
        case .idea: .green
        case .schedule: .cyan
        }
    }

    var symbol: String {
        switch self {
        case .auto: "wand.and.stars"
        case .reminder: "bell.fill"
        case .note: "note.text"
        case .idea: "lightbulb.fill"
        case .schedule: "calendar"
        }
    }
}

extension FlashNoteStatus {
    var tint: Color {
        switch self {
        case .pending: .purple
        case .processed: .green
        case .archived: .secondary
        }
    }
}