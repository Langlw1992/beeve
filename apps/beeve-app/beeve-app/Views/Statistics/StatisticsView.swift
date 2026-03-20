import SwiftUI
import SwiftData

struct StatisticsView: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.modelContext) private var modelContext

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: DSSpace.lg) {
                    // Overview cards
                    overviewSection

                    // Focus stats
                    focusSection

                    // Habit stats
                    habitSection

                    // Completion trend
                    completionTrend
                }
                .padding(.horizontal, DSSpace.md)
                .padding(.top, DSComponent.pageTopInset)
                .padding(.bottom, DSComponent.pageBottomInset)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("统计")
        }
    }

    // MARK: - Overview

    private var overviewSection: some View {
        GlassSection(title: "概览", symbol: "chart.pie.fill", tint: DSColor.focus) {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: DSSpace.sm) {
                StatCard(title: "待处理", value: "\(store.pendingCount)", tint: DSColor.info, symbol: "tray.full")
                StatCard(title: "已完成", value: "\(store.completedCount)", tint: DSColor.success, symbol: "checkmark.circle")
                StatCard(title: "收件箱", value: "\(store.inboxReminders.count)", tint: DSColor.brand, symbol: "tray")
                StatCard(title: "专注分", value: "\(store.focusScore)", tint: DSColor.warning, symbol: "brain.head.profile")
            }
        }
    }

    // MARK: - Focus

    private var focusSection: some View {
        let sessions = todayFocusSessions
        let totalMinutes = sessions.reduce(0) { $0 + $1.elapsedMinutes }
        let completed = sessions.filter(\.isCompleted).count

        return GlassSection(title: "今日专注", symbol: "timer", tint: DSColor.warning) {
            HStack(spacing: DSSpace.md) {
                VStack(spacing: DSSpace.xxs) {
                    Text("\(totalMinutes)")
                        .font(DSType.numeric)
                        .foregroundStyle(DSColor.warning)
                    Text("分钟")
                        .font(DSType.caption)
                        .foregroundStyle(DSColor.textSecondary)
                }
                .frame(maxWidth: .infinity)

                VStack(spacing: DSSpace.xxs) {
                    Text("\(completed)")
                        .font(DSType.numeric)
                        .foregroundStyle(DSColor.success)
                    Text("完成")
                        .font(DSType.caption)
                        .foregroundStyle(DSColor.textSecondary)
                }
                .frame(maxWidth: .infinity)

                VStack(spacing: DSSpace.xxs) {
                    Text("\(sessions.count)")
                        .font(DSType.numeric)
                        .foregroundStyle(DSColor.focus)
                    Text("总次数")
                        .font(DSType.caption)
                        .foregroundStyle(DSColor.textSecondary)
                }
                .frame(maxWidth: .infinity)
            }
        }
    }

    // MARK: - Habits

    private var habitSection: some View {
        let habits = allHabits

        return GlassSection(title: "习惯", symbol: "flame.fill", tint: DSColor.success) {
            if habits.isEmpty {
                Text("还没有创建习惯。")
                    .font(DSType.body)
                    .foregroundStyle(DSColor.textSecondary)
            } else {
                VStack(spacing: DSSpace.sm) {
                    ForEach(habits) { habit in
                        HStack(spacing: DSSpace.sm) {
                            Image(systemName: habit.symbol)
                                .foregroundStyle(habit.color)
                                .frame(width: 24)

                            Text(habit.title)
                                .font(DSType.body)
                                .fixedSize(horizontal: false, vertical: true)

                            Spacer()

                            HStack(spacing: DSSpace.xxs) {
                                Image(systemName: "flame.fill")
                                    .font(DSType.meta)
                                    .foregroundStyle(DSColor.warning)
                                Text("\(habit.currentStreak)天")
                                    .font(DSType.captionBold)
                            }

                            Text("\(habit.totalCompletions)次")
                                .font(DSType.caption)
                                .foregroundStyle(DSColor.textSecondary)
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

        return GlassSection(title: "最近 7 天完成", symbol: "chart.bar", tint: DSColor.info) {
            HStack(alignment: .bottom, spacing: DSSpace.xs) {
                ForEach(days, id: \.0) { day in
                    VStack(spacing: DSSpace.xxs) {
                        Text("\(day.1)")
                            .font(DSType.captionBold)
                            .foregroundStyle(DSColor.focus)

                        RoundedRectangle(cornerRadius: DSRadius.control, style: .continuous)
                            .fill(DSColor.focus.gradient)
                            .frame(height: CGFloat(day.1) / CGFloat(maxVal) * 60 + 4)

                        Text(day.0)
                            .font(DSType.meta)
                            .foregroundStyle(DSColor.textSecondary)
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
        VStack(alignment: .leading, spacing: DSSpace.xs) {
            HStack {
                Image(systemName: symbol)
                    .font(DSType.caption)
                    .foregroundStyle(tint)
                Spacer()
            }
            Text(value)
                .font(DSType.numeric)
            Text(title)
                .font(DSType.caption)
                .foregroundStyle(DSColor.textSecondary)
        }
        .padding(DSSpace.sm)
        .appCard(tint: tint, cornerRadius: DSRadius.card)
    }
}
