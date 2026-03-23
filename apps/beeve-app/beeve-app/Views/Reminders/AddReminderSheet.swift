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
    @State private var selectedTags: Set<UUID> = []
    @State private var repeatRule: RepeatRule?
    @State private var newTagName = ""

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackgroundView()

                ScrollView {
                    VStack(spacing: DSSpace.lg) {
                        GlassSection(title: "任务", symbol: "square.and.pencil", tint: DSColor.info) {
                            VStack(spacing: DSSpace.sm) {
                                TextField("任务标题", text: $title)
                                    .textFieldStyle(.roundedBorder)

                                TextField("备注（可选）", text: $note, axis: .vertical)
                                    .textFieldStyle(.roundedBorder)
                            }
                        }

                        GlassSection(title: "安排方式", symbol: "calendar.badge.clock", tint: DSColor.brand) {
                            VStack(alignment: .leading, spacing: DSSpace.sm) {
                                Toggle("立即安排时间", isOn: $shouldSchedule)
                                Text(shouldSchedule ? "保存后会直接进入今天/即将列表。" : "不安排时间会先进入收件箱，稍后再分拣。")
                                    .font(DSType.caption)
                                    .foregroundStyle(DSColor.textSecondary)
                            }
                        }

                        if shouldSchedule {
                            GlassSection(title: "时间", symbol: "clock.fill", tint: DSColor.warning) {
                                VStack(alignment: .leading, spacing: DSSpace.sm) {
                                    DatePicker("时间", selection: $dueDate)

                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: DSSpace.xs) {
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

                            // Repeat rule
                            GlassSection(title: "重复", symbol: "arrow.trianglehead.2.clockwise", tint: DSColor.ping) {
                                VStack(alignment: .leading, spacing: DSSpace.sm) {
                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: DSSpace.xs) {
                                            RepeatChip(label: "不重复", isSelected: repeatRule == nil) {
                                                repeatRule = nil
                                            }
                                            ForEach(RepeatRule.presets, id: \.label) { rule in
                                                RepeatChip(label: rule.label, isSelected: repeatRule == rule) {
                                                    repeatRule = rule
                                                }
                                            }
                                        }
                                    }
                                    if let rule = repeatRule {
                                        Text("完成后会自动生成下一个「\(rule.label)」任务。")
                                            .font(DSType.caption)
                                            .foregroundStyle(DSColor.textSecondary)
                                    }
                                }
                            }
                        }

                        GlassSection(title: "分类与优先级", symbol: "line.3.horizontal.decrease.circle", tint: DSColor.focus) {
                            VStack(spacing: DSSpace.sm) {
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

                        // Tags
                        GlassSection(title: "标签", symbol: "tag", tint: DSColor.brand) {
                            VStack(alignment: .leading, spacing: DSSpace.sm) {
                                FlowLayout(spacing: DSSpace.xs) {
                                    ForEach(store.allTags, id: \.id) { tag in
                                        TagChip(
                                            tag: tag,
                                            isSelected: selectedTags.contains(tag.id),
                                            action: {
                                                if selectedTags.contains(tag.id) {
                                                    selectedTags.remove(tag.id)
                                                } else {
                                                    selectedTags.insert(tag.id)
                                                }
                                            }
                                        )
                                    }
                                }

                                HStack(spacing: DSSpace.xs) {
                                    TextField("新标签", text: $newTagName)
                                        .textFieldStyle(.roundedBorder)
                                    Button("添加") {
                                        store.createTag(name: newTagName)
                                        newTagName = ""
                                    }
                                    .disabled(newTagName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                                    .buttonStyle(DSSecondaryButtonStyle(tint: DSColor.brand))
                                }
                            }
                        }
                    }
                    .padding(DSSpace.md)
                    .padding(.bottom, DSSpace.lg)
                }
            }
            .navigationTitle("新建任务")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("取消") { dismiss() }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button("保存") {
                        let tags = store.allTags.filter { selectedTags.contains($0.id) }
                        store.addReminder(
                            title: title,
                            note: note,
                            dueDate: shouldSchedule ? dueDate : nil,
                            category: category,
                            priority: priority,
                            tags: tags,
                            repeatRule: shouldSchedule ? repeatRule : nil
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

// MARK: - Supporting Views

struct QuickTimeButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(title, action: action)
            .buttonStyle(DSSecondaryButtonStyle(tint: DSColor.info))
    }
}

struct RepeatChip: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(label, action: action)
            .font(DSType.captionBold)
            .padding(.horizontal, DSSpace.sm)
            .padding(.vertical, DSSpace.xs)
            .glassCapsule(tint: isSelected ? DSColor.ping : DSColor.textSecondary)
            .foregroundStyle(isSelected ? DSColor.ping : DSColor.textSecondary)
    }
}

struct TagChip: View {
    let tag: Tag
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: DSSpace.xxs) {
                Circle()
                    .fill(tag.color)
                    .frame(width: DSSpace.xs, height: DSSpace.xs)
                Text(tag.name)
                    .font(DSType.caption.weight(.medium))
            }
            .padding(.horizontal, DSSpace.sm)
            .padding(.vertical, DSSpace.xxs)
            .glassCapsule(tint: isSelected ? tag.color : DSColor.textSecondary)
            .foregroundStyle(isSelected ? tag.color : DSColor.textSecondary)
        }
        .buttonStyle(.plain)
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = DSSpace.xs

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func layout(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (CGSize(width: maxWidth, height: y + rowHeight), positions)
    }
}
