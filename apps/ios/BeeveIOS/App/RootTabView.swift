import SwiftData
import SwiftUI

private enum RootSheet: String, Identifiable {
  case taskComposer

  var id: String {
    rawValue
  }
}

struct RootTabView: View {
  @State private var selectedTab: AppTab = .today
  @State private var activeSheet: RootSheet?

  var body: some View {
    TabView(selection: $selectedTab) {
      ForEach(AppTab.allCases, id: \.self) { tab in
        tabContent(for: tab)
          .tabItem {
            Label(tab.title, systemImage: selectedTab == tab ? tab.selectedIcon : tab.defaultIcon)
          }
          .tag(tab)
      }
    }
    .tint(.indigo)
    .toolbarBackground(.regularMaterial, for: .tabBar)
    .toolbarBackground(.visible, for: .tabBar)
    .overlay(alignment: .bottom) {
      RootTabSelectionBadge(selectedTab: selectedTab)
        .padding(.bottom, 54)
        .allowsHitTesting(false)
    }
    .sheet(item: $activeSheet) { sheet in
      switch sheet {
      case .taskComposer:
        TaskComposerSheet()
      }
    }
  }

  @ViewBuilder
  private func tabContent(for tab: AppTab) -> some View {
    switch tab {
    case .today:
      RootNavigationContainer(tab: tab, onOpenAI: {
        selectedTab = .ai
      }) {
        HomeView(
          onOpenTasks: {
            selectedTab = .tasks
          },
          onQuickAddTask: {
            activeSheet = .taskComposer
          },
          onOpenAI: {
            selectedTab = .ai
          },
        )
      }
    case .tasks:
      RootNavigationContainer(tab: tab, onOpenAI: {
        selectedTab = .ai
      }) {
        CatalogView {
          activeSheet = .taskComposer
        }
      }
    case .ai:
      RootNavigationContainer(tab: tab) {
        AIAssistantView(
          onOpenTasks: {
            selectedTab = .tasks
          },
          onQuickAddTask: {
            activeSheet = .taskComposer
          },
        )
      }
    case .profile:
      RootNavigationContainer(tab: tab, onOpenAI: {
        selectedTab = .ai
      }) {
        ProfileView()
      }
    }
  }
}

private struct RootNavigationContainer<Content: View>: View {
  let tab: AppTab
  let onOpenAI: (() -> Void)?
  let content: Content

  init(
    tab: AppTab,
    onOpenAI: (() -> Void)? = nil,
    @ViewBuilder content: () -> Content,
  ) {
    self.tab = tab
    self.onOpenAI = onOpenAI
    self.content = content()
  }

  var body: some View {
    NavigationStack {
      content
        .toolbar {
          if let onOpenAI {
            ToolbarItem(placement: .topBarTrailing) {
              Button(action: onOpenAI) {
                Image(systemName: "sparkles")
                  .font(.headline.weight(.semibold))
              }
              .accessibilityLabel("打开 AI 助手")
            }
          }
        }
    }
    .tint(.indigo)
    .toolbarBackground(.visible, for: .navigationBar)
    .toolbarBackground(Color.beeveNavigationBarBackground, for: .navigationBar)
  }
}

private struct RootTabSelectionBadge: View {
  let selectedTab: AppTab

  var body: some View {
    HStack(spacing: 8) {
      Image(systemName: selectedTab.selectedIcon)
        .font(.footnote.weight(.semibold))

      VStack(alignment: .leading, spacing: 1) {
        Text(selectedTab.title)
          .font(.footnote.weight(.semibold))

        Text(selectedTab.subtitle)
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
    }
    .foregroundStyle(.primary)
    .padding(.horizontal, 12)
    .padding(.vertical, 8)
    .background(.ultraThinMaterial, in: Capsule())
    .overlay {
      Capsule()
        .stroke(Color.beeveSeparator, lineWidth: 1)
    }
    .shadow(color: Color.black.opacity(0.12), radius: 10, y: 4)
  }
}

private struct TaskComposerSheet: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.modelContext) private var modelContext
  @Query private var notificationSettings: [NotificationSetting]

  @State private var title = ""
  @State private var note = ""
  @State private var priority: TaskItemPriority = .medium
  @State private var includeDueDate = false
  @State private var dueAt = Date().addingTimeInterval(60 * 60 * 4)
  @State private var includeReminder = false
  @State private var remindAt = Date().addingTimeInterval(60 * 60 * 6)
  @State private var repeatReminderDaily = false

  private var canSave: Bool {
    !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
  }

  var body: some View {
    NavigationStack {
      ZStack {
        BeevePageBackground()

        ScrollView(showsIndicators: false) {
          VStack(spacing: 20) {
            QuickComposerHeroCard()

            QuickComposerSectionCard(
              title: "事项内容",
              subtitle: "先把事情收进系统，再决定如何推进。",
              systemImage: "square.and.pencil",
            ) {
              VStack(spacing: 14) {
                QuickComposerInputField(
                  title: "标题",
                  text: $title,
                  placeholder: "例如：把会议记录整理成 3 条行动项",
                  systemImage: "text.cursor",
                )

                QuickComposerInputField(
                  title: "备注",
                  text: $note,
                  placeholder: "写一点上下文，晚些回来看也能秒懂。",
                  systemImage: "note.text",
                )
              }
            }

            QuickComposerSectionCard(
              title: "优先级与时间",
              subtitle: "只保留首发最关键的决策位。",
              systemImage: "flag.fill",
            ) {
              VStack(spacing: 16) {
                Picker("优先级", selection: $priority) {
                  ForEach(TaskItemPriority.allCases) { value in
                    Text(value.title).tag(value)
                  }
                }
                .pickerStyle(.segmented)

                Toggle(isOn: $includeDueDate) {
                  VStack(alignment: .leading, spacing: 2) {
                    Text("设置截止时间")
                    Text("适合今天必须推进的事项。")
                      .font(.footnote)
                      .foregroundStyle(.secondary)
                  }
                }
                .tint(.indigo)

                if includeDueDate {
                  DatePicker(
                    "截止时间",
                    selection: $dueAt,
                    displayedComponents: [.date, .hourAndMinute],
                  )
                  .datePickerStyle(.graphical)
                  .padding(12)
                  .beeveInputSurface(cornerRadius: 18)
                }
              }
            }

            QuickComposerSectionCard(
              title: "稍后提醒我",
              subtitle: "提醒不是单独对象，而是帮这条事项在合适的时间重新回来。",
              systemImage: "bell.badge.fill",
            ) {
              VStack(spacing: 16) {
                Toggle(isOn: $includeReminder) {
                  VStack(alignment: .leading, spacing: 2) {
                    Text("为这条事项添加提醒")
                    Text("适合需要在未来某个时点被重新拉回来的事项。")
                      .font(.footnote)
                      .foregroundStyle(.secondary)
                  }
                }
                .tint(.teal)

                if includeReminder {
                  DatePicker(
                    "提醒时间",
                    selection: $remindAt,
                    displayedComponents: [.date, .hourAndMinute],
                  )
                  .datePickerStyle(.graphical)
                  .padding(12)
                  .beeveInputSurface(cornerRadius: 18)

                  Toggle(isOn: $repeatReminderDaily) {
                    VStack(alignment: .leading, spacing: 2) {
                      Text("每天重复")
                      Text("适合日常复盘、回看和节奏型动作。")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    }
                  }
                  .tint(.teal)
                }
              }
            }
          }
          .padding(.horizontal, 16)
          .padding(.top, 12)
          .padding(.bottom, 28)
        }
      }
      .navigationTitle("快速收集")
      .navigationBarTitleDisplayMode(.inline)
      .safeAreaInset(edge: .bottom, spacing: 0) {
        HStack(spacing: 12) {
          Button(action: { dismiss() }) {
            Label("取消", systemImage: "xmark")
              .frame(maxWidth: .infinity)
          }
          .buttonStyle(ComposerSecondaryButtonStyle())

          Button(action: {
            Task {
              await saveTask()
            }
          }) {
            Label("保存事项", systemImage: "checkmark")
              .frame(maxWidth: .infinity)
          }
          .buttonStyle(ComposerPrimaryButtonStyle())
          .disabled(!canSave)
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
        .padding(.bottom, 12)
        .background(.ultraThinMaterial)
      }
    }
  }

  @MainActor
  private func saveTask() async {
    guard canSave else {
      return
    }

    let task = TaskItem(
      title: title.trimmingCharacters(in: .whitespacesAndNewlines),
      note: note.trimmingCharacters(in: .whitespacesAndNewlines),
      status: .inbox,
      priority: priority,
      dueAt: includeDueDate ? dueAt : nil,
    )

    modelContext.insert(task)

    do {
      if includeReminder {
        let setting = ensureNotificationSetting()
        let granted = try await NotificationService.shared.requestAuthorization()
        setting.authorizedStatus = granted ? "authorized" : "denied"
        setting.isReminderEnabled = granted

        var notificationIdentifier: String?
        if granted {
          notificationIdentifier = try await NotificationService.shared.scheduleReminder(
            ReminderDraft(
              title: task.title,
              note: task.note,
              scheduledAt: remindAt,
              repeatDaily: repeatReminderDaily,
              relatedProductId: nil,
              relatedTaskId: task.id,
            )
          )
        }

        modelContext.insert(
          ReminderItem(
            title: task.title,
            note: task.note,
            scheduledAt: remindAt,
            repeatRule: repeatReminderDaily ? "daily" : "none",
            relatedTaskId: task.id,
            notificationIdentifier: notificationIdentifier,
          )
        )
      }

      try modelContext.save()
      dismiss()
    } catch {
      assertionFailure("保存事项失败：\(error.localizedDescription)")
    }
  }

  private func ensureNotificationSetting() -> NotificationSetting {
    if let existingSetting = notificationSettings.first {
      return existingSetting
    }

    let newSetting = NotificationSetting()
    modelContext.insert(newSetting)
    return newSetting
  }
}

private struct QuickComposerHeroCard: View {
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

      Circle()
        .fill(.white.opacity(0.14))
        .frame(width: 180, height: 180)
        .offset(x: 120, y: -90)

      VStack(alignment: .leading, spacing: 12) {
        Text("先收进来，再决定怎么做")
          .font(.system(size: 28, weight: .bold, design: .rounded))
          .foregroundStyle(.white)

        Text("Beeve 首发聚焦个人执行闭环，所以快速收集必须足够轻。")
          .font(.subheadline)
          .foregroundStyle(.white.opacity(0.88))
          .fixedSize(horizontal: false, vertical: true)
      }
      .padding(22)
    }
    .frame(height: 220)
  }
}

private struct QuickComposerSectionCard<Content: View>: View {
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

private struct QuickComposerInputField: View {
  let title: String
  @Binding var text: String
  let placeholder: String
  let systemImage: String

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Label(title, systemImage: systemImage)
        .font(.subheadline.weight(.semibold))

      TextField(placeholder, text: $text, axis: .vertical)
        .textFieldStyle(.plain)
        .lineLimit(2...5)
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .beeveInputSurface(cornerRadius: 16)
    }
  }
}

private struct ComposerPrimaryButtonStyle: ButtonStyle {
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

private struct ComposerSecondaryButtonStyle: ButtonStyle {
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

private enum AIAssistantMode: String, CaseIterable, Identifiable {
  case ask
  case summarize
  case rewrite
  case extract

  var id: String {
    rawValue
  }

  var title: String {
    switch self {
    case .ask:
      "问我"
    case .summarize:
      "总结今天"
    case .rewrite:
      "整理表达"
    case .extract:
      "提取事项"
    }
  }
}

private struct AIAssistantView: View {
  @Query(sort: \TaskItem.createdAt, order: .forward) private var tasks: [TaskItem]
  @Query(sort: \ReminderItem.scheduledAt, order: .forward) private var reminders: [ReminderItem]

  let onOpenTasks: () -> Void
  let onQuickAddTask: () -> Void

  @State private var mode: AIAssistantMode = .extract
  @State private var inputText = ""
  @State private var outputText = ""

  var body: some View {
    ZStack {
      BeevePageBackground()

      ScrollView(showsIndicators: false) {
        VStack(spacing: 20) {
          AIAssistantHeroCard(taskCount: tasks.count, reminderCount: reminders.filter { !$0.isCompleted }.count)

          QuickComposerSectionCard(
            title: "AI 模式",
            subtitle: "优先用任务型入口，减少你先理解功能菜单的负担。",
            systemImage: "wand.and.stars",
          ) {
            Picker("AI 模式", selection: $mode) {
              ForEach(AIAssistantMode.allCases) { value in
                Text(value.title).tag(value)
              }
            }
            .pickerStyle(.segmented)
          }

          QuickComposerSectionCard(
            title: "输入",
            subtitle: "贴入会议纪要、灵感、聊天片段，或者直接说你想完成什么。",
            systemImage: "text.quote",
          ) {
            VStack(spacing: 12) {
              TextEditor(text: $inputText)
                .frame(minHeight: 160)
                .padding(12)
                .scrollContentBackground(.hidden)
                .background(Color.clear)
                .beeveInputSurface(cornerRadius: 18)

              HStack(spacing: 8) {
                ForEach(aiPromptSuggestions, id: \.self) { prompt in
                  Button(prompt) {
                    inputText = prompt
                  }
                  .font(.footnote.weight(.semibold))
                  .padding(.horizontal, 10)
                  .padding(.vertical, 8)
                  .background(Color.beeveChipBackground, in: Capsule())
                }
              }
              .frame(maxWidth: .infinity, alignment: .leading)
            }
          }

          if !outputText.isEmpty {
            QuickComposerSectionCard(
              title: "结果",
              subtitle: "下一步应该尽快落到事项，而不是停留在阅读结果。",
              systemImage: "sparkles.rectangle.stack",
            ) {
              VStack(alignment: .leading, spacing: 14) {
                Text(outputText)
                  .font(.body)
                  .foregroundStyle(.primary)
                  .frame(maxWidth: .infinity, alignment: .leading)
                  .padding(16)
                  .beeveElevatedSurface(cornerRadius: 20)

                HStack(spacing: 12) {
                  Button(action: onQuickAddTask) {
                    Label("新建事项", systemImage: "plus.circle.fill")
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
            }
          }
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
        .padding(.bottom, 28)
      }
    }
    .navigationTitle("AI 助手")
    .navigationBarTitleDisplayMode(.large)
    .safeAreaInset(edge: .bottom, spacing: 0) {
      Button(action: runAI) {
        Label("生成结果", systemImage: "sparkles")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(ComposerPrimaryButtonStyle())
      .padding(.horizontal, 16)
      .padding(.top, 12)
      .padding(.bottom, 12)
      .background(.ultraThinMaterial)
    }
  }

  private var aiPromptSuggestions: [String] {
    switch mode {
    case .ask:
      ["我现在先做哪一件？", "今天最重要的事是什么？"]
    case .summarize:
      ["帮我总结今天", "总结未完成内容"]
    case .rewrite:
      ["把这段话整理成清晰任务", "重写成更容易执行的描述"]
    case .extract:
      ["周四前把方案确认一下\n明天下午提醒我发邮件", "从这段话里提取事项并补提醒"]
    }
  }

  private func runAI() {
    let openTasks = tasks.filter { $0.status != .done && $0.status != .archived }
    let pendingReminders = reminders.filter { !$0.isCompleted }
    let todayTasks = openTasks.filter { task in
      guard let dueAt = task.dueAt else {
        return false
      }
      return Calendar.current.isDateInToday(dueAt)
    }

    switch mode {
    case .ask:
      if inputText.contains("提醒") {
        outputText = "当前有 \(pendingReminders.count) 条待触达提醒。建议把提醒视为事项的触发器：先看哪条提醒对应的事项最接近今天要推进的目标。"
      } else {
        let focusTasks = openTasks.sorted(by: taskSort).prefix(3).map(\.title)
        outputText = "今天建议优先推进：\(focusTasks.joined(separator: "、"))。如果你只有一小时，请先做最接近截止时间且优先级最高的那一项。"
      }
    case .summarize:
      outputText = "你当前有 \(openTasks.count) 条待推进事项，其中今天需要重点处理 \(todayTasks.count) 条，另有 \(pendingReminders.count) 条提醒负责把事项重新带回来。建议先清掉今天最紧的事项，再整理收件箱。"
    case .rewrite:
      let trimmed = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
      outputText = trimmed.isEmpty ? "请先输入要整理的文本。" : "建议重写为：\n\n行动目标：\(trimmed)\n下一步：明确输出物、截止时间和负责人（如果是自己，就写最先开始的一步）。"
    case .extract:
      let pieces = inputText
        .split(whereSeparator: { ["\n", "。", "；", ";"].contains(String($0)) })
        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty }
      if pieces.isEmpty {
        outputText = "请先输入一段文字，我会帮你拆成候选事项。"
      } else {
        let bulletList = pieces.prefix(5).enumerated().map { index, item in
          "\(index + 1). \(item)"
        }.joined(separator: "\n")
        outputText = "提取结果（候选）：\n\n事项：\n\(bulletList)\n\n提醒建议：若句子里包含“明天 / 下午 / 晚上”等时间词，可以在创建事项时顺手打开“稍后提醒我”。"
      }
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

private struct AIAssistantHeroCard: View {
  let taskCount: Int
  let reminderCount: Int

  var body: some View {
    ZStack(alignment: .bottomLeading) {
      RoundedRectangle(cornerRadius: 28, style: .continuous)
        .fill(
          LinearGradient(
            colors: [Color.indigo, Color.purple, Color.blue],
            startPoint: .topLeading,
            endPoint: .bottomTrailing,
          )
        )

      Circle()
        .fill(.white.opacity(0.14))
        .frame(width: 180, height: 180)
        .offset(x: 120, y: -90)

      VStack(alignment: .leading, spacing: 14) {
        Text("让 AI 直接服务于事项，而不是变成单独工具")
          .font(.system(size: 28, weight: .bold, design: .rounded))
          .foregroundStyle(.white)

        Text("当前端内已准备好 \(taskCount) 条事项和 \(reminderCount) 条提醒上下文，更适合做提取事项、总结今天和整理表达这类强任务动作。")
          .font(.subheadline)
          .foregroundStyle(.white.opacity(0.88))
          .fixedSize(horizontal: false, vertical: true)
      }
      .padding(22)
    }
    .frame(height: 220)
  }
}

#Preview("应用总览") {
  RootTabView()
    .modelContainer(makeBeevePreviewContainer())
}
