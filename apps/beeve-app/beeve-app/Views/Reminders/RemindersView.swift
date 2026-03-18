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
                    HStack(spacing: 8) {
                        SegmentedFilterBar(selection: $selectedFilter)
                        if !store.allTags.isEmpty {
                            Menu {
                                Button("全部标签") { filterTag = nil }
                                ForEach(store.allTags, id: \.id) { tag in
                                    Button(tag.name) { filterTag = tag }
                                }
                            } label: {
                                Image(systemName: filterTag != nil ? "tag.fill" : "tag")
                                    .font(.subheadline)
                                    .foregroundStyle(filterTag?.color ?? .secondary)
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
                .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                .listRowBackground(Color.clear)
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
                    .listRowBackground(Color.clear)
                    .listRowSeparator(.hidden)
                }

                if filteredSections.isEmpty {
                    Section {
                        ContentUnavailableView(
                            "当前筛选下没有事项",
                            systemImage: "line.3.horizontal.decrease.circle",
                            description: Text("试试切换筛选，或先快速收集一条新提醒。")
                        )
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 32)
                    }
                    .listRowBackground(Color.clear)
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
                                .listRowInsets(EdgeInsets(top: 6, leading: 0, bottom: 6, trailing: 0))
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                                // Smart inbox quick triage swipe
                                .swipeActions(edge: .leading, allowsFullSwipe: true) {
                                    if reminder.isInbox {
                                        Button("今天") {
                                            withAnimation(.snappy) { store.quickTriageToday(reminder) }
                                        }
                                        .tint(.blue)
                                    }
                                }
                                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                    if reminder.isInbox {
                                        Button("以后") {
                                            withAnimation(.snappy) { store.quickTriageSomeday(reminder) }
                                        }
                                        .tint(.gray)
                                        Button("本周") {
                                            withAnimation(.snappy) { store.quickTriageThisWeek(reminder) }
                                        }
                                        .tint(.orange)
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
            .navigationTitle("提醒")
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
        HStack(spacing: 16) {
            Text("\(selectedReminders.count) 项已选")
                .font(.subheadline.weight(.semibold))

            Spacer()

            Button("完成") {
                let items = selectedItems
                withAnimation(.snappy) {
                    store.batchComplete(items)
                    selectedReminders.removeAll()
                }
            }
            .tint(.green)

            Button("今天") {
                let items = selectedItems
                withAnimation(.snappy) {
                    store.batchAssignToday(items)
                    selectedReminders.removeAll()
                }
            }
            .tint(.blue)

            Button("删除", role: .destructive) {
                let items = selectedItems
                withAnimation(.snappy) {
                    store.batchDelete(items)
                    selectedReminders.removeAll()
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial, in: Capsule())
        .overlay(
            Capsule()
                .strokeBorder(Color.primary.opacity(0.08), lineWidth: 0.8)
        )
        .padding(.horizontal)
        .padding(.bottom, 8)
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
                ReminderListSection(title: "收件箱", items: store.inboxReminders, tint: .purple),
                ReminderListSection(title: "今天", items: store.todayReminders, tint: .blue),
                ReminderListSection(title: "即将到来", items: store.upcomingReminders, tint: .orange),
            ]
        case .inbox:
            return [ReminderListSection(title: "收件箱", items: store.inboxReminders, tint: .purple)]
        case .today:
            return [ReminderListSection(title: "今天", items: store.todayReminders, tint: .blue)]
        case .upcoming:
            return [ReminderListSection(title: "即将到来", items: store.upcomingReminders, tint: .orange)]
        case .completed:
            return [ReminderListSection(title: "已完成", items: store.completedReminders, tint: .green)]
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
        HStack(spacing: 12) {
            CircleIconBadge(symbol: "tray.full.fill", tint: .purple, size: 36, iconSize: 14)

            VStack(alignment: .leading, spacing: 4) {
                Text("有 \(count) 条事项待分拣")
                    .font(.subheadline.weight(.semibold))
                Text("左滑安排到今天，右滑标记为以后处理")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button("全部今天", action: onTriageAll)
                .font(.caption.weight(.semibold))
                .buttonStyle(.bordered)
                .tint(.purple)
        }
        .padding(12)
        .appCard(tint: .purple, cornerRadius: 16)
    }
}
