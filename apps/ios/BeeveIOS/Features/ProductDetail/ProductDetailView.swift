import SwiftData
import SwiftUI

struct ProductDetailView: View {
  @Environment(\.modelContext) private var modelContext
  @Query private var favorites: [FavoriteProduct]
  @Query private var notificationSettings: [NotificationSetting]

  let product: Product

  @State private var isShowingReminderComposer = false
  @State private var statusMessage: String?

  private var isFavorited: Bool {
    favorites.contains { $0.productId == product.id }
  }

  var body: some View {
    List {
      Section {
        Text(product.subtitle)
        Text(product.detail)
        Text("标签：\(product.tags.joined(separator: "、"))")
      } header: {
        Text(product.title)
      }

      Section {
        Text("分类：\(product.category.rawValue)")
        Text("价格：\(product.priceText)")
      } header: {
        Text("基础信息")
      }

      Section {
        Button(isFavorited ? "取消收藏" : "收藏产品") {
          toggleFavorite()
        }

        Button("为产品创建提醒") {
          isShowingReminderComposer = true
        }
      } header: {
        Text("用户动作")
      }

      if let statusMessage {
        Section {
          Text(statusMessage)
        } header: {
          Text("状态")
        }
      }
    }
    .navigationTitle(product.title)
    .sheet(isPresented: $isShowingReminderComposer) {
      ReminderEditorView(
        product: product,
        onSave: { draft in
          Task {
            await saveReminder(draft)
          }
        },
        onCancel: {
          isShowingReminderComposer = false
        }
      )
    }
  }

  private func toggleFavorite() {
    if let existingFavorite = favorites.first(where: { $0.productId == product.id }) {
      modelContext.delete(existingFavorite)
      statusMessage = "已取消收藏。"
    } else {
      modelContext.insert(FavoriteProduct(productId: product.id))
      statusMessage = "已加入收藏。"
    }

    do {
      try modelContext.save()
    } catch {
      statusMessage = "收藏操作失败：\(error.localizedDescription)"
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
        relatedProductId: product.id,
        notificationIdentifier: notificationIdentifier,
      )

      modelContext.insert(reminder)
      try modelContext.save()

      statusMessage = granted
        ? "已为当前产品创建提醒，并同步注册本地通知。"
        : "已为当前产品创建提醒，但当前通知权限未开启。"
      isShowingReminderComposer = false
    } catch {
      statusMessage = "创建产品提醒失败：\(error.localizedDescription)"
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

#Preview("产品详情") {
  NavigationStack {
    ProductDetailView(product: Product.samples[0])
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
