import SwiftUI

struct ReminderEditorView: View {
  let onSave: (ReminderDraft) -> Void
  let onCancel: () -> Void

  @State private var title: String = ""
  @State private var note: String = ""
  @State private var scheduledAt: Date = Date().addingTimeInterval(3600)
  @State private var repeatDaily = false

  private var canSave: Bool {
    !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
  }

  var body: some View {
    NavigationStack {
      ZStack {
        BeevePageBackground()

        ScrollView(showsIndicators: false) {
          VStack(spacing: 20) {
            ReminderEditorHeroCard(repeatDaily: repeatDaily)

            ReminderEditorSectionCard(
              title: "提醒内容",
              subtitle: "写得明确一点，真正响起时才知道要做什么。",
              systemImage: "text.alignleft",
            ) {
              VStack(spacing: 14) {
                ReminderEditorInputField(
                  title: "提醒标题",
                  text: $title,
                  placeholder: "例如：下午 3 点前回看今日焦点",
                  systemImage: "bell.badge",
                )

                ReminderEditorInputField(
                  title: "备注",
                  text: $note,
                  placeholder: "补充一点背景，提醒触发时更容易接上动作。",
                  systemImage: "note.text",
                )
              }
            }

            ReminderEditorSectionCard(
              title: "时间与频率",
              subtitle: "让提醒既准确，又不过度打扰。",
              systemImage: "calendar.badge.clock",
            ) {
              VStack(spacing: 16) {
                DatePicker(
                  "提醒时间",
                  selection: $scheduledAt,
                  displayedComponents: [.date, .hourAndMinute],
                )
                .datePickerStyle(.graphical)
                .padding(12)
                .beeveInputSurface(cornerRadius: 18)

                Toggle(isOn: $repeatDaily) {
                  VStack(alignment: .leading, spacing: 2) {
                    Text("每天重复")
                    Text("适合日常复盘、喝水、回顾任务等节奏型提醒。")
                      .font(.footnote)
                      .foregroundStyle(.secondary)
                  }
                }
                .tint(.teal)
              }
            }
          }
          .padding(.horizontal, 16)
          .padding(.top, 12)
          .padding(.bottom, 28)
        }
      }
      .navigationTitle("新建提醒")
      .navigationBarTitleDisplayMode(.inline)
      .safeAreaInset(edge: .bottom, spacing: 0) {
        ReminderEditorActionBar(
          canSave: canSave,
          onSave: saveDraft,
          onCancel: onCancel,
        )
      }
    }
  }

  private func saveDraft() {
    guard canSave else {
      return
    }

    onSave(
      ReminderDraft(
        title: title.trimmingCharacters(in: .whitespacesAndNewlines),
        note: note.trimmingCharacters(in: .whitespacesAndNewlines),
        scheduledAt: scheduledAt,
        repeatDaily: repeatDaily,
        relatedProductId: nil,
        relatedTaskId: nil,
      )
    )
  }
}

#Preview("新建提醒") {
  ReminderEditorView(
    onSave: { _ in },
    onCancel: {},
  )
}

private struct ReminderEditorHeroCard: View {
  let repeatDaily: Bool

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

      Circle()
        .fill(.white.opacity(0.14))
        .frame(width: 180, height: 180)
        .offset(x: 120, y: -90)

      VStack(alignment: .leading, spacing: 16) {
        Text("让提醒真正接住后续动作")
          .font(.system(size: 28, weight: .bold, design: .rounded))
          .foregroundStyle(.white)

        Text("Beeve 的提醒不是孤立存在，而是专门负责把你从“知道要做”推到“真的去做”。")
          .font(.subheadline)
          .foregroundStyle(.white.opacity(0.88))
          .fixedSize(horizontal: false, vertical: true)

        HStack(spacing: 10) {
          ReminderEditorBadge(
            text: repeatDaily ? "每日重复" : "单次提醒",
            systemImage: repeatDaily ? "repeat" : "clock.fill",
          )
          ReminderEditorBadge(text: "执行节奏", systemImage: "bolt.fill")
        }
      }
      .padding(22)
    }
    .frame(height: 230)
  }
}

private struct ReminderEditorSectionCard<Content: View>: View {
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

private struct ReminderEditorInputField: View {
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
        .lineLimit(3...6)
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .beeveInputSurface(cornerRadius: 16)
    }
  }
}

private struct ReminderEditorActionBar: View {
  let canSave: Bool
  let onSave: () -> Void
  let onCancel: () -> Void

  var body: some View {
    HStack(spacing: 12) {
      Button(action: onCancel) {
        Label("取消", systemImage: "xmark")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(ReminderEditorSecondaryButtonStyle())

      Button(action: onSave) {
        Label("保存提醒", systemImage: "checkmark")
          .frame(maxWidth: .infinity)
      }
      .buttonStyle(ReminderEditorPrimaryButtonStyle())
      .disabled(!canSave)
    }
    .padding(.horizontal, 16)
    .padding(.top, 12)
    .padding(.bottom, 12)
    .background(.ultraThinMaterial)
  }
}

private struct ReminderEditorBadge: View {
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
    .background(Color.white.opacity(0.14), in: Capsule())
  }
}

private struct ReminderEditorPrimaryButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.subheadline.weight(.semibold))
      .foregroundStyle(.white)
      .padding(.horizontal, 16)
      .padding(.vertical, 14)
      .background(
        LinearGradient(
          colors: [Color.teal, Color.blue],
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

private struct ReminderEditorSecondaryButtonStyle: ButtonStyle {
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
