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
        .padding(DSSpace.md)
        .appCard(tint: reminder.priority.color, cornerRadius: DSRadius.card)
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
                .tint(reminder.isCompleted ? DSColor.warning : DSColor.success)
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button("删除", role: .destructive, action: onDelete)

            if !reminder.isCompleted {
                Button("明早", action: onTomorrow)
                    .tint(DSColor.info)
                Button("今晚", action: onTonight)
                    .tint(DSColor.focus)
            }
        }
    }

    private var mainRow: some View {
        HStack(spacing: DSSpace.sm) {
            Button(action: onToggle) {
                Image(systemName: reminder.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(DSType.section)
                    .foregroundStyle(reminder.isCompleted ? DSColor.success : reminder.priority.color)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: DSComponent.textBlockSpacing) {
                HStack(alignment: .top, spacing: DSComponent.textBlockSpacing) {
                    Text(reminder.title)
                        .font(DSType.bodyMedium)
                        .strikethrough(reminder.isCompleted)
                        .foregroundStyle(reminder.isCompleted ? DSColor.textSecondary : DSColor.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)

                    if reminder.isRepeating {
                        Image(systemName: "arrow.trianglehead.2.clockwise")
                            .font(DSType.meta)
                            .foregroundStyle(DSColor.focus)
                    }
                }

                if !reminder.note.isEmpty {
                    Text(reminder.note)
                        .font(DSType.body)
                        .foregroundStyle(DSColor.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                HStack(alignment: .top, spacing: DSComponent.textBlockSpacing) {
                    PriorityPill(priority: reminder.priority)

                    if let summary = reminder.subtaskSummary {
                        Button {
                            withAnimation(.snappy) { showSubtasks.toggle() }
                        } label: {
                            HStack(spacing: DSSpace.xxs) {
                                Image(systemName: "checklist")
                                    .font(DSType.meta)
                                Text(summary)
                                    .font(DSType.captionBold)
                            }
                            .foregroundStyle(DSColor.focus)
                        }
                        .buttonStyle(.plain)
                    }

                    // Tag pills
                    ForEach(reminder.tags ?? [], id: \.id) { tag in
                        Text(tag.name)
                            .font(DSType.meta.weight(.medium))
                            .padding(.horizontal, DSSpace.xs)
                            .padding(.vertical, DSSpace.xxs)
                            .background(tag.color.opacity(0.2), in: Capsule())
                            .foregroundStyle(tag.color)
                    }

                    Text(scheduleText)
                        .font(DSType.caption)
                        .foregroundStyle(DSColor.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }

    private var subtaskSection: some View {
        VStack(alignment: .leading, spacing: DSSpace.xs) {
            Divider().padding(.vertical, DSSpace.xs)

            ForEach(reminder.subtasks) { sub in
                HStack(spacing: DSSpace.sm) {
                    Button {
                        withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                            store.toggleSubtask(sub)
                        }
                    } label: {
                        Image(systemName: sub.isCompleted ? "checkmark.circle.fill" : "circle")
                            .font(DSType.bodyMedium)
                            .foregroundStyle(sub.isCompleted ? DSColor.success : DSColor.textSecondary)
                    }
                    .buttonStyle(.plain)

                    Text(sub.title)
                        .font(DSType.body)
                        .strikethrough(sub.isCompleted)
                        .foregroundStyle(sub.isCompleted ? DSColor.textSecondary : DSColor.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)

                    Spacer()

                    Button {
                        withAnimation(.snappy) { store.deleteSubtask(sub) }
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(DSType.caption)
                            .foregroundStyle(DSColor.textTertiary)
                    }
                    .buttonStyle(.plain)
                }
            }

            if !reminder.isCompleted {
                HStack(spacing: DSSpace.xs) {
                    Image(systemName: "plus.circle.dashed")
                        .font(DSType.bodyMedium)
                        .foregroundStyle(DSColor.textSecondary)
                    TextField("添加子任务", text: $newSubtaskTitle)
                        .font(DSType.body)
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
                    .tint(DSColor.focus)
                    .padding(.top, DSSpace.xxs)
            }
        }
    }
}
