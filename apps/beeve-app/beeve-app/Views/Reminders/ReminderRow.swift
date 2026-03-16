import SwiftUI

struct ReminderRow: View {
    let reminder: Reminder
    let scheduleText: String
    let onToggle: () -> Void
    let onTonight: () -> Void
    let onTomorrow: () -> Void
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button(action: onToggle) {
                Image(systemName: reminder.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(reminder.isCompleted ? Color.green : reminder.priority.color)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 6) {
                Text(reminder.title)
                    .font(.headline)
                    .strikethrough(reminder.isCompleted)
                    .foregroundStyle(reminder.isCompleted ? .secondary : .primary)

                if !reminder.note.isEmpty {
                    Text(reminder.note)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 8) {
                    PriorityPill(priority: reminder.priority)
                    Text(scheduleText)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }
        }
        .padding(14)
        .appCard(tint: reminder.priority.color, cornerRadius: 20)
        .contextMenu {
            Button(reminder.isCompleted ? "恢复" : "完成", action: onToggle)

            if !reminder.isCompleted {
                Button("今晚处理", action: onTonight)
                Button("明早处理", action: onTomorrow)
            }

            Button("删除", role: .destructive, action: onDelete)
        }
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
            Button(reminder.isCompleted ? "恢复" : "完成", action: onToggle)
                .tint(reminder.isCompleted ? .orange : .green)
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button("删除", role: .destructive, action: onDelete)

            if !reminder.isCompleted {
                Button("明早", action: onTomorrow)
                    .tint(.blue)
                Button("今晚", action: onTonight)
                    .tint(.indigo)
            }
        }
    }
}
