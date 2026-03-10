import Foundation
import SwiftData

enum TaskItemStatus: String, CaseIterable, Identifiable {
  case inbox
  case todo
  case doing
  case done
  case archived

  var id: String {
    rawValue
  }

  var title: String {
    switch self {
    case .inbox:
      "收件箱"
    case .todo:
      "待处理"
    case .doing:
      "进行中"
    case .done:
      "已完成"
    case .archived:
      "已归档"
    }
  }
}

enum TaskItemPriority: String, CaseIterable, Identifiable {
  case high
  case medium
  case low

  var id: String {
    rawValue
  }

  var title: String {
    switch self {
    case .high:
      "高优先级"
    case .medium:
      "中优先级"
    case .low:
      "低优先级"
    }
  }
}

@Model
final class TaskItem {
  var id: String
  var title: String
  var note: String
  var statusRawValue: String
  var priorityRawValue: String
  var dueAt: Date?
  var plannedAt: Date?
  var completedAt: Date?
  var aiGenerated: Bool
  var createdAt: Date
  var updatedAt: Date

  init(
    id: String = UUID().uuidString,
    title: String,
    note: String = "",
    status: TaskItemStatus = .inbox,
    priority: TaskItemPriority = .medium,
    dueAt: Date? = nil,
    plannedAt: Date? = nil,
    completedAt: Date? = nil,
    aiGenerated: Bool = false,
    createdAt: Date = Date(),
    updatedAt: Date = Date(),
  ) {
    self.id = id
    self.title = title
    self.note = note
    self.statusRawValue = status.rawValue
    self.priorityRawValue = priority.rawValue
    self.dueAt = dueAt
    self.plannedAt = plannedAt
    self.completedAt = completedAt
    self.aiGenerated = aiGenerated
    self.createdAt = createdAt
    self.updatedAt = updatedAt
  }

  var status: TaskItemStatus {
    get {
      TaskItemStatus(rawValue: statusRawValue) ?? .inbox
    }
    set {
      statusRawValue = newValue.rawValue
    }
  }

  var priority: TaskItemPriority {
    get {
      TaskItemPriority(rawValue: priorityRawValue) ?? .medium
    }
    set {
      priorityRawValue = newValue.rawValue
    }
  }
}

@Model
final class ReminderItem {
  var id: String
  var title: String
  var note: String
  var scheduledAt: Date
  var repeatRule: String
  var isCompleted: Bool
  var relatedProductId: String?
  var relatedTaskId: String?
  var notificationIdentifier: String?
  var createdAt: Date
  var updatedAt: Date

  init(
    id: String = UUID().uuidString,
    title: String,
    note: String = "",
    scheduledAt: Date,
    repeatRule: String = "none",
    isCompleted: Bool = false,
    relatedProductId: String? = nil,
    relatedTaskId: String? = nil,
    notificationIdentifier: String? = nil,
    createdAt: Date = Date(),
    updatedAt: Date = Date(),
  ) {
    self.id = id
    self.title = title
    self.note = note
    self.scheduledAt = scheduledAt
    self.repeatRule = repeatRule
    self.isCompleted = isCompleted
    self.relatedProductId = relatedProductId
    self.relatedTaskId = relatedTaskId
    self.notificationIdentifier = notificationIdentifier
    self.createdAt = createdAt
    self.updatedAt = updatedAt
  }
}

extension TaskItem {
  static let previewTodayFocusID = "preview-task-today-focus"
  static let previewReviewID = "preview-task-review"

  static var previewItems: [TaskItem] {
    [
      TaskItem(
        id: previewTodayFocusID,
        title: "整理今天最重要的 3 件事",
        note: "优先把真正会影响推进节奏的事项拎出来。",
        status: .doing,
        priority: .high,
        dueAt: Date().addingTimeInterval(60 * 60 * 2),
      ),
      TaskItem(
        id: previewReviewID,
        title: "回顾本周提醒完成情况",
        note: "看哪些提醒需要调频或合并。",
        status: .todo,
        priority: .medium,
        dueAt: Date().addingTimeInterval(60 * 60 * 8),
      ),
      TaskItem(
        title: "把会议记录整理成行动项",
        note: "后续可直接接 AI 提取。",
        status: .inbox,
        priority: .high,
        aiGenerated: true,
      ),
      TaskItem(
        title: "整理资料后发给对方",
        note: "已完成，保留作今日成就感来源。",
        status: .done,
        priority: .medium,
        dueAt: Date().addingTimeInterval(-60 * 60 * 4),
        completedAt: Date().addingTimeInterval(-60 * 20),
      ),
    ]
  }
}

extension ReminderItem {
  static var previewItems: [ReminderItem] {
    [
      ReminderItem(
        title: "下午 3 点前确认今日焦点",
        note: "确保最重要事项没有偏航。",
        scheduledAt: Date().addingTimeInterval(60 * 60 * 3),
        relatedTaskId: TaskItem.previewTodayFocusID,
      ),
      ReminderItem(
        title: "晚上复盘未完成事项",
        note: "决定是延后还是继续保留。",
        scheduledAt: Date().addingTimeInterval(60 * 60 * 9),
        repeatRule: "daily",
        relatedTaskId: TaskItem.previewReviewID,
      ),
      ReminderItem(
        title: "提交日报",
        note: "这条提醒已完成。",
        scheduledAt: Date().addingTimeInterval(-60 * 60 * 2),
        isCompleted: true,
      ),
    ]
  }
}

@MainActor
func makeBeevePreviewContainer(seedData: Bool = true) -> ModelContainer {
  do {
    let container = try ModelContainer(
      for: TaskItem.self,
      ReminderItem.self,
      UserProfile.self,
      NotificationSetting.self,
      FavoriteProduct.self,
      configurations: ModelConfiguration(isStoredInMemoryOnly: true),
    )

    guard seedData else {
      return container
    }

    let context = container.mainContext
    TaskItem.previewItems.forEach { context.insert($0) }
    ReminderItem.previewItems.forEach { context.insert($0) }
    context.insert(
      UserProfile(
        nickname: "Lang",
        email: "lang@example.com",
        phone: "13800000000",
        preferredCategory: "工作效率",
        marketingOptIn: false,
      )
    )
    context.insert(
      NotificationSetting(
        isReminderEnabled: true,
        isMarketingEnabled: false,
        authorizedStatus: "authorized",
      )
    )
    return container
  } catch {
    fatalError("创建 Beeve 预览容器失败：\(error.localizedDescription)")
  }
}
