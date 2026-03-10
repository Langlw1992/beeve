import SwiftData
import SwiftUI

struct ReminderListView: View {
  @Environment(\.modelContext) private var modelContext
  @Query(sort: \ReminderItem.scheduledAt, order: .forward) private var reminders: [ReminderItem]
  @Query private var notificationSettings: [NotificationSetting]

  @State private var isShowingComposer = false
  @State private var statusMessage: ReminderStatusMessage?

  private var pendingReminders: [ReminderItem] {
    reminders.filter { !$0.isCompleted }
  }

  private var completedReminders: [ReminderItem] {
    reminders.filter { $0.isCompleted }
  }

  private var remindersTodayCount: Int {
    reminders.filter { reminder in
      !reminder.isCompleted && Calendar.current.isDateInToday(reminder.scheduledAt)
    }.count
  }

  private var notificationStatusLabel: String {
    reminderNotificationStatusTitle(for: notificationSettings.first?.authorizedStatus ?? "notDetermined")
  }

  var body: some View {
    ZStack {
      BeevePageBackground()

      ScrollView(showsIndicators: false) {
        VStack(spacing: 20) {
          ReminderHeroCard(
            pendingCount: pendingReminders.count,
            completedCount: completedReminders.count,
            remindersTodayCount: remindersTodayCount,
            notificationStatusLabel: notificationStatusLabel,
            onCreateReminder: {
              isShowingComposer = true
            }
          )

          if let statusMessage {
            ReminderStatusBanner(message: statusMessage)
          }

          ReminderMetricsGrid(
            pendingCount: pendingReminders.count,
            completedCount: completedReminders.count,
            remindersTodayCount: remindersTodayCount,
            notificationStatusLabel: notificationStatusLabel,
          )

          if pendingReminders.isEmpty && completedReminders.isEmpty {
            ReminderEmptyCard(
              onCreateReminder: {
                isShowingComposer = true
              }
            )
          } else {
            if !pendingReminders.isEmpty {
              ReminderSectionCard(
                title: "待处理",
                subtitle: "这些提醒会负责把动作接起来。",
                systemImage: "bell.badge.fill",
              ) {
                VStack(spacing: 12) {
                  ForEach(pendingReminders) { reminder in
                    ReminderCard(
                      reminder: reminder,
                      isCompleted: false,
                      onComplete: {
                        completeReminder(reminder)
                      }
                    )
                  }
                }
              }
            }

            if !completedReminders.isEmpty {
              ReminderSectionCard(
                title: "已完成",
                subtitle: "完成过的提醒会变成你的节奏记录。",
                systemImage: "checkmark.seal.fill",
              ) {
                VStack(spacing: 12) {
                  ForEach(completedReminders) { reminder in
                    ReminderCard(reminder: reminder, isCompleted: true)
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
    .navigationTitle("提醒")
    .navigationBarTitleDisplayMode(.large)
    .safeAreaInset(edge: .bottom, spacing: 0) {
      ReminderActionBar {
        isShowingComposer = true
      }
    }
    .sheet(isPresented: $isShowingComposer) {
      ReminderEditorView(
        onSave: { draft in
          Task {
            await saveReminder(draft)
          }
        },
        onCancel: {
          isShowingComposer = false
        }
      )
    }
  }

  @MainActor
  private func saveReminder(_ draft: ReminderDraft) async {
    let setting = ensureNotificationSetting()

    do {
      let granted = try await NotificationService.shared.requestAuthorization()
      setting.authorizedStatus = granted ? "authorized" : "denied"
      setting.isReminderEnabled = granted

      var notificationIdentifier: String?
      if granted {
        notificationIdentifier = try await NotificationService.shared.scheduleReminder(draft)
      }

      let reminder = ReminderItem(
        title: draft.title,
        note: draft.note,
        scheduledAt: draft.scheduledAt,
        repeatRule: draft.repeatDaily ? "daily" : "none",
        notificationIdentifier: notificationIdentifier,
      )

      modelContext.insert(reminder)
      try modelContext.save()

      statusMessage = ReminderStatusMessage(
        text: granted
          ? "提醒已创建，并同步注册了本地通知。"
          : "提醒已创建，但当前通知权限未开启。",
        isError: false,
      )
      isShowingComposer = false
    } catch {
      statusMessage = ReminderStatusMessage(
        text: "提醒创建失败：\(error.localizedDescription)",
        isError: true,
      )
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
      statusMessage = ReminderStatusMessage(
        text: "提醒已完成，并已移除待发送通知。",
        isError: false,
      )
    } catch {
      statusMessage = ReminderStatusMessage(
        text: "更新提醒失败：\(error.localizedDescription)",
        isError: true,
      )
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

#Preview("提醒列表") {
  NavigationStack {
    ReminderListView()
  }
  .modelContainer(makeBeevePreviewContainer())
}

private struct ReminderHeroCard: View {
  let pendingCount: Int
  let completedCount: Int
  let remindersTodayCount: Int
  let notificationStatusLabel: String
  let onCreateReminder: () -> Void

  var body: some View {
    ZStack(alignment: .bottomLeading) {
      RoundedRectangle(cornerRadius: 28, style: .continuous)
        .fill(
          LinearGradient(
            colors: [Color.teal, Color.blue, Color.indigo],
            startPoint: .topLeading,
            endPoint: .bottomTrailing,
          )
        )
        .shadow(color: Color.teal.opacity(0.16), radius: 18, y: 12)

      Circle()
        .fill(.white.opacity(0.14))
        .frame(width: 180, height: 180)
        .offset(x: 120, y: -90)

      VStack(alignment: .leading, spacing: 18) {
        VStack(alignment: .leading, spacing: 8) {
          Text("提醒负责把动作真正接住")
            .font(.system(size: 30, weight: .bold, design: .rounded))
            .foregroundStyle(.white)

          Text("把事项推进链条里的“下一步”交给提醒，今天只处理真正会发生的那几条。")
            .font(.subheadline)
            .foregroundStyle(.white.opacity(0.88))
            .fixedSize(horizontal: false, vertical: true)
        }

        HStack(spacing: 10) {
          TodayHeroBadge(text: "\(pendingCount) 条待处理", systemImage: "bell.fill")
          TodayHeroBadge(text: "\(remindersTodayCount) 条今天触发", systemImage: "calendar")
          TodayHeroBadge(text: "通知\(notificationStatusLabel)", systemImage: "app.badge.fill")
        }

        Button(action: onCreateReminder) {
          Label("新建提醒", systemImage: "plus.circle.fill")
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(TodayPrimaryButtonStyle())
      }
      .padding(22)
    }
    .frame(height: 274)
  }
}

private struct ReminderMetricsGrid: View {
  let pendingCount: Int
  let completedCount: Int
  let remindersTodayCount: Int
  let notificationStatusLabel: String

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    LazyVGrid(columns: columns, spacing: 12) {
      ReminderMetricCard(title: "待处理", value: "\(pendingCount)", note: "还会继续提醒你")
      ReminderMetricCard(title: "今天触发", value: "\(remindersTodayCount)", note: "优先接住今天的动作")
      ReminderMetricCard(title: "已完成", value: "\(completedCount)", note: "说明节奏在发生")
      ReminderMetricCard(title: "通知状态", value: notificationStatusLabel, note: "决定是否能真实触达")
    }
  }
}

private struct ReminderMetricCard: View {
  let title: String
  let value: String
  let note: String

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      Text(title)
        .font(.subheadline)
        .foregroundStyle(.secondary)
      Text(value)
        .font(.system(size: 28, weight: .bold, design: .rounded))
      Text(note)
        .font(.footnote)
        .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, minHeight: 126, alignment: .leading)
    .padding(16)
    .beeveCardSurface(cornerRadius: 22)
  }
}

private struct ReminderEmptyCard: View {
  let onCreateReminder: () -> Void

  var body: some View {
    ReminderSectionCard(
      title: "还没有提醒",
      subtitle: "非常适合先加一条，把“知道要做”变成“会被提醒去做”。",
      systemImage: "bell.slash",
    ) {
      Button(action: onCreateReminder) {
        Label("创建第一条提醒", systemImage: "plus.circle.fill")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(TodayPrimaryButtonStyle())
    }
  }
}

private struct ReminderSectionCard<Content: View>: View {
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
          .foregroundStyle(.teal)
          .frame(width: 36, height: 36)
          .background(.teal.opacity(0.12), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

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

private struct ReminderCard: View {
  let reminder: ReminderItem
  let isCompleted: Bool
  var onComplete: (() -> Void)? = nil

  var body: some View {
    VStack(alignment: .leading, spacing: 14) {
      HStack(alignment: .top, spacing: 12) {
        VStack(alignment: .leading, spacing: 6) {
          Text(reminder.title)
            .font(.headline)
            .foregroundStyle(.primary)

          if !reminder.note.isEmpty {
            Text(reminder.note)
              .font(.subheadline)
              .foregroundStyle(.secondary)
              .lineLimit(2)
          }
        }

        Spacer(minLength: 12)

        TodayStateBadge(
          text: isCompleted ? "已完成" : "待提醒",
          color: isCompleted ? .green : .teal,
        )
      }

      HStack(spacing: 8) {
        TodayStateBadge(text: reminder.scheduledAt.beeveDisplayText, color: .orange)
        if reminder.repeatRule == "daily" {
          TodayStateBadge(text: "每日重复", color: .blue)
        }
      }

      if let onComplete {
        Button(action: onComplete) {
          Label("标记完成", systemImage: "checkmark")
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(TodayPrimaryButtonStyle())
      }
    }
    .padding(16)
    .beeveElevatedSurface(cornerRadius: 22)
    .opacity(isCompleted ? 0.86 : 1)
  }
}

private struct ReminderActionBar: View {
  let onCreateReminder: () -> Void

  var body: some View {
    Button(action: onCreateReminder) {
      Label("新建提醒", systemImage: "plus.circle.fill")
        .frame(maxWidth: .infinity)
    }
    .buttonStyle(TodayPrimaryButtonStyle())
    .padding(.horizontal, 16)
    .padding(.top, 12)
    .padding(.bottom, 12)
    .background(.ultraThinMaterial)
  }
}

private struct ReminderStatusBanner: View {
  let message: ReminderStatusMessage

  var body: some View {
    HStack(spacing: 12) {
      Image(systemName: message.isError ? "exclamationmark.triangle.fill" : "checkmark.seal.fill")
        .foregroundStyle(message.isError ? .red : .green)

      Text(message.text)
        .font(.subheadline)
        .foregroundStyle(.primary)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    .padding(14)
    .beeveCardSurface(cornerRadius: 20)
  }
}

private struct ReminderStatusMessage {
  let text: String
  let isError: Bool
}

private func reminderNotificationStatusTitle(for status: String) -> String {
  switch status {
  case "authorized":
    "已开启"
  case "denied":
    "未开启"
  default:
    "待确认"
  }
}
