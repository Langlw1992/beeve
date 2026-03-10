import SwiftData
import SwiftUI

struct ProfileView: View {
  @Environment(\.modelContext) private var modelContext
  @Query private var profiles: [UserProfile]
  @Query private var notificationSettings: [NotificationSetting]
  @Query private var favorites: [FavoriteProduct]

  @State private var statusMessage: String?

  var body: some View {
    List {
      if let profile = profiles.first, let notificationSetting = notificationSettings.first {
        ProfileEditorSection(
          profile: profile,
          notificationSetting: notificationSetting,
          favoriteCount: favorites.count,
        )
      } else {
        Section {
          Text("首次进入时先初始化本地资料和通知偏好。后续可接入登录与云同步。")
          Button("初始化我的资料") {
            bootstrapProfile()
          }
        } header: {
          Text("准备数据")
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
    .navigationTitle("我的")
  }

  private func bootstrapProfile() {
    if profiles.first == nil {
      modelContext.insert(UserProfile())
    }

    if notificationSettings.first == nil {
      modelContext.insert(NotificationSetting())
    }

    do {
      try modelContext.save()
      statusMessage = "已初始化个人资料与通知偏好。"
    } catch {
      statusMessage = "初始化失败：\(error.localizedDescription)"
    }
  }
}

#Preview("我的") {
  NavigationStack {
    ProfileView()
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

private struct ProfileEditorSection: View {
  @Bindable var profile: UserProfile
  @Bindable var notificationSetting: NotificationSetting

  let favoriteCount: Int

  var body: some View {
    Section {
      TextField("昵称", text: $profile.nickname)
      TextField("邮箱", text: $profile.email)
      TextField("手机号", text: $profile.phone)
      TextField("偏好分类", text: $profile.preferredCategory)
      Toggle(isOn: $profile.marketingOptIn) {
        Text("允许接收营销内容")
      }
      Toggle(isOn: $notificationSetting.isReminderEnabled) {
        Text("开启提醒通知")
      }
      Toggle(isOn: $notificationSetting.isMarketingEnabled) {
        Text("开启活动通知")
      }
      Text("通知授权状态：\(notificationSetting.authorizedStatus)")
      Text("已收藏产品数：\(favoriteCount)")
    } header: {
      Text("个人资料")
    }
  }
}
