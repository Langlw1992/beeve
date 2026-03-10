import SwiftData
import SwiftUI

struct ReminderListView: View {
  @Environment(\.modelContext) private var modelContext
  @Query(sort: \ReminderItem.scheduledAt, order: .forward)
  private var reminders: [ReminderItem]
  @Query private var notificationSettings: [NotificationSetting]

  let products: [Product]

  @State private var isShowingComposer = false
  @State private var statusMessage: String?

  private var pendingReminders: [ReminderItem] {
    reminders.filter { !$0.isCompleted }
  }

  private var completedReminders: [ReminderItem] {
    reminders.filter { $0.isCompleted }
  }

  var body: some View {
    List {
      Section {
        Text("新建提醒时会在有上下文的时机申请通知权限，符合 Apple 对通知授权的推荐做法。")
        Text("当前已准备 \(products.count) 个产品，可在产品详情页创建关联提醒。")
      } header: {
        Text("提醒说明")
      }

      if pendingReminders.isEmpty && completedReminders.isEmpty {
        Section {
          EmptyStateView(
            title: "还没有提醒",
            message: "先创建一条提醒，验证 SwiftData 持久化与本地通知调度流程。",
          )
        }
      }

      if !pendingReminders.isEmpty {
        Section {
          ForEach(pendingReminders) { reminder in
            VStack(alignment: .leading, spacing: 6) {
              Text(reminder.title)
              Text(reminder.scheduledAt.beeveDisplayText)
              if !reminder.note.isEmpty {
                Text(reminder.note)
              }
              Button("完成提醒") {
                completeReminder(reminder)
              }
            }
            .padding(.vertical, 4)
          }
        } header: {
          Text("待处理")
        }
      }

      if !completedReminders.isEmpty {
        Section {
          ForEach(completedReminders) { reminder in
            VStack(alignment: .leading, spacing: 6) {
              Text(reminder.title)
              Text("已完成 · \(reminder.updatedAt.beeveDisplayText)")
            }
            .padding(.vertical, 4)
          }
        } header: {
          Text("已完成")
        }
      }

      Section {
        Button("新建提醒") {
          isShowingComposer = true
        }
      }

      if let statusMessage {
        Section {
          Text(statusMessage)
        } header: {
          Text("状态")
        }
      }
    }
    .navigationTitle("提醒")
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
        relatedProductId: draft.relatedProductId,
        notificationIdentifier: notificationIdentifier,
      )

      modelContext.insert(reminder)
      try modelContext.save()

      statusMessage = granted
        ? "提醒已创建，并同步注册了本地通知。"
        : "提醒已创建，但当前通知权限未开启。"
      isShowingComposer = false
    } catch {
      statusMessage = "提醒创建失败：\(error.localizedDescription)"
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
      statusMessage = "提醒已完成，并已移除待发送通知。"
    } catch {
      statusMessage = "更新提醒失败：\(error.localizedDescription)"
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
    ReminderListView(products: Product.samples)
  }
  .modelContainer(
    for: [
      ReminderItem.self,
      UserProfile.self,
      NotificationSetting.self,
      FavoriteProduct.self,
    ],
    inMemory: true,
  )
}
