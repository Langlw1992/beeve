import Foundation

enum AppTab: Hashable, CaseIterable {
  case today
  case tasks
  case ai
  case profile

  var title: String {
    switch self {
    case .today:
      "今日"
    case .tasks:
      "事项"
    case .ai:
      "AI"
    case .profile:
      "我的"
    }
  }

  var defaultIcon: String {
    switch self {
    case .today:
      "sun.max"
    case .tasks:
      "checklist"
    case .ai:
      "sparkles"
    case .profile:
      "person.crop.circle"
    }
  }

  var selectedIcon: String {
    switch self {
    case .today:
      "sun.max.fill"
    case .tasks:
      "checklist.checked"
    case .ai:
      "sparkles.rectangle.stack.fill"
    case .profile:
      "person.crop.circle.fill"
    }
  }

  var subtitle: String {
    switch self {
    case .today:
      "聚焦今天"
    case .tasks:
      "收集与推进"
    case .ai:
      "整理与提取"
    case .profile:
      "偏好与复盘"
    }
  }
}
