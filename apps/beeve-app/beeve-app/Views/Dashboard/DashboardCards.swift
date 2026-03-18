import SwiftUI

// MARK: - Day Pulse Strip

struct DayPulseStrip: View {
    let overdueCount: Int
    let inboxCount: Int
    let todayCount: Int
    let upcomingCount: Int
    let completedCount: Int
    let onOpenReminders: () -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                PulseChip(title: "逾期", value: overdueCount, tint: .red, action: onOpenReminders)
                PulseChip(title: "收件箱", value: inboxCount, tint: .purple, action: onOpenReminders)
                PulseChip(title: "今天", value: todayCount, tint: .blue, action: onOpenReminders)
                PulseChip(title: "接下来", value: upcomingCount, tint: .orange, action: onOpenReminders)
                PulseChip(title: "完成", value: completedCount, tint: .green, action: onOpenReminders)
            }
            .padding(.vertical, 2)
        }
    }
}

// MARK: - Pulse Chip

struct PulseChip: View {
    let title: String
    let value: Int
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Circle()
                    .fill(tint)
                    .frame(width: 8, height: 8)
                    .scaleEffect(value > 0 ? 1 : 0.72)
                    .shadow(color: tint.opacity(value > 0 ? 0.3 : 0), radius: value > 0 ? 8 : 0)

                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)

                Text("\(value)")
                    .font(.subheadline.bold())
                    .contentTransition(.numericText())
                    .foregroundStyle(.primary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 9)
            .glassCapsule(tint: .secondary)
        }
        .buttonStyle(.plain)
        .buttonStyle(PressableScaleButtonStyle())
    }
}

// MARK: - Triage Card

struct TriageCard: View {
    let summary: String
    let inboxCount: Int
    let todayCount: Int

    var body: some View {
        GlassSection(title: "今日整理", symbol: "tray", tint: .purple) {
            VStack(alignment: .leading, spacing: 12) {
                Text(summary)
                    .font(.body)

                HStack(spacing: 12) {
                    TriageBadge(title: "收件箱", value: "\(inboxCount)")
                    TriageBadge(title: "今天", value: "\(todayCount)")
                }
            }
        }
    }
}

struct TriageBadge: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.headline)
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard(tint: .purple, cornerRadius: 18)
    }
}

// MARK: - Next Reminder Card

struct NextReminderCard: View {
    let reminder: Reminder
    let onOpenReminders: () -> Void

    var body: some View {
        GlassSection(title: "下一件重要的事", symbol: "flag.fill", tint: .orange) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text(reminder.title)
                        .font(.title3.bold())
                    Spacer()
                    PriorityPill(priority: reminder.priority)
                }

                Text("\(reminder.category.label) · \(reminder.dueDate?.formatted(date: .omitted, time: .shortened) ?? "待分拣")")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Button("查看今天进行中", action: onOpenReminders)
                    .buttonStyle(.bordered)
            }
        }
    }
}

// MARK: - Rhythm Board Card

struct RhythmBoardCard: View {
    let overdueCount: Int
    let todayCount: Int
    let upcomingCount: Int
    let nextReminderTitle: String?
    let onOpenReminders: () -> Void
    let onOpenAssistant: () -> Void

    var body: some View {
        GlassSection(title: "今日节奏", symbol: "waveform.path.ecg", tint: .indigo) {
            VStack(spacing: 0) {
                RhythmRow(
                    title: "现在",
                    subtitle: overdueCount > 0 ? "先处理 \(overdueCount) 个逾期事项" : (nextReminderTitle ?? "从当前最重要的一项开始"),
                    accent: .red,
                    action: onOpenReminders
                )
                SectionDivider()
                RhythmRow(
                    title: "接下来",
                    subtitle: todayCount > 0 ? "今天还排了 \(todayCount) 项，适合继续推进" : "留一个 25 分钟专注块，推进最关键的一件事",
                    accent: .blue,
                    action: onOpenAssistant
                )
                SectionDivider()
                RhythmRow(
                    title: "稍后",
                    subtitle: upcomingCount > 0 ? "后面还有 \(upcomingCount) 项可排进今天尾段" : "完成后给自己留 5 分钟整理和收尾",
                    accent: .green,
                    action: onOpenAssistant
                )
            }
        }
    }
}

struct RhythmRow: View {
    let title: String
    let subtitle: String
    let accent: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title.uppercased())
                        .font(.caption.weight(.bold))
                        .foregroundStyle(accent)
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.primary)
                        .multilineTextAlignment(.leading)
                }

                Spacer()

                Image(systemName: "arrow.up.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.tertiary)
            }
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Agenda Timeline Card

struct AgendaTimelineCard: View {
    @Environment(BeeveStore.self) private var store

    let reminders: [Reminder]
    let onOpenReminders: () -> Void

    var body: some View {
        GlassSection(title: "今日时间线", symbol: "timeline.selection", tint: .teal) {
            VStack(spacing: 0) {
                ForEach(Array(reminders.enumerated()), id: \.element.id) { index, reminder in
                    Button(action: onOpenReminders) {
                        HStack(alignment: .top, spacing: 12) {
                            VStack(spacing: 0) {
                                Circle()
                                    .fill(reminder.priority.color)
                                    .frame(width: 10, height: 10)

                                if index < reminders.count - 1 {
                                    Rectangle()
                                        .fill(reminder.priority.color.opacity(0.20))
                                        .frame(width: 2, height: 44)
                                }
                            }

                            VStack(alignment: .leading, spacing: 5) {
                                Text(store.scheduleText(for: reminder))
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(reminder.priority.color)

                                Text(reminder.title)
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundStyle(.primary)
                                    .multilineTextAlignment(.leading)

                                if !reminder.note.isEmpty {
                                    Text(reminder.note)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .lineLimit(2)
                                }
                            }

                            Spacer()
                        }
                        .padding(.vertical, 8)
                    }
                    .buttonStyle(PressableScaleButtonStyle())
                }
            }
        }
    }
}

// MARK: - Completion Suggestion Card

struct CompletionSuggestionCard: View {
    let suggestion: CompletionSuggestion
    let onTapDestination: (FollowUpDestination) -> Void
    let onDismiss: () -> Void

    var body: some View {
        GlassSection(title: suggestion.title, symbol: "checkmark.circle", tint: .green) {
            VStack(alignment: .leading, spacing: 12) {
                Text(suggestion.detail)
                    .font(.body)
                    .foregroundStyle(.secondary)

                VStack(alignment: .leading, spacing: 10) {
                    Button(suggestion.primaryLabel) {
                        onTapDestination(suggestion.primaryDestination)
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity, alignment: .leading)

                    if let label = suggestion.secondaryLabel, let destination = suggestion.secondaryDestination {
                        Button(label) {
                            onTapDestination(destination)
                        }
                        .buttonStyle(.bordered)
                    }

                    Button("关闭", action: onDismiss)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}

// MARK: - Reminder Preview Row

struct ReminderPreviewRow: View {
    @Environment(BeeveStore.self) private var store

    let reminder: Reminder
    let onToggle: () -> Void

    var body: some View {
        Button(action: onToggle) {
            HStack(spacing: 14) {
                Image(systemName: reminder.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(reminder.isCompleted ? Color.green : Color.secondary)

                VStack(alignment: .leading, spacing: 4) {
                    Text(reminder.title)
                        .font(.headline)
                        .strikethrough(reminder.isCompleted)
                        .foregroundStyle(reminder.isCompleted ? .secondary : .primary)

                    HStack(spacing: 8) {
                        PriorityPill(priority: reminder.priority)
                        Text(store.scheduleText(for: reminder))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
            .padding(16)
            .appCard(tint: reminder.priority.color, cornerRadius: 20)
        }
        .buttonStyle(PressableScaleButtonStyle())
        .contextMenu {
            Button(reminder.isCompleted ? "恢复" : "完成", action: onToggle)
        }
    }
}
