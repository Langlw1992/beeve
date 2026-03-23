import SwiftUI

struct RemindersView: View {
    @Environment(BeeveStore.self) private var store
    @State private var selectedFilter: ReminderFilter = .all
    @State private var isEditing = false
    @State private var selectedReminders: Set<UUID> = []
    @State private var filterTag: Tag?
    @State private var showAddReminder = false

    var body: some View {
        NavigationStack {
            List(selection: isEditing ? Binding(get: { selectedReminders }, set: { selectedReminders = $0 }) : nil) {
                Section {
                    HStack(spacing: DSSpace.xs) {
                        SegmentedFilterBar(selection: $selectedFilter)
                        if !store.allTags.isEmpty {
                            Menu {
                                Button("全部标签") { filterTag = nil }
                                ForEach(store.allTags, id: \.id) { tag in
                                    Button(tag.name) { filterTag = tag }
                                }
                            } label: {
                                Image(systemName: filterTag != nil ? "tag.fill" : "tag")
                                    .font(DSType.meta)
                                    .foregroundStyle(filterTag?.color ?? DSColor.textSecondary)
                            }
                        }
                    }
                    .padding(.vertical, DSSpace.xxs)
                }
                .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                .listRowBackground(DSColor.surface2.opacity(0))
                .listRowSeparator(.hidden)

                // Smart Inbox triage banner
                if selectedFilter == .inbox && !store.inboxReminders.isEmpty && !isEditing {
                    Section {
                        SmartInboxBanner(
                            count: store.inboxReminders.count,
                            onTriageAll: {
                                withAnimation(.snappy) {
                                    for r in store.inboxReminders {
                                        store.quickTriageToday(r)
                                    }
                                }
                            }
                        )
                    }
                    .listRowBackground(DSColor.surface2.opacity(0))
                    .listRowSeparator(.hidden)
                }

                if filteredSections.isEmpty {
                    Section {
                        ContentUnavailableView(
                            "当前筛选下没有事项",
                            systemImage: "line.3.horizontal.decrease.circle",
                            description: Text("试试切换筛选，或先快速记下一条新任务。")
                        )
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, DSSpace.xl)
                    }
                    .listRowBackground(DSColor.surface2.opacity(0))
                    .listRowSeparator(.hidden)
                } else {
                    ForEach(filteredSections, id: \.title) { section in
                        Section(section.title) {
                            ForEach(section.items) { reminder in
                                ReminderRow(
                                    reminder: reminder,
                                    scheduleText: store.scheduleText(for: reminder),
                                    onToggle: {
                                        withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                                            store.toggleReminder(reminder)
                                        }
                                    },
                                    onTonight: {
                                        withAnimation(.snappy) {
                                            store.assignTonight(reminder)
                                        }
                                    },
                                    onTomorrow: {
                                        withAnimation(.snappy) {
                                            store.assignTomorrowMorning(reminder)
                                        }
                                    },
                                    onDelete: {
                                        withAnimation(.snappy) {
                                            store.deleteReminder(reminder)
                                        }
                                    }
                                )
                                .tag(reminder.id)
                                .listRowInsets(EdgeInsets(top: DSSpace.xs, leading: 0, bottom: DSSpace.xs, trailing: 0))
                                .listRowBackground(DSColor.surface2.opacity(0))
                                .listRowSeparator(.hidden)
                                // Smart inbox quick triage swipe
                                .swipeActions(edge: .leading, allowsFullSwipe: true) {
                                    if reminder.isInbox {
                                        Button("今天") {
                                            withAnimation(.snappy) { store.quickTriageToday(reminder) }
                                        }
                                        .tint(DSColor.info)
                                    }
                                }
                                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                    if reminder.isInbox {
                                        Button("以后") {
                                            withAnimation(.snappy) { store.quickTriageSomeday(reminder) }
                                        }
                                        .tint(DSColor.textTertiary)
                                        Button("本周") {
                                            withAnimation(.snappy) { store.quickTriageThisWeek(reminder) }
                                        }
                                        .tint(DSColor.warning)
                                    }
                                }
                            }
                            .onMove { source, destination in
                                store.moveReminder(from: source, to: destination, in: section.items)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(AppBackgroundView())
            .environment(\.editMode, isEditing ? .constant(.active) : .constant(.inactive))
            .navigationTitle("任务")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button(isEditing ? "完成" : "编辑") {
                        withAnimation(.snappy) {
                            isEditing.toggle()
                            if !isEditing { selectedReminders.removeAll() }
                        }
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("新增", systemImage: "plus") {
                        showAddReminder = true
                    }
                }
            }
            .sheet(isPresented: $showAddReminder) {
                AddReminderSheet()
                    .presentationDetents([.medium, .large])
            }
            .safeAreaInset(edge: .bottom) {
                if isEditing && !selectedReminders.isEmpty {
                    batchBar
                }
            }
            .sensoryFeedback(.selection, trigger: selectedFilter)
            .animation(.snappy, value: selectedFilter)
        }
    }

    // MARK: - Batch Action Bar

    private var batchBar: some View {
        HStack(spacing: DSSpace.md) {
            Text("\(selectedReminders.count) 项已选")
                .font(DSType.bodyMedium)

            Spacer()

            Button("完成") {
                let items = selectedItems
                withAnimation(.snappy) {
                    store.batchComplete(items)
                    selectedReminders.removeAll()
                }
            }
            .tint(DSColor.success)

            Button("今天") {
                let items = selectedItems
                withAnimation(.snappy) {
                    store.batchAssignToday(items)
                    selectedReminders.removeAll()
                }
            }
            .tint(DSColor.info)

            Button("删除", role: .destructive) {
                let items = selectedItems
                withAnimation(.snappy) {
                    store.batchDelete(items)
                    selectedReminders.removeAll()
                }
            }
        }
        .padding(DSSpace.md)
        .appChrome(cornerRadius: DSRadius.full)
        .padding(.horizontal, DSSpace.md)
        .padding(.bottom, DSSpace.xs)
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }

    private var selectedItems: [Reminder] {
        store.allReminders.filter { selectedReminders.contains($0.id) }
    }

    // MARK: - Sections

    private var filteredSections: [ReminderListSection] {
        sections.map { section in
            if let filterTag {
                let filtered = section.items.filter { ($0.tags ?? []).contains(where: { $0.id == filterTag.id }) }
                return ReminderListSection(title: section.title, items: filtered, tint: section.tint)
            }
            return section
        }
        .filter { !$0.items.isEmpty }
    }

    private var sections: [ReminderListSection] {
        switch selectedFilter {
        case .all:
            return [
                ReminderListSection(title: "收件箱", items: store.inboxReminders, tint: DSColor.brand),
                ReminderListSection(title: "今天", items: store.todayReminders, tint: DSColor.info),
                ReminderListSection(title: "即将到来", items: store.upcomingReminders, tint: DSColor.warning),
            ]
        case .inbox:
            return [ReminderListSection(title: "收件箱", items: store.inboxReminders, tint: DSColor.brand)]
        case .today:
            return [ReminderListSection(title: "今天", items: store.todayReminders, tint: DSColor.info)]
        case .upcoming:
            return [ReminderListSection(title: "即将到来", items: store.upcomingReminders, tint: DSColor.warning)]
        case .completed:
            return [ReminderListSection(title: "已完成", items: store.completedReminders, tint: DSColor.success)]
        }
    }
}

private struct ReminderListSection {
    let title: String
    let items: [Reminder]
    let tint: Color
}

// MARK: - Smart Inbox Banner

struct SmartInboxBanner: View {
    let count: Int
    let onTriageAll: () -> Void

    var body: some View {
        HStack(spacing: DSSpace.sm) {
            CircleIconBadge(symbol: "tray.full.fill", tint: DSColor.brand, size: DSComponent.circleIconMD, iconSize: DSComponent.iconSizeSM)

            VStack(alignment: .leading, spacing: DSComponent.textBlockSpacing) {
                Text("有 \(count) 条事项待分拣")
                    .font(DSType.bodyMedium)
                Text("左滑安排到今天，右滑标记为以后处理")
                    .font(DSType.caption)
                    .foregroundStyle(DSColor.textSecondary)
            }

            Spacer()

            Button("全部今天", action: onTriageAll)
                .buttonStyle(DSSecondaryButtonStyle(tint: DSColor.brand))
        }
        .padding(DSSpace.sm)
        .appCard(tint: DSColor.brand, cornerRadius: DSRadius.card)
    }
}
