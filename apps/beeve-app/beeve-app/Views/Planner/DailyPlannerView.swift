import SwiftUI

struct DailyPlannerView: View {
    @Environment(BeeveStore.self) private var store
    @State private var selectedDate: Date = .now
    @State private var showAddReminder = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DSSpace.lg) {
                    // Date strip
                    DateStripView(selectedDate: $selectedDate)

                    // Summary card
                    dayOverviewCard

                    // Timeline
                    GlassSection(title: "时间线", symbol: "clock.fill", tint: DSColor.info) {
                        if timelineSlots.isEmpty {
                            VStack(spacing: DSSpace.sm) {
                                Image(systemName: "calendar.badge.plus")
                                    .font(DSType.title)
                                    .foregroundStyle(DSColor.textSecondary)
                                Text("这一天还没有安排")
                                    .font(DSType.body)
                                    .foregroundStyle(DSColor.textSecondary)
                                Button("添加任务") { showAddReminder = true }
                                    .buttonStyle(DSSecondaryButtonStyle(tint: DSColor.info))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, DSSpace.lg)
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
                        GlassSection(title: "未安排", symbol: "tray.full", tint: DSColor.brand) {
                            VStack(spacing: DSSpace.xs) {
                                ForEach(store.inboxReminders.prefix(5)) { reminder in
                                    HStack(spacing: DSSpace.sm) {
                                        Circle()
                                            .fill(reminder.priority.color.opacity(0.3))
                                            .frame(width: DSSpace.xs, height: DSSpace.xs)
                                        Text(reminder.title)
                                            .font(DSType.body)
                                            .fixedSize(horizontal: false, vertical: true)
                                        Spacer()
                                        Button("安排到今天") {
                                            withAnimation(.snappy) {
                                                store.quickTriageToday(reminder)
                                            }
                                        }
                                        .buttonStyle(DSSecondaryButtonStyle(tint: DSColor.focus))
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, DSSpace.md)
                .padding(.top, DSComponent.pageTopInset)
                .padding(.bottom, DSComponent.pageBottomInset)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("日程")
            .toolbar {
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

        return HStack(spacing: DSSpace.md) {
            VStack(alignment: .leading, spacing: DSComponent.textBlockSpacing) {
                Text(dateLabel)
                    .font(DSType.section)
                Text("\(total) 项安排，已完成 \(completed) 项")
                    .font(DSType.body)
                    .foregroundStyle(DSColor.textSecondary)
            }

            Spacer()

            ZStack {
                Circle()
                    .stroke(DSColor.focus.opacity(0.2), lineWidth: 6)
                Circle()
                    .trim(from: 0, to: total > 0 ? Double(completed) / Double(total) : 0)
                    .stroke(DSColor.focus, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Text(total > 0 ? "\(Int(Double(completed) / Double(total) * 100))%" : "0%")
                    .font(DSType.captionBold)
                    .foregroundStyle(DSColor.focus)
            }
            .frame(width: 48, height: 48)
        }
        .padding(DSSpace.md)
        .appCard(tint: DSColor.focus, cornerRadius: DSRadius.card)
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
        HStack(alignment: .top, spacing: DSSpace.sm) {
            Text(slot.timeLabel)
                .font(DSType.captionBold.monospacedDigit())
                .foregroundStyle(DSColor.textSecondary)
                .frame(width: 44, alignment: .trailing)

            Rectangle()
                .fill(DSColor.focus.opacity(0.3))
                .frame(width: 2)

            VStack(alignment: .leading, spacing: DSComponent.textBlockSpacing) {
                ForEach(slot.reminders) { reminder in
                    HStack(alignment: .top, spacing: DSSpace.xs) {
                        Button {
                            onToggle(reminder)
                        } label: {
                            Image(systemName: reminder.isCompleted ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(reminder.isCompleted ? DSColor.success : reminder.priority.color)
                        }
                        .buttonStyle(.plain)

                        Text(reminder.title)
                            .font(DSType.body)
                            .strikethrough(reminder.isCompleted)
                            .foregroundStyle(reminder.isCompleted ? DSColor.textSecondary : DSColor.textPrimary)
                            .fixedSize(horizontal: false, vertical: true)

                        if reminder.isRepeating {
                            Image(systemName: "arrow.trianglehead.2.clockwise")
                                .font(DSType.meta)
                                .foregroundStyle(DSColor.focus)
                        }
                    }
                }
            }
        }
        .padding(.vertical, DSSpace.xs)
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
            HStack(spacing: DSSpace.xs) {
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
            VStack(spacing: DSSpace.xxs) {
                Text(date.formatted(.dateTime.weekday(.abbreviated)))
                    .font(DSType.meta.weight(.medium))
                    .foregroundStyle(isSelected ? DSColor.textPrimary : DSColor.textSecondary)

                Text(date.formatted(.dateTime.day()))
                    .font(DSType.section)
                    .foregroundStyle(isSelected ? DSColor.textPrimary : DSColor.textPrimary)

                if isToday {
                    Circle()
                        .fill(isSelected ? DSColor.textPrimary : DSColor.focus)
                        .frame(width: 5, height: 5)
                }
            }
            .frame(width: 48, height: 64)
            .background(
                RoundedRectangle(cornerRadius: DSRadius.control, style: .continuous)
                    .fill(isSelected ? DSColor.focus : DSColor.surface2.opacity(0))
            )
        }
        .buttonStyle(.plain)
        .sensoryFeedback(.selection, trigger: isSelected)
    }
}
