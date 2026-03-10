import Foundation

enum ProductCategory: String, CaseIterable, Identifiable, Hashable {
  case smartHome = "智能家居"
  case health = "健康生活"
  case office = "办公效率"

  var id: String {
    rawValue
  }

  var shortTitle: String {
    switch self {
    case .smartHome:
      "家居"
    case .health:
      "健康"
    case .office:
      "办公"
    }
  }

  var systemImage: String {
    switch self {
    case .smartHome:
      "house"
    case .health:
      "heart.text.square"
    case .office:
      "briefcase"
    }
  }

  var catalogScope: CatalogScope {
    switch self {
    case .smartHome:
      .smartHome
    case .health:
      .health
    case .office:
      .office
    }
  }
}

struct Product: Identifiable, Hashable {
  let id: String
  let title: String
  let subtitle: String
  let category: ProductCategory
  let priceText: String
  let summary: String
  let detail: String
  let tags: [String]
  let isFeatured: Bool
}

enum CatalogScope: String, CaseIterable, Identifiable, Hashable {
  case all = "全部"
  case featured = "精选"
  case smartHome = "家居"
  case health = "健康"
  case office = "办公"

  var id: String {
    rawValue
  }

  var description: String {
    switch self {
    case .all:
      "查看全部产品，并按分类快速浏览。"
    case .featured:
      "聚焦当前推荐的重点产品。"
    case .smartHome:
      "浏览家庭与居家场景的智能硬件。"
    case .health:
      "浏览健康管理与日常陪伴类产品。"
    case .office:
      "浏览办公效率与专注场景相关产品。"
    }
  }

  var systemImage: String {
    switch self {
    case .all:
      "square.grid.2x2"
    case .featured:
      "star"
    case .smartHome:
      ProductCategory.smartHome.systemImage
    case .health:
      ProductCategory.health.systemImage
    case .office:
      ProductCategory.office.systemImage
    }
  }

  func matches(_ product: Product) -> Bool {
    switch self {
    case .all:
      true
    case .featured:
      product.isFeatured
    case .smartHome:
      product.category == .smartHome
    case .health:
      product.category == .health
    case .office:
      product.category == .office
    }
  }
}

extension Product {
  func matches(searchText: String) -> Bool {
    let keyword = searchText.trimmingCharacters(in: .whitespacesAndNewlines)

    guard !keyword.isEmpty else {
      return true
    }

    let searchableTexts = [
      title,
      subtitle,
      summary,
      detail,
      category.rawValue,
    ] + tags

    return searchableTexts.contains { text in
      text.localizedCaseInsensitiveContains(keyword)
    }
  }
}

extension Product {
  static let samples: [Product] = [
    Product(
      id: "air-purifier-pro",
      title: "Air Purifier Pro",
      subtitle: "面向家庭场景的空气管理设备",
      category: .smartHome,
      priceText: "¥2,499",
      summary: "支持空气质量监测、自动净化与睡眠模式，适合作为首页推荐商品。",
      detail: "Air Purifier Pro 聚焦客厅与卧室双场景，提供静音运行、耗材提醒与移动端查看能力。首版可用它验证产品详情、收藏和提醒链路。",
      tags: ["推荐", "热销", "家庭场景"],
      isFeatured: true,
    ),
    Product(
      id: "health-cup-mini",
      title: "Health Cup Mini",
      subtitle: "便携式健康饮水设备",
      category: .health,
      priceText: "¥399",
      summary: "适合随身携带的轻量产品，用于验证分类浏览与详情展示。",
      detail: "Health Cup Mini 强调轻便、保温和饮水提醒，可与提醒模块形成天然联动，适合终端消费者日常使用。",
      tags: ["新品", "便携"],
      isFeatured: true,
    ),
    Product(
      id: "focus-desk-lamp",
      title: "Focus Desk Lamp",
      subtitle: "提升工作专注度的桌面照明设备",
      category: .office,
      priceText: "¥699",
      summary: "通过不同色温和亮度档位覆盖长时间办公需求。",
      detail: "Focus Desk Lamp 具备护眼模式、定时休息提醒与桌面风格适配能力，适合作为办公效率类产品示例。",
      tags: ["办公", "护眼"],
      isFeatured: false,
    ),
    Product(
      id: "sleep-sensor-lite",
      title: "Sleep Sensor Lite",
      subtitle: "轻量睡眠监测与睡前提醒设备",
      category: .health,
      priceText: "¥899",
      summary: "覆盖睡眠记录、睡前提醒和起床节律管理。",
      detail: "Sleep Sensor Lite 可以作为提醒模块的业务示例，未来还可扩展周期性提醒、睡眠数据趋势和会员服务。",
      tags: ["提醒联动", "健康"],
      isFeatured: false,
    ),
  ]
}
