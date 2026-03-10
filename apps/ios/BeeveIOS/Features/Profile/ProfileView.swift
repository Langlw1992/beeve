import SwiftData
import SwiftUI

struct ProfileView: View {
  @Environment(\.modelContext) private var modelContext
  @Query private var profiles: [UserProfile]
  @Query private var notificationSettings: [NotificationSetting]
  @Query(sort: \TaskItem.createdAt, order: .forward) private var tasks: [TaskItem]
  @Query(sort: \ReminderItem.scheduledAt, order: .forward) private var reminders: [ReminderItem]

  @State private var statusBanner: ProfileStatusBanner?

  private var activeReminderCount: Int {
    reminders.filter { !$0.isCompleted }.count
  }

  private var openTaskCount: Int {
    tasks.filter { $0.status != .done && $0.status != .archived }.count
  }

  private var completedThisWeekCount: Int {
    let calendar = Calendar.current
    return tasks.filter { task in
      guard let completedAt = task.completedAt else {
        return false
      }
      return calendar.isDate(completedAt, equalTo: Date(), toGranularity: .weekOfYear)
    }.count
  }

  var body: some View {
    ZStack {
      BeevePageBackground()

      if let profile = profiles.first, let notificationSetting = notificationSettings.first {
        ProfileLoadedView(
          profile: profile,
          notificationSetting: notificationSetting,
          openTaskCount: openTaskCount,
          activeReminderCount: activeReminderCount,
          completedThisWeekCount: completedThisWeekCount,
          statusBanner: statusBanner,
          onSave: saveChanges,
        )
      } else {
        ScrollView(showsIndicators: false) {
          VStack(spacing: 20) {
            if let statusBanner {
              ProfileStatusBannerView(banner: statusBanner)
            }

            ProfileSetupCard {
              bootstrapProfile()
            }
          }
          .padding(.horizontal, 16)
          .padding(.top, 20)
          .padding(.bottom, 28)
        }
      }
    }
    .navigationTitle("我的")
    .navigationBarTitleDisplayMode(.large)
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
      statusBanner = ProfileStatusBanner(
        text: "已初始化个人资料与通知偏好，可以继续完善自己的执行节奏。",
        isError: false,
      )
    } catch {
      statusBanner = ProfileStatusBanner(
        text: "初始化失败：\(error.localizedDescription)",
        isError: true,
      )
    }
  }

  private func saveChanges() {
    do {
      try modelContext.save()
      statusBanner = ProfileStatusBanner(
        text: "个人资料与偏好已保存。",
        isError: false,
      )
    } catch {
      statusBanner = ProfileStatusBanner(
        text: "保存失败：\(error.localizedDescription)",
        isError: true,
      )
    }
  }
}

#Preview("我的") {
  NavigationStack {
    ProfileView()
  }
  .modelContainer(makeBeevePreviewContainer())
}

private struct ProfileLoadedView: View {
  @Bindable var profile: UserProfile
  @Bindable var notificationSetting: NotificationSetting

  let openTaskCount: Int
  let activeReminderCount: Int
  let completedThisWeekCount: Int
  let statusBanner: ProfileStatusBanner?
  let onSave: () -> Void

  private var completion: Double {
    profileCompletion(for: profile)
  }

  private var notificationStatusDescriptor: NotificationStatusDescriptor {
    notificationStatus(for: notificationSetting.authorizedStatus)
  }

  var body: some View {
    ScrollView(showsIndicators: false) {
      VStack(spacing: 20) {
        ProfileHeroCard(
          profile: profile,
          openTaskCount: openTaskCount,
          activeReminderCount: activeReminderCount,
          completedThisWeekCount: completedThisWeekCount,
          completion: completion,
        )

        if let statusBanner {
          ProfileStatusBannerView(banner: statusBanner)
        }

        ProfileMetricsGrid(
          openTaskCount: openTaskCount,
          activeReminderCount: activeReminderCount,
          completedThisWeekCount: completedThisWeekCount,
          notificationStatus: notificationStatusDescriptor,
        )

        ProfileSectionCard(
          title: "账号信息",
          subtitle: "先把个人资料整理清楚，后续接登录和同步会更顺。",
          systemImage: "person.text.rectangle",
        ) {
          VStack(spacing: 14) {
            ProfileInputField(
              title: "昵称",
              text: $profile.nickname,
              placeholder: "给自己一个好认的名字",
              systemImage: "person.fill",
            )

            ProfileInputField(
              title: "邮箱",
              text: $profile.email,
              placeholder: "后续可用于登录与同步",
              systemImage: "envelope.fill",
            )

            ProfileInputField(
              title: "手机号",
              text: $profile.phone,
              placeholder: "也可以留空，后续再补",
              systemImage: "phone.fill",
            )
          }
        }

        ProfileSectionCard(
          title: "执行偏好",
          subtitle: "先保留几个最基础的个性化选项。",
          systemImage: "slider.horizontal.3",
        ) {
          VStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
              Label("当前偏好方向", systemImage: "sparkles")
                .font(.subheadline.weight(.semibold))

              TextField("例如：工作效率 / 专注执行 / 轻量复盘", text: $profile.preferredCategory)
                .textFieldStyle(.plain)
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .beeveInputSurface(cornerRadius: 16)
            }

            Toggle(isOn: $notificationSetting.isReminderEnabled) {
              VStack(alignment: .leading, spacing: 2) {
                Text("提醒通知")
                Text("决定提醒是否真正触达你。")
                  .font(.footnote)
                  .foregroundStyle(.secondary)
              }
            }
            .tint(.indigo)

            Toggle(isOn: $profile.marketingOptIn) {
              VStack(alignment: .leading, spacing: 2) {
                Text("接收产品更新")
                Text("首发先保留这个开关，后续可以替换为更多产品偏好。")
                  .font(.footnote)
                  .foregroundStyle(.secondary)
              }
            }
            .tint(.indigo)
          }
        }

        ProfileSectionCard(
          title: "节奏复盘",
          subtitle: "最小版先只保留你真正会关心的几个数字。",
          systemImage: "chart.bar.fill",
        ) {
          VStack(spacing: 12) {
            ProfileInsightRow(title: "本周完成事项", value: "\(completedThisWeekCount) 条")
            ProfileInsightRow(title: "当前待推进事项", value: "\(openTaskCount) 条")
            ProfileInsightRow(title: "当前待处理提醒", value: "\(activeReminderCount) 条")
            ProfileInsightRow(title: "通知状态", value: notificationStatusDescriptor.title)
          }
        }

        Button(action: onSave) {
          Label("保存设置", systemImage: "checkmark.circle.fill")
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(TodayPrimaryButtonStyle())
      }
      .padding(.horizontal, 16)
      .padding(.top, 12)
      .padding(.bottom, 28)
    }
  }
}

private struct ProfileHeroCard: View {
  let profile: UserProfile
  let openTaskCount: Int
  let activeReminderCount: Int
  let completedThisWeekCount: Int
  let completion: Double

  private var avatarText: String {
    let trimmedName = profile.nickname.trimmingCharacters(in: .whitespacesAndNewlines)
    return String(trimmedName.first ?? Character("B"))
  }

  private var subtitle: String {
    if !profile.email.isEmpty {
      return profile.email
    }

    if !profile.phone.isEmpty {
      return profile.phone
    }

    return "先完成最小资料配置，后续更容易接登录、同步与通知。"
  }

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
        .shadow(color: Color.indigo.opacity(0.18), radius: 18, y: 12)

      Circle()
        .fill(.white.opacity(0.14))
        .frame(width: 180, height: 180)
        .offset(x: 110, y: -84)

      VStack(alignment: .leading, spacing: 18) {
        HStack(alignment: .top) {
          ZStack {
            Circle()
              .fill(.white.opacity(0.18))
              .frame(width: 68, height: 68)

            Text(avatarText)
              .font(.system(size: 28, weight: .bold, design: .rounded))
              .foregroundStyle(.white)
          }

          Spacer()

          ProfileBadge(text: "已就绪", systemImage: "checkmark.seal.fill")
        }

        VStack(alignment: .leading, spacing: 6) {
          Text(profile.nickname.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Beeve 用户" : profile.nickname)
            .font(.system(size: 30, weight: .bold, design: .rounded))
            .foregroundStyle(.white)

          Text(subtitle)
            .font(.subheadline)
            .foregroundStyle(.white.opacity(0.86))
        }

        HStack(spacing: 10) {
          ProfileBadge(text: "\(openTaskCount) 条待办", systemImage: "checklist")
          ProfileBadge(text: "\(activeReminderCount) 条提醒", systemImage: "bell.fill")
          ProfileBadge(text: "本周完成 \(completedThisWeekCount)", systemImage: "chart.bar.fill")
        }

        VStack(alignment: .leading, spacing: 8) {
          HStack {
            Text("资料完整度")
              .font(.footnote.weight(.medium))
              .foregroundStyle(.white.opacity(0.88))

            Spacer()

            Text("\(Int(completion * 100))%")
              .font(.footnote.weight(.semibold))
              .foregroundStyle(.white)
          }

          ProgressView(value: completion)
            .progressViewStyle(.linear)
            .tint(.white)
            .background(.white.opacity(0.14))
            .clipShape(Capsule())
        }
      }
      .padding(22)
    }
    .frame(height: 278)
  }
}

private struct ProfileMetricsGrid: View {
  let openTaskCount: Int
  let activeReminderCount: Int
  let completedThisWeekCount: Int
  let notificationStatus: NotificationStatusDescriptor

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    LazyVGrid(columns: columns, spacing: 12) {
      ProfileMetricCard(title: "当前待办", value: "\(openTaskCount)", note: "需要推进")
      ProfileMetricCard(title: "活跃提醒", value: "\(activeReminderCount)", note: "帮助接动作")
      ProfileMetricCard(title: "本周完成", value: "\(completedThisWeekCount)", note: "执行反馈")
      ProfileMetricCard(title: "通知状态", value: notificationStatus.title, note: notificationStatus.description)
    }
  }
}

private struct ProfileMetricCard: View {
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

private struct ProfileSectionCard<Content: View>: View {
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

private struct ProfileInputField: View {
  let title: String
  @Binding var text: String
  let placeholder: String
  let systemImage: String

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Label(title, systemImage: systemImage)
        .font(.subheadline.weight(.semibold))

      TextField(placeholder, text: $text)
        .textFieldStyle(.plain)
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .beeveInputSurface(cornerRadius: 16)
    }
  }
}

private struct ProfileInsightRow: View {
  let title: String
  let value: String

  var body: some View {
    HStack {
      Text(title)
        .foregroundStyle(.secondary)
      Spacer()
      Text(value)
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(.primary)
    }
    .padding(.vertical, 2)
  }
}

private struct ProfileStatusBannerView: View {
  let banner: ProfileStatusBanner

  var body: some View {
    HStack(spacing: 12) {
      Image(systemName: banner.isError ? "exclamationmark.triangle.fill" : "checkmark.seal.fill")
        .foregroundStyle(banner.isError ? .red : .green)

      Text(banner.text)
        .font(.subheadline)
        .foregroundStyle(.primary)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    .padding(14)
    .beeveCardSurface(cornerRadius: 20)
  }
}

private struct ProfileSetupCard: View {
  let onBootstrap: () -> Void

  var body: some View {
    ProfileSectionCard(
      title: "初始化我的页",
      subtitle: "先创建个人资料和通知偏好，后续再逐步补齐。",
      systemImage: "sparkles.rectangle.stack",
    ) {
      Button(action: onBootstrap) {
        Label("开始初始化", systemImage: "wand.and.stars")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(TodayPrimaryButtonStyle())
    }
  }
}

private struct ProfileBadge: View {
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

private struct ProfileStatusBanner {
  let text: String
  let isError: Bool
}

private struct NotificationStatusDescriptor {
  let title: String
  let description: String
}

private func profileCompletion(for profile: UserProfile) -> Double {
  let items = [
    !profile.nickname.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
    !profile.email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
    !profile.phone.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
    !profile.preferredCategory.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
  ]

  let completedCount = items.filter { $0 }.count
  return Double(completedCount) / Double(items.count)
}

private func notificationStatus(for status: String) -> NotificationStatusDescriptor {
  switch status {
  case "authorized":
    NotificationStatusDescriptor(title: "已开启", description: "提醒会正常触达")
  case "denied":
    NotificationStatusDescriptor(title: "未开启", description: "建议在系统设置里打开")
  default:
    NotificationStatusDescriptor(title: "待确认", description: "首次创建提醒时会请求")
  }
}
