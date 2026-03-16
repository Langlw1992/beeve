import SwiftUI

struct DailyPlannerView: View {
    @Environment(BeeveStore.self) private var store
    @State private var selectedDate: Date = .now
    @State private var showAddReminder = false

    let onOpenAssistant: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    // Date strip
                    DateStripView(selectedDate: $selectedDate)

                    // Summary card
                    dayOverviewCard

                    // Timeline
                    GlassSection(title: "时间线", symbol: "clock.fill", tint: .blue) {
                        if timelineSlots.isEmpty {
                            VStack(spacing: 12) {
                                Image(systemName: "calendar.badge.plus")
                                    .font(.largeTitle)
                                    .foregroundStyle(.secondary)
                                Text("这一天还没有安排")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                Button("添加事项") { showAddReminder = true }
                                    .buttonStyle(.bordered)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 24)
                        } else {
                            VStack(spacing: 0) {
                                ForEach(timelineSlots, id: \.hour) { slot in
                                    TimelineSlotRow(slot: slot) { reminder in
                                        withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                                            store.toggleReminder(reminder)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Unscheduled inbox items
                    if !store.inboxReminders.isEmpty {
                        GlassSection(title: "未安排", symbol: "tray.full", tint: .purple) {
                            VStack(spacing: 8) {
                                ForEach(store.inboxReminders.prefix(5)) { reminder in
                                    HStack(spacing: 10) {
                                        Circle()
                                            .fill(reminder.priority.color.opacity(0.3))
                                            .frame(width: 8, height: 8)
                                        Text(reminder.title)
                                            .font(.subheadline)
                                            .lineLimit(1)
                                        Spacer()
                                        Button("安排到今天") {
                                            withAnimation(.snappy) {
                                                store.quickTriageToday(reminder)
                                            }
                                        }
                                        .font(.caption)
                                        .buttonStyle(.bordered)
                                        .tint(.indigo)
                                    }
                                }
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
            .navigationTitle("每日规划")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton(action: onOpenAssistant)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("新增", systemImage: "plus") { showAddReminder = true }
                }
            }
            .sheet(isPresented: $showAddReminder) {
                AddReminderSheet()
                    .presentationDetents([.medium, .large])
            }
        }
    }

    // MARK: - Overview Card

    private var dayOverviewCard: some View {
        let reminders = remindersForDate(selectedDate)
        let completed = reminders.filter(\.isCompleted).count
        let total = reminders.count

        return HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text(dateLabel)
                    .font(.title3.bold())
                Text("\(total) 项安排，已完成 \(completed) 项")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            ZStack {
                Circle()
                    .stroke(Color.indigo.opacity(0.2), lineWidth: 6)
                Circle()
                    .trim(from: 0, to: total > 0 ? Double(completed) / Double(total) : 0)
                    .stroke(Color.indigo, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Text(total > 0 ? "\(Int(Double(completed) / Double(total) * 100))%" : "0%")
                    .font(.caption2.bold())
                    .foregroundStyle(.indigo)
            }
            .frame(width: 48, height: 48)
        }
        .padding(16)
        .appCard(tint: .indigo, cornerRadius: 20)
    }

    // MARK: - Timeline

    private var timelineSlots: [TimelineSlot] {
        let reminders = remindersForDate(selectedDate)
        var slots: [Int: [Reminder]] = [:]
        for r in reminders {
            let hour = Calendar.current.component(.hour, from: r.dueDate ?? .now)
            slots[hour, default: []].append(r)
        }
        return slots.keys.sorted().map { TimelineSlot(hour: $0, reminders: slots[$0]!) }
    }

    private func remindersForDate(_ date: Date) -> [Reminder] {
        store.allReminders.filter { reminder in
            guard let due = reminder.dueDate else { return false }
            return Calendar.current.isDate(due, inSameDayAs: date)
        }
    }

    private var dateLabel: String {
        if Calendar.current.isDateInToday(selectedDate) {
            return "今天"
        } else if Calendar.current.isDateInTomorrow(selectedDate) {
            return "明天"
        } else if Calendar.current.isDateInYesterday(selectedDate) {
            return "昨天"
        }
        return selectedDate.formatted(.dateTime.month().day().weekday(.wide))
    }
}

// MARK: - Supporting Types

struct TimelineSlot {
    let hour: Int
    let reminders: [Reminder]

    var timeLabel: String {
        String(format: "%02d:00", hour)
    }
}

struct TimelineSlotRow: View {
    let slot: TimelineSlot
    let onToggle: (Reminder) -> Void

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(slot.timeLabel)
                .font(.caption.monospacedDigit().weight(.semibold))
                .foregroundStyle(.secondary)
                .frame(width: 44, alignment: .trailing)

            Rectangle()
                .fill(Color.indigo.opacity(0.3))
                .frame(width: 2)

            VStack(alignment: .leading, spacing: 6) {
                ForEach(slot.reminders) { reminder in
                    HStack(spacing: 8) {
                        Button {
                            onToggle(reminder)
                        } label: {
                            Image(systemName: reminder.isCompleted ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(reminder.isCompleted ? .green : reminder.priority.color)
                        }
                        .buttonStyle(.plain)

                        Text(reminder.title)
                            .font(.subheadline)
                            .strikethrough(reminder.isCompleted)
                            .foregroundStyle(reminder.isCompleted ? .secondary : .primary)

                        if reminder.isRepeating {
                            Image(systemName: "arrow.trianglehead.2.clockwise")
                                .font(.caption2)
                                .foregroundStyle(.indigo)
                        }
                    }
                }
            }
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Date Strip

struct DateStripView: View {
    @Binding var selectedDate: Date

    private let calendar = Calendar.current
    private var dates: [Date] {
        (-3...3).compactMap { offset in
            calendar.date(byAdding: .day, value: offset, to: .now)
        }
    }

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(dates, id: \.timeIntervalSince1970) { date in
                    DateStripItem(
                        date: date,
                        isSelected: calendar.isDate(date, inSameDayAs: selectedDate),
                        isToday: calendar.isDateInToday(date)
                    ) {
                        withAnimation(.snappy) { selectedDate = date }
                    }
                }
            }
        }
    }
}

struct DateStripItem: View {
    let date: Date
    let isSelected: Bool
    let isToday: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Text(date.formatted(.dateTime.weekday(.abbreviated)))
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(isSelected ? .white : .secondary)

                Text(date.formatted(.dateTime.day()))
                    .font(.title3.bold())
                    .foregroundStyle(isSelected ? .white : .primary)

                if isToday {
                    Circle()
                        .fill(isSelected ? .white : .indigo)
                        .frame(width: 5, height: 5)
                }
            }
            .frame(width: 48, height: 64)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(isSelected ? Color.indigo : Color.clear)
            )
        }
        .buttonStyle(.plain)
        .sensoryFeedback(.selection, trigger: isSelected)
    }
}
