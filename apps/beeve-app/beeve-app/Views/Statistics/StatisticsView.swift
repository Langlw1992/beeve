import SwiftUI
import SwiftData

struct StatisticsView: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.section) {
                    // Overview cards
                    overviewSection

                    // Focus stats
                    focusSection

                    // Habit stats
                    habitSection

                    // Completion trend
                    completionTrend
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("统计")
        }
    }

    // MARK: - Overview

    private var overviewSection: some View {
        GlassSection(title: "概览", symbol: "chart.pie.fill", tint: .indigo) {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                StatCard(title: "待处理", value: "\(store.pendingCount)", tint: .blue, symbol: "tray.full")
                StatCard(title: "已完成", value: "\(store.completedCount)", tint: .green, symbol: "checkmark.circle")
                StatCard(title: "收件箱", value: "\(store.inboxReminders.count)", tint: .purple, symbol: "tray")
                StatCard(title: "专注分", value: "\(store.focusScore)", tint: .orange, symbol: "brain.head.profile")
            }
        }
    }

    // MARK: - Focus

    private var focusSection: some View {
        let sessions = todayFocusSessions
        let totalMinutes = sessions.reduce(0) { $0 + $1.elapsedMinutes }
        let completed = sessions.filter(\.isCompleted).count

        return GlassSection(title: "今日专注", symbol: "timer", tint: .orange) {
            HStack(spacing: 16) {
                VStack(spacing: 4) {
                    Text("\(totalMinutes)")
                        .font(.title.bold())
                        .foregroundStyle(.orange)
                    Text("分钟")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)

                VStack(spacing: 4) {
                    Text("\(completed)")
                        .font(.title.bold())
                        .foregroundStyle(.green)
                    Text("完成")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)

                VStack(spacing: 4) {
                    Text("\(sessions.count)")
                        .font(.title.bold())
                        .foregroundStyle(.indigo)
                    Text("总次数")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)
            }
        }
    }

    // MARK: - Habits

    private var habitSection: some View {
        let habits = allHabits

        return GlassSection(title: "习惯", symbol: "flame.fill", tint: .green) {
            if habits.isEmpty {
                Text("还没有创建习惯。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                VStack(spacing: 10) {
                    ForEach(habits) { habit in
                        HStack(spacing: 10) {
                            Image(systemName: habit.symbol)
                                .foregroundStyle(habit.color)
                                .frame(width: 24)

                            Text(habit.title)
                                .font(.subheadline)

                            Spacer()

                            HStack(spacing: 4) {
                                Image(systemName: "flame.fill")
                                    .font(.caption2)
                                    .foregroundStyle(.orange)
                                Text("\(habit.currentStreak)天")
                                    .font(.caption.weight(.semibold))
                            }

                            Text("\(habit.totalCompletions)次")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Completion Trend (7-day bar chart)

    private var completionTrend: some View {
        let calendar = Calendar.current
        let days: [(String, Int)] = (0..<7).reversed().map { offset in
            let date = calendar.date(byAdding: .day, value: -offset, to: .now)!
            let label = date.formatted(.dateTime.weekday(.narrow))
            let completed = store.completedReminders.filter {
                guard let completedAt = $0.completedAt else { return false }
                return calendar.isDate(completedAt, inSameDayAs: date)
            }.count
            return (label, completed)
        }
        let maxVal = max(days.map(\.1).max() ?? 1, 1)

        return GlassSection(title: "最近 7 天完成", symbol: "chart.bar", tint: .blue) {
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(days, id: \.0) { day in
                    VStack(spacing: 4) {
                        Text("\(day.1)")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(.indigo)

                        RoundedRectangle(cornerRadius: 4, style: .continuous)
                            .fill(Color.indigo.gradient)
                            .frame(height: CGFloat(day.1) / CGFloat(maxVal) * 60 + 4)

                        Text(day.0)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .frame(height: 100)
        }
    }

    // MARK: - Data

    private var todayFocusSessions: [FocusSession] {
        let descriptor = FetchDescriptor<FocusSession>()
        let all = (try? modelContext.fetch(descriptor)) ?? []
        return all.filter(\.isToday)
    }

    private var allHabits: [Habit] {
        let descriptor = FetchDescriptor<Habit>(sortBy: [SortDescriptor(\.createdAt)])
        return (try? modelContext.fetch(descriptor)) ?? []
    }
}

// MARK: - Stat Card

struct StatCard: View {
    let title: String
    let value: String
    let tint: Color
    let symbol: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: symbol)
                    .font(.caption)
                    .foregroundStyle(tint)
                Spacer()
            }
            Text(value)
                .font(.title2.bold())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(12)
        .appCard(tint: tint, cornerRadius: 16)
    }
}
