import SwiftData
import SwiftUI

private enum TaskListFilter: String, CaseIterable, Identifiable {
  case all
  case inbox
  case todo
  case doing
  case scheduled
  case done

  var id: String {
    rawValue
  }

  var title: String {
    switch self {
    case .all:
      "全部"
    case .inbox:
      "收件箱"
    case .todo:
      "待处理"
    case .doing:
      "进行中"
    case .scheduled:
      "已设提醒"
    case .done:
      "已完成"
    }
  }
}

struct CatalogView: View {
  @Environment(\.modelContext) private var modelContext
  @Query(sort: \TaskItem.createdAt, order: .forward) private var tasks: [TaskItem]
  @Query(sort: \ReminderItem.scheduledAt, order: .forward) private var reminders: [ReminderItem]

  let onCreateTask: () -> Void

  @State private var searchText = ""
  @State private var selectedFilter: TaskListFilter = .all

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

  private var taskIDsWithReminder: Set<String> {
    Set(activeRemindersByTaskID.keys)
  }

  private var filteredTasks: [TaskItem] {
    tasks.filter { task in
      let matchesFilter: Bool = {
        switch selectedFilter {
        case .all:
          true
        case .inbox:
          task.status == .inbox
        case .todo:
          task.status == .todo
        case .doing:
          task.status == .doing
        case .scheduled:
          taskIDsWithReminder.contains(task.id)
        case .done:
          task.status == .done
        }
      }()

      let keyword = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
      let matchesKeyword = keyword.isEmpty || task.title.localizedCaseInsensitiveContains(keyword) || task.note.localizedCaseInsensitiveContains(keyword)
      return matchesFilter && matchesKeyword
    }
    .sorted(by: taskSort)
  }

  private var groupedTasks: [(title: String, items: [TaskItem])] {
    if selectedFilter != .all {
      return [(selectedFilter.title, filteredTasks)]
    }

    return [
      ("收件箱", filteredTasks.filter { $0.status == .inbox }),
      ("待处理", filteredTasks.filter { $0.status == .todo }),
      ("进行中", filteredTasks.filter { $0.status == .doing }),
      ("已完成", filteredTasks.filter { $0.status == .done }),
    ]
    .filter { !$0.items.isEmpty }
  }

  var body: some View {
    ZStack {
      BeevePageBackground()

      ScrollView(showsIndicators: false) {
        VStack(spacing: 20) {
          TaskHeroCard(
            totalCount: tasks.count,
            activeCount: tasks.filter { $0.status != .done && $0.status != .archived }.count,
            scheduledCount: taskIDsWithReminder.count,
            selectedFilter: selectedFilter,
          )

          TaskFilterSection(selectedFilter: $selectedFilter)

          if filteredTasks.isEmpty {
            TaskEmptyStateCard(onCreateTask: onCreateTask)
          } else {
            ForEach(groupedTasks, id: \.title) { section in
              TaskSectionCard(
                title: section.title,
                subtitle: taskSectionSubtitle(section.title),
                systemImage: taskSectionIcon(section.title),
              ) {
                VStack(spacing: 12) {
                  ForEach(section.items) { task in
                    TaskCard(
                      task: task,
                      reminder: activeRemindersByTaskID[task.id],
                      onAdvance: {
                        advance(task)
                      },
                      onArchive: {
                        archive(task)
                      },
                      onRestore: {
                        restore(task)
                      },
                    )
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
    .navigationTitle("事项")
    .navigationBarTitleDisplayMode(.large)
    .searchable(text: $searchText, prompt: "搜索事项标题或备注")
    .safeAreaInset(edge: .bottom, spacing: 0) {
      Button(action: onCreateTask) {
        Label("新建事项", systemImage: "plus.circle.fill")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(TodayPrimaryButtonStyle())
      .padding(.horizontal, 16)
      .padding(.top, 12)
      .padding(.bottom, 12)
      .background(.ultraThinMaterial)
    }
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
    saveChanges()
  }

  private func archive(_ task: TaskItem) {
    task.status = .archived
    task.updatedAt = Date()
    saveChanges()
  }

  private func restore(_ task: TaskItem) {
    task.status = .todo
    task.completedAt = nil
    task.updatedAt = Date()
    saveChanges()
  }

  private func saveChanges() {
    do {
      try modelContext.save()
    } catch {
      assertionFailure("保存事项变更失败：\(error.localizedDescription)")
    }
  }

  private func taskSort(lhs: TaskItem, rhs: TaskItem) -> Bool {
    if lhs.status != rhs.status {
      return statusWeight(lhs.status) < statusWeight(rhs.status)
    }

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

  private func statusWeight(_ status: TaskItemStatus) -> Int {
    switch status {
    case .inbox:
      0
    case .todo:
      1
    case .doing:
      2
    case .done:
      3
    case .archived:
      4
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

  private func taskSectionSubtitle(_ title: String) -> String {
    switch title {
    case "收件箱":
      "先收集，晚点再整理。"
    case "待处理":
      "已经明确但还没真正开始。"
    case "进行中":
      "别让同时推进的事情太多。"
    case "已设提醒":
      "这些事项会在合适的时候被重新拉回到你面前。"
    case "已完成":
      "这里负责给你一点完成感。"
    default:
      "把事项按当前状态排列。"
    }
  }

  private func taskSectionIcon(_ title: String) -> String {
    switch title {
    case "收件箱":
      "tray.fill"
    case "待处理":
      "circle.dashed"
    case "进行中":
      "bolt.fill"
    case "已设提醒":
      "bell.badge.fill"
    case "已完成":
      "checkmark.seal.fill"
    default:
      "checklist"
    }
  }
}

#Preview("事项") {
  NavigationStack {
    CatalogView(onCreateTask: {})
  }
  .modelContainer(makeBeevePreviewContainer())
}

private struct TaskHeroCard: View {
  let totalCount: Int
  let activeCount: Int
  let scheduledCount: Int
  let selectedFilter: TaskListFilter

  var body: some View {
    ZStack(alignment: .bottomLeading) {
      RoundedRectangle(cornerRadius: 28, style: .continuous)
        .fill(
          LinearGradient(
            colors: [Color.indigo, Color.blue, Color.teal],
            startPoint: .topLeading,
            endPoint: .bottomTrailing,
          )
        )
        .shadow(color: Color.indigo.opacity(0.16), radius: 18, y: 12)

      Circle()
        .fill(.white.opacity(0.14))
        .frame(width: 180, height: 180)
        .offset(x: 120, y: -90)

      VStack(alignment: .leading, spacing: 18) {
        VStack(alignment: .leading, spacing: 8) {
          Text("让收件箱、待办和执行态真正连起来")
            .font(.system(size: 30, weight: .bold, design: .rounded))
            .foregroundStyle(.white)

          Text("当前筛选：\(selectedFilter.title)。事项是主对象，提醒只是帮助这条事项在未来重新回来。")
            .font(.subheadline)
            .foregroundStyle(.white.opacity(0.88))
            .fixedSize(horizontal: false, vertical: true)
        }

        HStack(spacing: 10) {
          TodayHeroBadge(text: "\(totalCount) 条事项", systemImage: "checklist")
          TodayHeroBadge(text: "\(activeCount) 条活跃", systemImage: "bolt.fill")
          TodayHeroBadge(text: "\(scheduledCount) 条已设提醒", systemImage: "bell.fill")
        }
      }
      .padding(22)
    }
    .frame(height: 240)
  }
}

private struct TaskFilterSection: View {
  @Binding var selectedFilter: TaskListFilter

  var body: some View {
    TaskSectionCard(
      title: "筛选状态",
      subtitle: "首发先用最简单的状态流转，再补一个“已设提醒”视图帮助你看节奏。",
      systemImage: "line.3.horizontal.decrease.circle.fill",
    ) {
      Picker("筛选状态", selection: $selectedFilter) {
        ForEach(TaskListFilter.allCases) { filter in
          Text(filter.title).tag(filter)
        }
      }
      .pickerStyle(.segmented)
    }
  }
}

private struct TaskCard: View {
  let task: TaskItem
  let reminder: ReminderItem?
  let onAdvance: () -> Void
  let onArchive: () -> Void
  let onRestore: () -> Void

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
              .lineLimit(3)
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
        if task.aiGenerated {
          TodayStateBadge(text: "AI 生成", color: .purple)
        }
      }

      HStack(spacing: 12) {
        Button(action: onAdvance) {
          Label(primaryActionTitle(for: task.status), systemImage: primaryActionIcon(for: task.status))
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(TodayPrimaryButtonStyle())

        Menu {
          if task.status != .archived {
            Button("归档", systemImage: "archivebox") {
              onArchive()
            }
          }
          if task.status == .done || task.status == .archived {
            Button("恢复为待处理", systemImage: "arrow.uturn.backward") {
              onRestore()
            }
          }
        } label: {
          Label("更多", systemImage: "ellipsis")
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(TodaySecondaryButtonStyle())
      }
    }
    .padding(16)
    .beeveElevatedSurface(cornerRadius: 22)
  }
}

private struct TaskEmptyStateCard: View {
  let onCreateTask: () -> Void

  var body: some View {
    TaskSectionCard(
      title: "还没有符合条件的事项",
      subtitle: "很适合先新建一条，再慢慢把列表养起来。",
      systemImage: "tray.circle",
    ) {
      Button(action: onCreateTask) {
        Label("创建第一条事项", systemImage: "plus.circle.fill")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(TodayPrimaryButtonStyle())
    }
  }
}

private struct TaskSectionCard<Content: View>: View {
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
