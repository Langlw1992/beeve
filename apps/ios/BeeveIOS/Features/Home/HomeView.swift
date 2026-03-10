import SwiftData
import SwiftUI

struct HomeView: View {
  @Environment(\.modelContext) private var modelContext
  @Query(sort: \TaskItem.createdAt, order: .forward) private var tasks: [TaskItem]
  @Query(sort: \ReminderItem.scheduledAt, order: .forward) private var reminders: [ReminderItem]

  let onOpenTasks: () -> Void
  let onQuickAddTask: () -> Void
  let onOpenAI: () -> Void

  private var openTasks: [TaskItem] {
    tasks.filter { $0.status != .done && $0.status != .archived }
  }

  private var topTasks: [TaskItem] {
    openTasks.sorted(by: taskSort).prefix(3).map { $0 }
  }

  private var activeRemindersByTaskID: [String: ReminderItem] {
    let linkedReminders = reminders
      .filter { !$0.isCompleted }
      .compactMap { reminder -> (String, ReminderItem)? in
        guard let relatedTaskID = reminder.relatedTaskId else {
          return nil
        }
        return (relatedTaskID, reminder)
      }

    return linkedReminders.reduce(into: [String: ReminderItem]()) { result, item in
      let (taskID, reminder) = item
      if let existing = result[taskID] {
        if reminder.scheduledAt < existing.scheduledAt {
          result[taskID] = reminder
        }
      } else {
        result[taskID] = reminder
      }
    }
  }

  private var actionTaskIDsToday: Set<String> {
    let dueTodayTaskIDs = openTasks.compactMap { task -> String? in
      guard let dueAt = task.dueAt, Calendar.current.isDateInToday(dueAt) else {
        return nil
      }
      return task.id
    }

    let reminderTaskIDs = reminders.compactMap { reminder -> String? in
      guard
        !reminder.isCompleted,
        let relatedTaskID = reminder.relatedTaskId,
        Calendar.current.isDateInToday(reminder.scheduledAt)
      else {
        return nil
      }
      return relatedTaskID
    }

    return Set(dueTodayTaskIDs + reminderTaskIDs)
  }

  private var actionTasksToday: [TaskItem] {
    openTasks
      .filter { actionTaskIDsToday.contains($0.id) }
      .sorted(by: taskSort)
  }

  private var upcomingTasks: [TaskItem] {
    let tomorrow = Calendar.current.startOfDay(for: Date()).addingTimeInterval(60 * 60 * 24)
    let nextWeek = tomorrow.addingTimeInterval(60 * 60 * 24 * 6)

    return openTasks.filter { task in
      guard let dueAt = task.dueAt else {
        return false
      }
      return dueAt >= tomorrow && dueAt < nextWeek
    }
    .sorted(by: taskSort)
  }

  private var standaloneRemindersToday: [ReminderItem] {
    reminders.filter { reminder in
      !reminder.isCompleted
        && reminder.relatedTaskId == nil
        && Calendar.current.isDateInToday(reminder.scheduledAt)
    }
  }

  private var completedTodayCount: Int {
    tasks.filter { task in
      guard let completedAt = task.completedAt else {
        return false
      }
      return Calendar.current.isDateInToday(completedAt)
    }.count
  }

  private var completionRate: Double {
    let total = tasks.count
    guard total > 0 else {
      return 0
    }
    let doneCount = tasks.filter { $0.status == .done }.count
    return Double(doneCount) / Double(total)
  }

  var body: some View {
    ZStack {
      BeevePageBackground()

      ScrollView(showsIndicators: false) {
        VStack(spacing: 20) {
          TodayHeroCard(
            openTaskCount: openTasks.count,
            actionCount: actionTasksToday.count + standaloneRemindersToday.count,
            reminderCount: reminders.filter { !$0.isCompleted }.count,
            completionRate: completionRate,
            onQuickAddTask: onQuickAddTask,
            onOpenAI: onOpenAI,
          )

          TodayMetricsGrid(
            openTaskCount: openTasks.count,
            actionCount: actionTasksToday.count + standaloneRemindersToday.count,
            reminderCount: reminders.filter { !$0.isCompleted }.count,
            completedTodayCount: completedTodayCount,
          )

          if topTasks.isEmpty && actionTasksToday.isEmpty && standaloneRemindersToday.isEmpty {
            TodayEmptyStateCard(
              onQuickAddTask: onQuickAddTask,
              onOpenAI: onOpenAI,
            )
          } else {
            if !topTasks.isEmpty {
              TodaySectionCard(
                title: "今日焦点",
                subtitle: "先只盯住最重要的 3 条事项；提醒只是帮你把这些事带回来。",
                systemImage: "scope",
              ) {
                VStack(spacing: 12) {
                  ForEach(topTasks) { task in
                    TodayTaskCard(
                      task: task,
                      reminder: activeRemindersByTaskID[task.id],
                      onAdvance: {
                        advance(task)
                      },
                      onOpenTasks: onOpenTasks,
                    )
                  }
                }
              }
            }

            if !actionTasksToday.isEmpty || !standaloneRemindersToday.isEmpty {
              TodaySectionCard(
                title: "今天需要我处理的",
                subtitle: "把今天到期的事项和今天会把你拉回来的提醒放在同一视图里。",
                systemImage: "calendar.badge.clock",
              ) {
                VStack(spacing: 12) {
                  ForEach(actionTasksToday) { task in
                    TodayInlineTaskRow(
                      task: task,
                      reminder: activeRemindersByTaskID[task.id],
                    ) {
                      advance(task)
                    }
                  }

                  if !standaloneRemindersToday.isEmpty {
                    Divider()
                      .overlay(Color.beeveSeparator)
                      .padding(.vertical, 4)

                    ForEach(standaloneRemindersToday) { reminder in
                      TodayReminderRow(reminder: reminder) {
                        completeReminder(reminder)
                      }
                    }
                  }
                }
              }
            }

            if !upcomingTasks.isEmpty {
              TodaySectionCard(
                title: "即将到期",
                subtitle: "提前看一眼后面几天的压力点。",
                systemImage: "clock.arrow.circlepath",
              ) {
                VStack(spacing: 12) {
                  ForEach(upcomingTasks.prefix(4)) { task in
                    TodayUpcomingTaskRow(task: task)
                  }
                }
              }
            }
          }
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
        .padding(.bottom, 28)
      }
    }
    .navigationTitle("今日")
    .navigationBarTitleDisplayMode(.large)
  }

  private func advance(_ task: TaskItem) {
    switch task.status {
    case .inbox:
      task.status = .todo
    case .todo:
      task.status = .doing
    case .doing:
      task.status = .done
      task.completedAt = Date()
    case .done:
      task.status = .todo
      task.completedAt = nil
    case .archived:
      task.status = .todo
    }

    task.updatedAt = Date()

    do {
      try modelContext.save()
    } catch {
      assertionFailure("更新任务失败：\(error.localizedDescription)")
    }
  }

  private func completeReminder(_ reminder: ReminderItem) {
    reminder.isCompleted = true
    reminder.updatedAt = Date()

    if let notificationIdentifier = reminder.notificationIdentifier {
      NotificationService.shared.cancelReminder(identifier: notificationIdentifier)
    }

    do {
      try modelContext.save()
    } catch {
      assertionFailure("更新提醒失败：\(error.localizedDescription)")
    }
  }

  private func taskSort(lhs: TaskItem, rhs: TaskItem) -> Bool {
    let lhsPriority = priorityWeight(lhs.priority)
    let rhsPriority = priorityWeight(rhs.priority)
    if lhsPriority != rhsPriority {
      return lhsPriority > rhsPriority
    }

    switch (lhs.dueAt, rhs.dueAt) {
    case let (left?, right?):
      return left < right
    case (_?, nil):
      return true
    case (nil, _?):
      return false
    default:
      return lhs.createdAt < rhs.createdAt
    }
  }

  private func priorityWeight(_ priority: TaskItemPriority) -> Int {
    switch priority {
    case .high:
      3
    case .medium:
      2
    case .low:
      1
    }
  }
}

#Preview("今日") {
  NavigationStack {
    HomeView(
      onOpenTasks: {},
      onQuickAddTask: {},
      onOpenAI: {},
    )
  }
  .modelContainer(makeBeevePreviewContainer())
}

private struct TodayHeroCard: View {
  let openTaskCount: Int
  let actionCount: Int
  let reminderCount: Int
  let completionRate: Double
  let onQuickAddTask: () -> Void
  let onOpenAI: () -> Void

  var body: some View {
    ZStack(alignment: .bottomLeading) {
      RoundedRectangle(cornerRadius: 28, style: .continuous)
        .fill(
          LinearGradient(
            colors: [Color.indigo, Color.blue, Color.cyan],
            startPoint: .topLeading,
            endPoint: .bottomTrailing,
          )
        )
        .shadow(color: Color.indigo.opacity(0.18), radius: 18, y: 12)

      Circle()
        .fill(.white.opacity(0.14))
        .frame(width: 190, height: 190)
        .offset(x: 120, y: -90)

      Circle()
        .fill(.white.opacity(0.08))
        .frame(width: 140, height: 140)
        .offset(x: 150, y: 86)

      VStack(alignment: .leading, spacing: 18) {
        VStack(alignment: .leading, spacing: 8) {
          Text("先收集事项，再用提醒把它们带回今天")
            .font(.system(size: 31, weight: .bold, design: .rounded))
            .foregroundStyle(.white)

          Text("Beeve 先把事项当成主对象：你真正管理的是事，提醒只负责在合适的时间把事重新拉回到眼前。")
            .font(.subheadline)
            .foregroundStyle(.white.opacity(0.88))
            .fixedSize(horizontal: false, vertical: true)
        }

        HStack(spacing: 10) {
          TodayHeroBadge(text: "\(openTaskCount) 条进行中", systemImage: "checklist")
          TodayHeroBadge(text: "\(actionCount) 条今天要处理", systemImage: "calendar")
          TodayHeroBadge(text: "\(reminderCount) 条已设提醒", systemImage: "bell.fill")
        }

        VStack(alignment: .leading, spacing: 8) {
          HStack {
            Text("整体完成度")
              .font(.footnote.weight(.medium))
              .foregroundStyle(.white.opacity(0.88))

            Spacer()

            Text("\(Int(completionRate * 100))%")
              .font(.footnote.weight(.semibold))
              .foregroundStyle(.white)
          }

          ProgressView(value: completionRate)
            .progressViewStyle(.linear)
            .tint(.white)
            .background(.white.opacity(0.14))
            .clipShape(Capsule())
        }

        HStack(spacing: 12) {
          Button(action: onQuickAddTask) {
            Label("快速收集", systemImage: "plus.circle.fill")
              .frame(maxWidth: .infinity)
          }
          .buttonStyle(TodayPrimaryButtonStyle())

          Button(action: onOpenAI) {
            Label("AI 总结", systemImage: "sparkles")
              .frame(maxWidth: .infinity)
          }
          .buttonStyle(TodaySecondaryButtonStyle())
        }
      }
      .padding(22)
    }
    .frame(height: 298)
  }
}

private struct TodayMetricsGrid: View {
  let openTaskCount: Int
  let actionCount: Int
  let reminderCount: Int
  let completedTodayCount: Int

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    LazyVGrid(columns: columns, spacing: 12) {
      TodayMetricCard(title: "待推进事项", value: "\(openTaskCount)", note: "当前还没完成")
      TodayMetricCard(title: "今天要处理", value: "\(actionCount)", note: "截止与提醒合并看")
      TodayMetricCard(title: "已设提醒", value: "\(reminderCount)", note: "帮助事项重新回来")
      TodayMetricCard(title: "今天完成", value: "\(completedTodayCount)", note: "成就感来源")
    }
  }
}

private struct TodayMetricCard: View {
  let title: String
  let value: String
  let note: String

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      Text(title)
        .font(.subheadline)
        .foregroundStyle(.secondary)

      Text(value)
        .font(.system(size: 30, weight: .bold, design: .rounded))

      Text(note)
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, minHeight: 128, alignment: .leading)
    .padding(16)
    .beeveCardSurface(cornerRadius: 22)
  }
}

private struct TodaySectionCard<Content: View>: View {
  let title: String
  let subtitle: String
  let systemImage: String
  let content: Content

  init(
    title: String,
    subtitle: String,
    systemImage: String,
    @ViewBuilder content: () -> Content,
  ) {
    self.title = title
    self.subtitle = subtitle
    self.systemImage = systemImage
    self.content = content()
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 18) {
      HStack(alignment: .top, spacing: 12) {
        Image(systemName: systemImage)
          .font(.title3)
          .foregroundStyle(.indigo)
          .frame(width: 36, height: 36)
          .background(.indigo.opacity(0.12), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

        VStack(alignment: .leading, spacing: 4) {
          Text(title)
            .font(.headline)
          Text(subtitle)
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
      }

      content
    }
    .padding(18)
    .beeveCardSurface(cornerRadius: 24)
  }
}

private struct TodayTaskCard: View {
  let task: TaskItem
  let reminder: ReminderItem?
  let onAdvance: () -> Void
  let onOpenTasks: () -> Void

  var body: some View {
    VStack(alignment: .leading, spacing: 14) {
      HStack(alignment: .top, spacing: 12) {
        VStack(alignment: .leading, spacing: 6) {
          Text(task.title)
            .font(.headline)
            .foregroundStyle(.primary)

          if !task.note.isEmpty {
            Text(task.note)
              .font(.subheadline)
              .foregroundStyle(.secondary)
              .lineLimit(2)
          }
        }

        Spacer(minLength: 12)

        TodayPriorityBadge(priority: task.priority)
      }

      HStack(spacing: 8) {
        TodayStateBadge(text: task.status.title, color: todayStatusColor(task.status))

        if let dueAt = task.dueAt {
          TodayStateBadge(text: dueAt.beeveDisplayText, color: .orange)
        }

        if let reminder {
          TodayStateBadge(text: "提醒 \(reminder.scheduledAt.beeveDisplayText)", color: .teal)
        }
      }

      HStack(spacing: 12) {
        Button(action: onAdvance) {
          Label(primaryActionTitle(for: task.status), systemImage: primaryActionIcon(for: task.status))
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(TodayPrimaryButtonStyle())

        Button(action: onOpenTasks) {
          Label("去事项页", systemImage: "arrow.right")
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(TodaySecondaryButtonStyle())
      }
    }
    .padding(16)
    .beeveElevatedSurface(cornerRadius: 22)
  }
}

private struct TodayInlineTaskRow: View {
  let task: TaskItem
  let reminder: ReminderItem?
  let onAdvance: () -> Void

  var body: some View {
    HStack(spacing: 12) {
      VStack(alignment: .leading, spacing: 6) {
        Text(task.title)
          .font(.headline)
        if let dueAt = task.dueAt {
          Text(dueAt.beeveDisplayText)
            .font(.footnote)
            .foregroundStyle(.secondary)
        }
        if let reminder {
          Text("提醒：\(reminder.scheduledAt.beeveDisplayText)")
            .font(.footnote)
            .foregroundStyle(.teal)
        }
      }

      Spacer()

      Button(action: onAdvance) {
        Image(systemName: primaryActionIcon(for: task.status))
          .font(.headline)
          .foregroundStyle(.white)
          .frame(width: 42, height: 42)
          .background(todayStatusColor(task.status), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
      }
      .buttonStyle(.plain)
    }
    .padding(14)
    .beeveElevatedSurface(cornerRadius: 20)
  }
}

private struct TodayReminderRow: View {
  let reminder: ReminderItem
  let onComplete: () -> Void

  var body: some View {
    HStack(spacing: 12) {
      VStack(alignment: .leading, spacing: 6) {
        Text(reminder.title)
          .font(.headline)
        if !reminder.note.isEmpty {
          Text(reminder.note)
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .lineLimit(2)
        }
        Text(reminder.scheduledAt.beeveDisplayText)
          .font(.footnote)
          .foregroundStyle(.secondary)
      }

      Spacer()

      Button(action: onComplete) {
        Label("完成", systemImage: "checkmark")
          .labelStyle(.iconOnly)
          .frame(width: 42, height: 42)
          .background(Color.teal, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
          .foregroundStyle(.white)
      }
      .buttonStyle(.plain)
    }
    .padding(14)
    .beeveElevatedSurface(cornerRadius: 20)
  }
}

private struct TodayUpcomingTaskRow: View {
  let task: TaskItem

  var body: some View {
    HStack(spacing: 12) {
      VStack(alignment: .leading, spacing: 6) {
        Text(task.title)
          .font(.headline)
        if let dueAt = task.dueAt {
          Text(dueAt.beeveDisplayText)
            .font(.footnote)
            .foregroundStyle(.secondary)
        }
      }

      Spacer()

      TodayPriorityBadge(priority: task.priority)
    }
    .padding(14)
    .beeveElevatedSurface(cornerRadius: 20)
  }
}

private struct TodayEmptyStateCard: View {
  let onQuickAddTask: () -> Void
  let onOpenAI: () -> Void

  var body: some View {
    TodaySectionCard(
      title: "今天还是空的",
      subtitle: "很适合先收进第一条事项；只有需要时，再给它加提醒。",
      systemImage: "sparkles.square.filled.on.square",
    ) {
      VStack(alignment: .leading, spacing: 16) {
        Text("先创建一条事项，再决定它是否真的需要截止时间或提醒。")
          .font(.subheadline)
          .foregroundStyle(.secondary)

        HStack(spacing: 12) {
          Button(action: onQuickAddTask) {
            Label("新建事项", systemImage: "plus.circle.fill")
              .frame(maxWidth: .infinity)
          }
          .buttonStyle(TodayPrimaryButtonStyle())

          Button(action: onOpenAI) {
            Label("让 AI 帮我想", systemImage: "sparkles")
              .frame(maxWidth: .infinity)
          }
          .buttonStyle(TodaySecondaryButtonStyle())
        }
      }
    }
  }
}

struct TodayHeroBadge: View {
  let text: String
  let systemImage: String

  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: systemImage)
      Text(text)
    }
    .font(.footnote.weight(.semibold))
    .foregroundStyle(.white)
    .padding(.horizontal, 10)
    .padding(.vertical, 8)
    .background(.white.opacity(0.14), in: Capsule())
  }
}

struct TodayPriorityBadge: View {
  let priority: TaskItemPriority

  var body: some View {
    Text(priority.title)
      .font(.caption.weight(.semibold))
      .foregroundStyle(todayPriorityColor(priority))
      .padding(.horizontal, 10)
      .padding(.vertical, 6)
      .background(todayPriorityColor(priority).opacity(0.12), in: Capsule())
  }
}

struct TodayStateBadge: View {
  let text: String
  let color: Color

  var body: some View {
    Text(text)
      .font(.caption.weight(.semibold))
      .foregroundStyle(color)
      .padding(.horizontal, 10)
      .padding(.vertical, 6)
      .background(color.opacity(0.12), in: Capsule())
  }
}

struct TodayPrimaryButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.subheadline.weight(.semibold))
      .foregroundStyle(.white)
      .padding(.horizontal, 16)
      .padding(.vertical, 14)
      .background(
        LinearGradient(
          colors: [Color.indigo, Color.blue],
          startPoint: .leading,
          endPoint: .trailing,
        ),
        in: RoundedRectangle(cornerRadius: 18, style: .continuous),
      )
      .opacity(configuration.isPressed ? 0.94 : 1)
      .scaleEffect(configuration.isPressed ? 0.98 : 1)
      .animation(.easeOut(duration: 0.16), value: configuration.isPressed)
  }
}

struct TodaySecondaryButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.subheadline.weight(.semibold))
      .foregroundStyle(.primary)
      .padding(.horizontal, 16)
      .padding(.vertical, 14)
      .beeveSolidSurface(cornerRadius: 18)
      .opacity(configuration.isPressed ? 0.94 : 1)
      .scaleEffect(configuration.isPressed ? 0.98 : 1)
      .animation(.easeOut(duration: 0.16), value: configuration.isPressed)
  }
}

func todayStatusColor(_ status: TaskItemStatus) -> Color {
  switch status {
  case .inbox:
    .purple
  case .todo:
    .indigo
  case .doing:
    .orange
  case .done:
    .green
  case .archived:
    .gray
  }
}

func todayPriorityColor(_ priority: TaskItemPriority) -> Color {
  switch priority {
  case .high:
    .red
  case .medium:
    .orange
  case .low:
    .teal
  }
}

func primaryActionTitle(for status: TaskItemStatus) -> String {
  switch status {
  case .inbox:
    "开始整理"
  case .todo:
    "开始执行"
  case .doing:
    "标记完成"
  case .done:
    "恢复任务"
  case .archived:
    "恢复到待办"
  }
}

func primaryActionIcon(for status: TaskItemStatus) -> String {
  switch status {
  case .inbox:
    "tray.full"
  case .todo:
    "play.fill"
  case .doing:
    "checkmark"
  case .done:
    "arrow.uturn.backward"
  case .archived:
    "arrow.uturn.backward.circle"
  }
}
