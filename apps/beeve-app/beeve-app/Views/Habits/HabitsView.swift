import SwiftUI
import SwiftData

struct HabitsView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var showAddHabit = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    HeroMiniBanner(
                        title: "习惯追踪",
                        subtitle: "每天完成小目标，积累大变化。",
                        symbol: "flame.fill",
                        tint: .green
                    )

                    if habits.isEmpty {
                        emptyState
                    } else {
                        // Today overview
                        GlassSection(title: "今日打卡", symbol: "checkmark.seal", tint: .green) {
                            VStack(spacing: 12) {
                                ForEach(habits) { habit in
                                    HabitCheckRow(habit: habit) {
                                        checkIn(habit)
                                    }
                                }
                            }
                        }

                        // Streaks
                        GlassSection(title: "连续天数", symbol: "flame.fill", tint: .orange) {
                            HStack(spacing: 16) {
                                ForEach(habits) { habit in
                                    VStack(spacing: 6) {
                                        Text("\(habit.currentStreak)")
                                            .font(.title2.bold())
                                            .foregroundStyle(habit.color)
                                        Text(habit.title)
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                            .lineLimit(1)
                                    }
                                    .frame(maxWidth: .infinity)
                                }
                            }
                        }

                        // Heatmap-style weekly view
                        GlassSection(title: "最近 7 天", symbol: "calendar", tint: .indigo) {
                            HabitWeekGrid(habits: habits)
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
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
        VStack(spacing: 16) {
            Image(systemName: "flame")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("还没有习惯")
                .font(.headline)
            Text("创建你的第一个习惯，每天打卡积累动力。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Button("创建习惯") { showAddHabit = true }
                .buttonStyle(.borderedProminent)
                .tint(.green)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }
}

// MARK: - Habit Check Row

struct HabitCheckRow: View {
    let habit: Habit
    let onCheckIn: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button {
                withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                    onCheckIn()
                }
            } label: {
                Image(systemName: habit.isCompletedToday ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(habit.isCompletedToday ? .green : habit.color)
            }
            .buttonStyle(.plain)
            .sensoryFeedback(.impact(weight: .medium), trigger: habit.isCompletedToday)

            Image(systemName: habit.symbol)
                .foregroundStyle(habit.color)
                .font(.subheadline)

            VStack(alignment: .leading, spacing: 2) {
                Text(habit.title)
                    .font(.subheadline.weight(.semibold))
                Text("\(habit.todayLog?.count ?? 0)/\(habit.targetCount) · \(habit.frequency.label)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if habit.currentStreak > 0 {
                HStack(spacing: 3) {
                    Image(systemName: "flame.fill")
                        .font(.caption2)
                    Text("\(habit.currentStreak)")
                        .font(.caption.weight(.bold))
                }
                .foregroundStyle(.orange)
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
        VStack(spacing: 8) {
            // Header
            HStack(spacing: 4) {
                Text("")
                    .frame(width: 60)
                ForEach(weekDates, id: \.timeIntervalSince1970) { date in
                    Text(date.formatted(.dateTime.weekday(.narrow)))
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity)
                }
            }

            ForEach(habits) { habit in
                HStack(spacing: 4) {
                    Text(habit.title)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                        .frame(width: 60, alignment: .leading)

                    ForEach(weekDates, id: \.timeIntervalSince1970) { date in
                        let done = hasLog(habit: habit, on: date)
                        RoundedRectangle(cornerRadius: 4, style: .continuous)
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
                    VStack(spacing: AppSpacing.section) {
                        GlassSection(title: "习惯", symbol: "flame", tint: .green) {
                            TextField("习惯名称", text: $title)
                                .textFieldStyle(.roundedBorder)
                        }

                        GlassSection(title: "图标", symbol: "star", tint: .orange) {
                            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 12) {
                                ForEach(symbols, id: \.self) { sym in
                                    Button {
                                        symbol = sym
                                    } label: {
                                        Image(systemName: sym)
                                            .font(.title3)
                                            .frame(width: 44, height: 44)
                                            .background(symbol == sym ? Color.green.opacity(0.2) : Color.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: 10))
                                            .foregroundStyle(symbol == sym ? .green : .secondary)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }

                        GlassSection(title: "频率", symbol: "calendar", tint: .indigo) {
                            Picker("频率", selection: $frequency) {
                                ForEach(HabitFrequency.allCases) { f in
                                    Text(f.label).tag(f)
                                }
                            }
                            .pickerStyle(.segmented)
                        }

                        GlassSection(title: "每次目标", symbol: "target", tint: .cyan) {
                            Stepper("每次 \(targetCount) 次", value: $targetCount, in: 1...10)
                        }
                    }
                    .padding()
                    .padding(.bottom, 24)
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
