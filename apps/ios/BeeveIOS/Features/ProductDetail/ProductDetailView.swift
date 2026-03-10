import SwiftData
import SwiftUI

struct ProductDetailView: View {
  @Environment(\.modelContext) private var modelContext
  @Query private var favorites: [FavoriteProduct]
  @Query private var notificationSettings: [NotificationSetting]
  @Query private var reminders: [ReminderItem]

  let product: Product

  @State private var isShowingReminderComposer = false
  @State private var statusMessage: ProductDetailStatusMessage?

  private var isFavorited: Bool {
    favorites.contains { $0.productId == product.id }
  }

  private var relatedReminderCount: Int {
    reminders.filter { $0.relatedProductId == product.id && !$0.isCompleted }.count
  }

  private var notificationStatusLabel: String {
    notificationStatusTitle(for: notificationSettings.first?.authorizedStatus ?? "notDetermined")
  }

  var body: some View {
    ZStack {
      BeevePageBackground()

      ScrollView(showsIndicators: false) {
        VStack(spacing: 20) {
          ProductDetailHeroCard(
            product: product,
            isFavorited: isFavorited,
            relatedReminderCount: relatedReminderCount,
          )

          if let statusMessage {
            ProductDetailStatusBanner(message: statusMessage)
          }

          ProductDetailMetricsGrid(
            product: product,
            isFavorited: isFavorited,
            relatedReminderCount: relatedReminderCount,
            notificationStatusTitle: notificationStatusLabel,
          )

          ProductDetailSectionCard(
            title: "产品亮点",
            subtitle: "把最值得理解的信息放在靠前位置，帮助用户快速决定是否继续操作。",
            systemImage: "sparkles",
          ) {
            VStack(alignment: .leading, spacing: 14) {
              Text(product.summary)
                .font(.body)
                .foregroundStyle(.primary)

              Text(product.detail)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
            }
          }

          ProductDetailSectionCard(
            title: "标签与定位",
            subtitle: "用更轻量的方式表达适用场景和产品定位。",
            systemImage: "tag.fill",
          ) {
            ScrollView(.horizontal, showsIndicators: false) {
              HStack(spacing: 10) {
                ProductDetailTag(text: product.category.rawValue, systemImage: product.category.systemImage)

                ForEach(product.tags, id: \.self) { tag in
                  ProductDetailTag(text: tag, systemImage: "sparkles")
                }
              }
              .padding(.horizontal, 1)
            }
          }

          ProductDetailSectionCard(
            title: "当前可做的事",
            subtitle: "先收藏、再观察、再设置提醒，是当前最自然的体验路径。",
            systemImage: "point.topleft.down.curvedto.point.bottomright.up",
          ) {
            VStack(spacing: 14) {
              ProductDetailInfoRow(
                title: "收藏状态",
                value: isFavorited ? "已加入收藏" : "尚未收藏",
                systemImage: isFavorited ? "heart.fill" : "heart",
                tint: isFavorited ? .pink : .secondary,
              )

              ProductDetailInfoRow(
                title: "提醒任务",
                value: relatedReminderCount == 0 ? "暂未设置" : "\(relatedReminderCount) 条进行中",
                systemImage: "bell.badge.fill",
                tint: .teal,
              )

              ProductDetailInfoRow(
                title: "通知权限",
                value: notificationStatusLabel,
                systemImage: "app.badge",
                tint: .indigo,
              )
            }
          }
        }
        .padding(.horizontal, 16)
        .padding(.top, 12)
        .padding(.bottom, 28)
      }
    }
    .navigationTitle(product.title)
    .navigationBarTitleDisplayMode(.inline)
    .safeAreaInset(edge: .bottom, spacing: 0) {
      ProductDetailActionBar(
        isFavorited: isFavorited,
        onToggleFavorite: toggleFavorite,
        onCreateReminder: {
          isShowingReminderComposer = true
        },
      )
    }
    .sheet(isPresented: $isShowingReminderComposer) {
      ReminderEditorView(
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
      statusMessage = ProductDetailStatusMessage(
        text: "已取消收藏，可继续浏览后再决定。",
        isError: false,
      )
    } else {
      modelContext.insert(FavoriteProduct(productId: product.id))
      statusMessage = ProductDetailStatusMessage(
        text: "已加入收藏，后续可以在“我的”里继续管理。",
        isError: false,
      )
    }

    do {
      try modelContext.save()
    } catch {
      statusMessage = ProductDetailStatusMessage(
        text: "收藏操作失败：\(error.localizedDescription)",
        isError: true,
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
        relatedProductId: product.id,
        notificationIdentifier: notificationIdentifier,
      )

      modelContext.insert(reminder)
      try modelContext.save()

      statusMessage = ProductDetailStatusMessage(
        text: granted
          ? "已为当前产品创建提醒，并同步注册本地通知。"
          : "已创建提醒，但当前通知权限未开启。",
        isError: false,
      )
      isShowingReminderComposer = false
    } catch {
      statusMessage = ProductDetailStatusMessage(
        text: "创建产品提醒失败：\(error.localizedDescription)",
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

#Preview("产品详情") {
  NavigationStack {
    ProductDetailView(product: Product.samples[0])
  }
  .modelContainer(productDetailPreviewContainer)
}

private struct ProductDetailHeroCard: View {
  let product: Product
  let isFavorited: Bool
  let relatedReminderCount: Int

  var body: some View {
    ZStack(alignment: .bottomLeading) {
      RoundedRectangle(cornerRadius: 28, style: .continuous)
        .fill(
          LinearGradient(
            colors: productGradient(for: product.category),
            startPoint: .topLeading,
            endPoint: .bottomTrailing,
          )
        )
        .shadow(color: Color.indigo.opacity(0.16), radius: 18, y: 12)

      Circle()
        .fill(.white.opacity(0.14))
        .frame(width: 180, height: 180)
        .offset(x: 120, y: -90)

      Circle()
        .fill(.white.opacity(0.08))
        .frame(width: 120, height: 120)
        .offset(x: 150, y: 84)

      VStack(alignment: .leading, spacing: 18) {
        HStack(alignment: .top) {
          ProductDetailTag(text: product.category.rawValue, systemImage: product.category.systemImage, inverted: true)

          Spacer()

          ProductDetailTag(
            text: isFavorited ? "已收藏" : "可收藏",
            systemImage: isFavorited ? "heart.fill" : "heart",
            inverted: true,
          )
        }

        VStack(alignment: .leading, spacing: 8) {
          Text(product.title)
            .font(.system(size: 30, weight: .bold, design: .rounded))
            .foregroundStyle(.white)
            .lineLimit(2)

          Text(product.subtitle)
            .font(.subheadline)
            .foregroundStyle(.white.opacity(0.88))
            .fixedSize(horizontal: false, vertical: true)
        }

        HStack(spacing: 10) {
          ProductDetailTag(text: product.priceText, systemImage: "creditcard.fill", inverted: true)
          ProductDetailTag(text: "\(relatedReminderCount) 条提醒", systemImage: "bell.fill", inverted: true)
        }
      }
      .padding(22)
    }
    .frame(maxWidth: .infinity)
    .frame(height: 250)
  }
}

private struct ProductDetailMetricsGrid: View {
  let product: Product
  let isFavorited: Bool
  let relatedReminderCount: Int
  let notificationStatusTitle: String

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    LazyVGrid(columns: columns, spacing: 12) {
      ProductDetailMetricCard(
        title: "价格",
        value: product.priceText,
        caption: "当前展示价格",
        systemImage: "creditcard.fill",
        tint: .orange,
      )

      ProductDetailMetricCard(
        title: "提醒",
        value: "\(relatedReminderCount)",
        caption: "关联中的进行中任务",
        systemImage: "bell.badge.fill",
        tint: .teal,
      )

      ProductDetailMetricCard(
        title: "收藏",
        value: isFavorited ? "已加入" : "未收藏",
        caption: "后续可在我的页查看",
        systemImage: isFavorited ? "heart.fill" : "heart",
        tint: .pink,
      )

      ProductDetailMetricCard(
        title: "通知",
        value: notificationStatusTitle,
        caption: "创建提醒时会更新权限状态",
        systemImage: "app.badge.fill",
        tint: .indigo,
      )
    }
  }
}

private struct ProductDetailMetricCard: View {
  let title: String
  let value: String
  let caption: String
  let systemImage: String
  let tint: Color

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        Image(systemName: systemImage)
          .font(.headline)
          .foregroundStyle(tint)

        Spacer()

        Text(title)
          .font(.footnote.weight(.medium))
          .foregroundStyle(.secondary)
      }

      Text(value)
        .font(.system(size: 24, weight: .bold, design: .rounded))
        .foregroundStyle(.primary)
        .lineLimit(1)
        .minimumScaleFactor(0.7)

      Text(caption)
        .font(.footnote)
        .foregroundStyle(.secondary)
        .lineLimit(2)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(16)
    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
    .overlay {
      RoundedRectangle(cornerRadius: 22, style: .continuous)
        .stroke(tint.opacity(0.12), lineWidth: 1)
    }
  }
}

private struct ProductDetailSectionCard<Content: View>: View {
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
            .foregroundStyle(.primary)

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

private struct ProductDetailInfoRow: View {
  let title: String
  let value: String
  let systemImage: String
  let tint: Color

  var body: some View {
    HStack(spacing: 12) {
      Image(systemName: systemImage)
        .foregroundStyle(tint)
        .frame(width: 24)

      Text(title)
        .foregroundStyle(.primary)

      Spacer()

      Text(value)
        .font(.subheadline.weight(.medium))
        .foregroundStyle(.secondary)
        .multilineTextAlignment(.trailing)
    }
  }
}

private struct ProductDetailTag: View {
  let text: String
  let systemImage: String
  var inverted = false

  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: systemImage)
      Text(text)
    }
    .font(.footnote.weight(.semibold))
    .foregroundStyle(inverted ? .white : .secondary)
    .padding(.horizontal, 10)
    .padding(.vertical, 8)
    .background(
      inverted ? Color.white.opacity(0.14) : Color.beeveChipBackground,
      in: Capsule(),
    )
  }
}

private struct ProductDetailStatusBanner: View {
  let message: ProductDetailStatusMessage

  var body: some View {
    HStack(spacing: 12) {
      Image(systemName: message.isError ? "xmark.octagon.fill" : "checkmark.circle.fill")
        .foregroundStyle(message.isError ? .red : .green)

      Text(message.text)
        .font(.subheadline)
        .foregroundStyle(.primary)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    .padding(14)
    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    .overlay {
      RoundedRectangle(cornerRadius: 18, style: .continuous)
        .stroke((message.isError ? Color.red : Color.green).opacity(0.18), lineWidth: 1)
    }
  }
}

private struct ProductDetailActionBar: View {
  let isFavorited: Bool
  let onToggleFavorite: () -> Void
  let onCreateReminder: () -> Void

  var body: some View {
    HStack(spacing: 12) {
      Button(action: onToggleFavorite) {
        Label(isFavorited ? "取消收藏" : "加入收藏", systemImage: isFavorited ? "heart.slash" : "heart.fill")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(ProductDetailSecondaryButtonStyle())

      Button(action: onCreateReminder) {
        Label("创建提醒", systemImage: "bell.badge.fill")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(ProductDetailPrimaryButtonStyle())
    }
    .padding(.horizontal, 16)
    .padding(.top, 12)
    .padding(.bottom, 12)
    .background(.ultraThinMaterial)
  }
}

private struct ProductDetailPrimaryButtonStyle: ButtonStyle {
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

private struct ProductDetailSecondaryButtonStyle: ButtonStyle {
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

private struct ProductDetailStatusMessage {
  let text: String
  let isError: Bool
}

private func productGradient(for category: ProductCategory) -> [Color] {
  switch category {
  case .smartHome:
    [Color.indigo, Color.blue, Color.cyan]
  case .health:
    [Color.green, Color.teal, Color.cyan]
  case .office:
    [Color.purple, Color.indigo, Color.blue]
  }
}

private func notificationStatusTitle(for rawValue: String) -> String {
  switch rawValue {
  case "authorized":
    "已授权"
  case "denied":
    "已关闭"
  case "provisional":
    "临时授权"
  case "ephemeral":
    "临时会话授权"
  default:
    "待确认"
  }
}

@MainActor
private let productDetailPreviewContainer: ModelContainer = {
  do {
    let configuration = ModelConfiguration(isStoredInMemoryOnly: true)
    let container = try ModelContainer(
      for: ReminderItem.self,
      UserProfile.self,
      NotificationSetting.self,
      FavoriteProduct.self,
      configurations: configuration,
    )

    let context = ModelContext(container)
    context.insert(
      NotificationSetting(
        isReminderEnabled: true,
        isMarketingEnabled: true,
        authorizedStatus: "authorized",
      )
    )
    context.insert(FavoriteProduct(productId: Product.samples[0].id))
    context.insert(
      ReminderItem(
        title: "关注滤芯更换周期",
        note: "面向 Air Purifier Pro",
        scheduledAt: Date().addingTimeInterval(24 * 60 * 60),
        relatedProductId: Product.samples[0].id,
      )
    )
    try context.save()
    return container
  } catch {
    fatalError("创建 ProductDetailView 预览容器失败：\(error.localizedDescription)")
  }
}()
