import SwiftUI
import SwiftData

struct HabitsView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var showAddHabit = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DSSpace.lg) {
                    if habits.isEmpty {
                        emptyState
                    } else {
                        // Today overview
                        GlassSection(title: "今日打卡", symbol: "checkmark.seal", tint: DSColor.success) {
                            VStack(spacing: DSSpace.sm) {
                                ForEach(habits) { habit in
                                    HabitCheckRow(habit: habit) {
                                        checkIn(habit)
                                    }
                                }
                            }
                        }

                        // Streaks
                        GlassSection(title: "连续天数", symbol: "flame.fill", tint: DSColor.warning) {
                            HStack(spacing: DSSpace.md) {
                                ForEach(habits) { habit in
                                    VStack(spacing: DSComponent.textBlockSpacing) {
                                        Text("\(habit.currentStreak)")
                                            .font(DSType.numeric)
                                            .foregroundStyle(habit.color)
                                        Text(habit.title)
                                            .font(DSType.meta)
                                            .foregroundStyle(DSColor.textSecondary)
                                            .fixedSize(horizontal: false, vertical: true)
                                    }
                                    .frame(maxWidth: .infinity)
                                }
                            }
                        }

                        // Heatmap-style weekly view
                        GlassSection(title: "最近 7 天", symbol: "calendar", tint: DSColor.focus) {
                            HabitWeekGrid(habits: habits)
                        }
                    }
                }
                .padding(.horizontal, DSSpace.md)
                .padding(.top, DSComponent.pageTopInset)
                .padding(.bottom, DSComponent.pageBottomInset)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("习惯")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("新增", systemImage: "plus") { showAddHabit = true }
                }
            }
            .sheet(isPresented: $showAddHabit) {
                AddHabitSheet()
            }
        }
    }

    private var habits: [Habit] {
        let descriptor = FetchDescriptor<Habit>(sortBy: [SortDescriptor(\.createdAt)])
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    private func checkIn(_ habit: Habit) {
        if let existing = habit.todayLog {
            existing.count += 1
        } else {
            let log = HabitLog()
            log.habit = habit
            modelContext.insert(log)
        }
        try? modelContext.save()
    }

    private var emptyState: some View {
        VStack(spacing: DSSpace.md) {
            Image(systemName: "flame")
                .font(DSType.hero)
                .foregroundStyle(DSColor.textSecondary)
            Text("还没有习惯")
                .font(DSType.section)
            Text("创建你的第一个习惯，每天打卡积累动力。")
                .font(DSType.body)
                .foregroundStyle(DSColor.textSecondary)
            Button("创建习惯") { showAddHabit = true }
                .buttonStyle(DSPrimaryButtonStyle(tint: DSColor.success))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, DSSpace.xl + DSSpace.md)
    }
}

// MARK: - Habit Check Row

struct HabitCheckRow: View {
    let habit: Habit
    let onCheckIn: () -> Void

    var body: some View {
        HStack(spacing: DSSpace.sm) {
            Button {
                withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                    onCheckIn()
                }
            } label: {
                Image(systemName: habit.isCompletedToday ? "checkmark.circle.fill" : "circle")
                    .font(DSType.section)
                    .foregroundStyle(habit.isCompletedToday ? DSColor.success : habit.color)
            }
            .buttonStyle(.plain)
            .sensoryFeedback(.impact(weight: .medium), trigger: habit.isCompletedToday)

            Image(systemName: habit.symbol)
                .foregroundStyle(habit.color)
                .font(DSType.label)

            VStack(alignment: .leading, spacing: DSSpace.xxs) {
                Text(habit.title)
                    .font(DSType.bodyMedium)
                    .fixedSize(horizontal: false, vertical: true)
                Text("\(habit.todayLog?.count ?? 0)/\(habit.targetCount) · \(habit.frequency.label)")
                    .font(DSType.caption)
                    .foregroundStyle(DSColor.textSecondary)
            }

            Spacer()

            if habit.currentStreak > 0 {
                HStack(spacing: DSSpace.xxs) {
                    Image(systemName: "flame.fill")
                        .font(DSType.meta)
                    Text("\(habit.currentStreak)")
                        .font(DSType.captionBold)
                }
                .foregroundStyle(DSColor.warning)
            }
        }
    }
}

// MARK: - Week Grid

struct HabitWeekGrid: View {
    let habits: [Habit]
    private let calendar = Calendar.current

    private var weekDates: [Date] {
        (0..<7).reversed().compactMap { offset in
            calendar.date(byAdding: .day, value: -offset, to: .now)
        }
    }

    var body: some View {
        VStack(spacing: DSSpace.xs) {
            // Header
            HStack(spacing: DSSpace.xxs) {
                Text("")
                    .frame(width: 60)
                ForEach(weekDates, id: \.timeIntervalSince1970) { date in
                    Text(date.formatted(.dateTime.weekday(.narrow)))
                        .font(DSType.meta.weight(.medium))
                        .foregroundStyle(DSColor.textSecondary)
                        .frame(maxWidth: .infinity)
                }
            }

            ForEach(habits) { habit in
                HStack(spacing: DSSpace.xxs) {
                    Text(habit.title)
                        .font(DSType.meta)
                        .foregroundStyle(DSColor.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(width: 60, alignment: .leading)

                    ForEach(weekDates, id: \.timeIntervalSince1970) { date in
                        let done = hasLog(habit: habit, on: date)
                        RoundedRectangle(cornerRadius: DSRadius.control, style: .continuous)
                            .fill(done ? habit.color : habit.color.opacity(0.1))
                            .frame(height: 20)
                            .frame(maxWidth: .infinity)
                    }
                }
            }
        }
    }

    private func hasLog(habit: Habit, on date: Date) -> Bool {
        let dayStart = calendar.startOfDay(for: date)
        return (habit.logs ?? []).contains { calendar.startOfDay(for: $0.date) == dayStart }
    }
}

// MARK: - Add Habit Sheet

struct AddHabitSheet: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var symbol = "checkmark.circle"
    @State private var frequency: HabitFrequency = .daily
    @State private var targetCount = 1

    private let symbols = ["checkmark.circle", "drop.fill", "figure.run", "book.fill", "bed.double.fill", "brain.head.profile.fill", "dumbbell.fill", "cup.and.saucer.fill"]

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackgroundView()

                ScrollView {
                    VStack(spacing: DSSpace.lg) {
                        GlassSection(title: "习惯", symbol: "flame", tint: DSColor.success) {
                            TextField("习惯名称", text: $title)
                                .textFieldStyle(.roundedBorder)
                        }

                        GlassSection(title: "图标", symbol: "star", tint: DSColor.warning) {
                            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: DSSpace.sm) {
                                ForEach(symbols, id: \.self) { sym in
                                    Button {
                                        symbol = sym
                                    } label: {
                                        Image(systemName: sym)
                                            .font(DSType.section)
                                            .frame(width: DSComponent.circleIconLG, height: DSComponent.circleIconLG)
                                            .background(
                                                symbol == sym ? DSColor.success.opacity(0.2) : DSColor.textSecondary.opacity(0.08),
                                                in: RoundedRectangle(cornerRadius: DSRadius.control, style: .continuous)
                                            )
                                            .foregroundStyle(symbol == sym ? DSColor.success : DSColor.textSecondary)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }

                        GlassSection(title: "频率", symbol: "calendar", tint: DSColor.focus) {
                            Picker("频率", selection: $frequency) {
                                ForEach(HabitFrequency.allCases) { f in
                                    Text(f.label).tag(f)
                                }
                            }
                            .pickerStyle(.segmented)
                        }

                        GlassSection(title: "每次目标", symbol: "target", tint: DSColor.ping) {
                            Stepper("每次 \(targetCount) 次", value: $targetCount, in: 1...10)
                        }
                    }
                    .padding(DSSpace.md)
                    .padding(.bottom, DSSpace.lg)
                }
            }
            .navigationTitle("新习惯")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("取消") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("保存") {
                        let habit = Habit(title: title, symbol: symbol, frequency: frequency, targetCount: targetCount)
                        modelContext.insert(habit)
                        try? modelContext.save()
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }
}
