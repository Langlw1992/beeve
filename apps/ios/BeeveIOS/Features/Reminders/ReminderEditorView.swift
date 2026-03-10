import SwiftUI

struct ReminderEditorView: View {
  let product: Product?
  let onSave: (ReminderDraft) -> Void
  let onCancel: () -> Void

  @State private var title: String = ""
  @State private var note: String = ""
  @State private var scheduledAt: Date = Date().addingTimeInterval(3600)
  @State private var repeatDaily = false

  init(
    product: Product? = nil,
    onSave: @escaping (ReminderDraft) -> Void,
    onCancel: @escaping () -> Void,
  ) {
    self.product = product
    self.onSave = onSave
    self.onCancel = onCancel
    _title = State(initialValue: product.map { "关注 \($0.title)" } ?? "")
  }

  var body: some View {
    NavigationStack {
      Form {
        if let product {
          Text("关联产品：\(product.title)")
        }

        TextField("提醒标题", text: $title)
        TextField("备注", text: $note)
        DatePicker("提醒时间", selection: $scheduledAt)
        Toggle(isOn: $repeatDaily) {
          Text("每天重复")
        }

        Button("保存提醒") {
          onSave(
            ReminderDraft(
              title: title,
              note: note,
              scheduledAt: scheduledAt,
              repeatDaily: repeatDaily,
              relatedProductId: product?.id,
            )
          )
        }

        Button("取消") {
          onCancel()
        }
      }
      .navigationTitle("新建提醒")
    }
  }
}

#Preview("新建提醒") {
  ReminderEditorView(
    product: Product.samples[1],
    onSave: { _ in },
    onCancel: {},
  )
}
