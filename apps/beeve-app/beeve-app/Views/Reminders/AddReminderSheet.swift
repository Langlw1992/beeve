import SwiftUI

struct AddReminderSheet: View {
    @Environment(BeeveStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var note = ""
    @State private var dueDate = Date.now.addingTimeInterval(60 * 60)
    @State private var shouldSchedule = false
    @State private var category: ReminderCategory = .work
    @State private var priority: ReminderPriority = .medium

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackgroundView()

                ScrollView {
                    VStack(spacing: AppSpacing.section) {
                        GlassSection(title: "事项", symbol: "square.and.pencil", tint: .blue) {
                            VStack(spacing: 12) {
                                TextField("提醒标题", text: $title)
                                    .textFieldStyle(.roundedBorder)

                                TextField("备注（可选）", text: $note, axis: .vertical)
                                    .textFieldStyle(.roundedBorder)
                                    .lineLimit(2...4)
                            }
                        }

                        GlassSection(title: "安排方式", symbol: "calendar.badge.clock", tint: .purple) {
                            VStack(alignment: .leading, spacing: 12) {
                                Toggle("立即安排时间", isOn: $shouldSchedule)
                                Text(shouldSchedule ? "保存后会直接进入今天/即将列表。" : "不安排时间会先进入收件箱，稍后再分拣。")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        if shouldSchedule {
                            GlassSection(title: "时间", symbol: "clock.fill", tint: .orange) {
                                VStack(alignment: .leading, spacing: 12) {
                                    DatePicker("时间", selection: $dueDate)

                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: 8) {
                                            QuickTimeButton(title: "1小时后") {
                                                dueDate = .now.addingTimeInterval(60 * 60)
                                            }
                                            QuickTimeButton(title: "今晚 20:00") {
                                                dueDate = suggestedTonightDate()
                                            }
                                            QuickTimeButton(title: "明早 09:00") {
                                                dueDate = suggestedTomorrowMorningDate()
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        GlassSection(title: "分类与优先级", symbol: "line.3.horizontal.decrease.circle", tint: .indigo) {
                            VStack(spacing: 12) {
                                Picker("分类", selection: $category) {
                                    ForEach(ReminderCategory.allCases) { item in
                                        Text(item.label).tag(item)
                                    }
                                }
                                .pickerStyle(.menu)

                                Picker("优先级", selection: $priority) {
                                    ForEach(ReminderPriority.allCases) { item in
                                        Text(item.label).tag(item)
                                    }
                                }
                                .pickerStyle(.segmented)
                            }
                        }
                    }
                    .padding()
                    .padding(.bottom, 24)
                }
            }
            .navigationTitle("快速收集")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("取消") { dismiss() }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button("保存") {
                        store.addReminder(
                            title: title,
                            note: note,
                            dueDate: shouldSchedule ? dueDate : nil,
                            category: category,
                            priority: priority
                        )
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }

    private func suggestedTonightDate() -> Date {
        let calendar = Calendar.current
        return calendar.date(bySettingHour: 20, minute: 0, second: 0, of: .now) ?? .now
    }

    private func suggestedTomorrowMorningDate() -> Date {
        let calendar = Calendar.current
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: .now) ?? .now
        return calendar.date(bySettingHour: 9, minute: 0, second: 0, of: tomorrow) ?? tomorrow
    }
}

struct QuickTimeButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(title, action: action)
            .buttonStyle(.bordered)
    }
}
