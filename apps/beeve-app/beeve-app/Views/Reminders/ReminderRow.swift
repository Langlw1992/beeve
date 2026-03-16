import SwiftUI

struct ReminderRow: View {
    let reminder: Reminder
    let scheduleText: String
    let onToggle: () -> Void
    let onTonight: () -> Void
    let onTomorrow: () -> Void
    let onDelete: () -> Void

    @State private var showSubtasks = false
    @State private var newSubtaskTitle = ""
    @Environment(BeeveStore.self) private var store

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            mainRow

            if showSubtasks {
                subtaskSection
            }
        }
        .padding(14)
        .appCard(tint: reminder.priority.color, cornerRadius: 20)
        .contextMenu {
            Button(reminder.isCompleted ? "恢复" : "完成", action: onToggle)

            if !reminder.isCompleted {
                Button("今晚处理", action: onTonight)
                Button("明早处理", action: onTomorrow)
                Button("添加子任务", systemImage: "plus.circle") {
                    showSubtasks = true
                }
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

    private var mainRow: some View {
        HStack(spacing: 12) {
            Button(action: onToggle) {
                Image(systemName: reminder.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(reminder.isCompleted ? Color.green : reminder.priority.color)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 6) {
                    Text(reminder.title)
                        .font(.headline)
                        .strikethrough(reminder.isCompleted)
                        .foregroundStyle(reminder.isCompleted ? .secondary : .primary)

                    if reminder.isRepeating {
                        Image(systemName: "arrow.trianglehead.2.clockwise")
                            .font(.caption2)
                            .foregroundStyle(.indigo)
                    }
                }

                if !reminder.note.isEmpty {
                    Text(reminder.note)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 6) {
                    PriorityPill(priority: reminder.priority)

                    if let summary = reminder.subtaskSummary {
                        Button {
                            withAnimation(.snappy) { showSubtasks.toggle() }
                        } label: {
                            HStack(spacing: 3) {
                                Image(systemName: "checklist")
                                    .font(.caption2)
                                Text(summary)
                                    .font(.caption.weight(.semibold))
                            }
                            .foregroundStyle(.indigo)
                        }
                        .buttonStyle(.plain)
                    }

                    // Tag pills
                    ForEach(reminder.tags ?? [], id: \.id) { tag in
                        Text(tag.name)
                            .font(.caption2.weight(.medium))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(tag.color.opacity(0.2), in: Capsule())
                            .foregroundStyle(tag.color)
                    }

                    Text(scheduleText)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }
        }
    }

    private var subtaskSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Divider().padding(.vertical, 8)

            ForEach(reminder.subtasks) { sub in
                HStack(spacing: 10) {
                    Button {
                        withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                            store.toggleSubtask(sub)
                        }
                    } label: {
                        Image(systemName: sub.isCompleted ? "checkmark.circle.fill" : "circle")
                            .font(.subheadline)
                            .foregroundStyle(sub.isCompleted ? .green : .secondary)
                    }
                    .buttonStyle(.plain)

                    Text(sub.title)
                        .font(.subheadline)
                        .strikethrough(sub.isCompleted)
                        .foregroundStyle(sub.isCompleted ? .secondary : .primary)

                    Spacer()

                    Button {
                        withAnimation(.snappy) { store.deleteSubtask(sub) }
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                    .buttonStyle(.plain)
                }
            }

            if !reminder.isCompleted {
                HStack(spacing: 8) {
                    Image(systemName: "plus.circle.dashed")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    TextField("添加子任务", text: $newSubtaskTitle)
                        .font(.subheadline)
                        .onSubmit {
                            guard !newSubtaskTitle.isEmpty else { return }
                            withAnimation(.snappy) {
                                store.addSubtask(to: reminder, title: newSubtaskTitle)
                            }
                            newSubtaskTitle = ""
                        }
                }
            }

            // Progress bar
            if !reminder.subtasks.isEmpty {
                ProgressView(value: reminder.subtaskProgress)
                    .tint(.indigo)
                    .padding(.top, 4)
            }
        }
    }
}
