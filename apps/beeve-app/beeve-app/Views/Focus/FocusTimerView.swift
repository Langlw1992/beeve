import SwiftUI
import SwiftData

struct FocusTimerView: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.modelContext) private var modelContext
    @State private var timer: Timer?
    @State private var currentSession: FocusSession?
    @State private var elapsed: Int = 0
    @State private var selectedDuration: Int = 25
    @State private var linkedReminder: Reminder?
    @State private var showReminderPicker = false

    let durations = [15, 25, 50]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppSpacing.section) {
                    if let session = currentSession, !session.isCompleted {
                        activeTimerView(session: session)
                    } else {
                        setupView
                    }

                    todaySessionsSummary
                }
                .padding(.horizontal)
                .padding(.top, AppSpacing.pageTop)
                .padding(.bottom, AppSpacing.pageBottom)
            }
            .scrollIndicators(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("专注")
        }
    }

    // MARK: - Setup View

    private var setupView: some View {
        VStack(spacing: 24) {
            HeroMiniBanner(
                title: "准备专注",
                subtitle: "选择时长和关联任务，倒计时开始后尽量不要中断。",
                symbol: "timer",
                tint: .orange
            )

            GlassSection(title: "时长", symbol: "clock.fill", tint: .orange) {
                HStack(spacing: 12) {
                    ForEach(durations, id: \.self) { mins in
                        Button {
                            selectedDuration = mins
                        } label: {
                            Text("\(mins) 分钟")
                                .font(.subheadline.weight(.semibold))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(
                                    selectedDuration == mins ? Color.orange.opacity(0.2) : Color.secondary.opacity(0.08),
                                    in: RoundedRectangle(cornerRadius: 12, style: .continuous)
                                )
                                .foregroundStyle(selectedDuration == mins ? .orange : .secondary)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            GlassSection(title: "关联任务", symbol: "link", tint: .indigo) {
                if let linked = linkedReminder {
                    HStack {
                        CircleIconBadge(symbol: "checkmark.circle", tint: linked.priority.color, size: 32, iconSize: 13)
                        Text(linked.title)
                            .font(.subheadline)
                        Spacer()
                        Button("更换") { showReminderPicker = true }
                            .font(.caption)
                            .buttonStyle(.bordered)
                    }
                } else {
                    Button {
                        showReminderPicker = true
                    } label: {
                        HStack {
                            Image(systemName: "plus.circle.dashed")
                            Text("选择关联任务（可选）")
                                .font(.subheadline)
                            Spacer()
                        }
                        .foregroundStyle(.secondary)
                    }
                    .buttonStyle(.plain)
                }
            }

            Button {
                startSession()
            } label: {
                HStack {
                    Image(systemName: "play.fill")
                    Text("开始专注")
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(.orange)
        }
        .sheet(isPresented: $showReminderPicker) {
            reminderPickerSheet
        }
    }

    // MARK: - Active Timer

    private func activeTimerView(session: FocusSession) -> some View {
        VStack(spacing: 32) {
            ZStack {
                Circle()
                    .stroke(Color.orange.opacity(0.15), lineWidth: 10)
                    .frame(width: 200, height: 200)

                Circle()
                    .trim(from: 0, to: CGFloat(elapsed) / CGFloat(session.duration))
                    .stroke(Color.orange, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                    .frame(width: 200, height: 200)
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 1), value: elapsed)

                VStack(spacing: 4) {
                    let remaining = max(session.duration - elapsed, 0)
                    Text(timeString(remaining))
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .monospacedDigit()

                    if let title = session.linkedReminderTitle {
                        Text(title)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }
            }

            HStack(spacing: 24) {
                Button {
                    cancelSession()
                } label: {
                    Label("放弃", systemImage: "xmark.circle.fill")
                        .font(.subheadline.weight(.semibold))
                }
                .buttonStyle(.bordered)
                .tint(.secondary)

                Button {
                    completeSession()
                } label: {
                    Label("提前完成", systemImage: "checkmark.circle.fill")
                        .font(.subheadline.weight(.semibold))
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
            }
        }
        .padding(.vertical, 24)
        .appCard(tint: .orange, cornerRadius: 28)
    }

    // MARK: - Today Sessions

    private var todaySessionsSummary: some View {
        let sessions = todaySessions
        let totalMinutes = sessions.reduce(0) { $0 + $1.elapsedMinutes }

        return GlassSection(title: "今日专注", symbol: "chart.bar.fill", tint: .orange) {
            if sessions.isEmpty {
                Text("还没有开始今天的第一个专注。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("\(sessions.count) 次专注")
                            .font(.subheadline.weight(.semibold))
                        Spacer()
                        Text("共 \(totalMinutes) 分钟")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.orange)
                    }

                    ForEach(sessions, id: \.id) { session in
                        HStack(spacing: 8) {
                            Image(systemName: session.isCompleted ? "checkmark.circle.fill" : "xmark.circle")
                                .foregroundStyle(session.isCompleted ? .green : .secondary)
                                .font(.caption)
                            Text(session.linkedReminderTitle ?? "自由专注")
                                .font(.caption)
                                .lineLimit(1)
                            Spacer()
                            Text("\(session.elapsedMinutes) 分钟")
                                .font(.caption.monospacedDigit())
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Helpers

    private var todaySessions: [FocusSession] {
        let descriptor = FetchDescriptor<FocusSession>(
            sortBy: [SortDescriptor(\.startedAt, order: .reverse)]
        )
        let all = (try? modelContext.fetch(descriptor)) ?? []
        return all.filter(\.isToday)
    }

    private func startSession() {
        let session = FocusSession(duration: selectedDuration * 60, linkedReminder: linkedReminder)
        modelContext.insert(session)
        try? modelContext.save()
        currentSession = session
        elapsed = 0

        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            Task { @MainActor in
                elapsed += 1
                if elapsed >= session.duration {
                    completeSession()
                }
            }
        }
    }

    private func completeSession() {
        timer?.invalidate()
        timer = nil
        currentSession?.elapsed = elapsed
        currentSession?.isCompleted = true
        try? modelContext.save()
        currentSession = nil
        elapsed = 0
    }

    private func cancelSession() {
        timer?.invalidate()
        timer = nil
        currentSession?.elapsed = elapsed
        currentSession?.isCompleted = false
        try? modelContext.save()
        currentSession = nil
        elapsed = 0
    }

    private func timeString(_ seconds: Int) -> String {
        let m = seconds / 60
        let s = seconds % 60
        return String(format: "%02d:%02d", m, s)
    }

    // MARK: - Picker Sheet

    private var reminderPickerSheet: some View {
        NavigationStack {
            List(store.pendingReminders) { reminder in
                Button {
                    linkedReminder = reminder
                    showReminderPicker = false
                } label: {
                    HStack {
                        CircleIconBadge(symbol: "checkmark.circle", tint: reminder.priority.color, size: 28, iconSize: 11)
                        Text(reminder.title)
                            .font(.subheadline)
                        Spacer()
                    }
                }
            }
            .navigationTitle("选择任务")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("取消") { showReminderPicker = false }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("跳过") {
                        linkedReminder = nil
                        showReminderPicker = false
                    }
                }
            }
        }
    }
}
