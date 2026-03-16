import SwiftUI

struct RemindersView: View {
    @Environment(BeeveStore.self) private var store
    @State private var selectedFilter: ReminderFilter = .all

    let onAddReminder: () -> Void
    let onOpenAssistant: () -> Void

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("从收件箱到今天要做的事，尽量在一个界面完成分拣。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding(.vertical, 4)
                }
                .listRowBackground(Color.clear)
                .listRowSeparator(.hidden)

                Section {
                    SegmentedFilterBar(selection: $selectedFilter)
                        .padding(.vertical, 4)
                }
                .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                .listRowBackground(Color.clear)
                .listRowSeparator(.hidden)

                if sections.isEmpty {
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
                    ForEach(sections, id: \.title) { section in
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
                                .listRowInsets(EdgeInsets(top: 6, leading: 0, bottom: 6, trailing: 0))
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(AppBackgroundView())
            .navigationTitle("提醒")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    AssistantToolbarButton(action: onOpenAssistant)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("新增", systemImage: "plus", action: onAddReminder)
                }
            }
            .sensoryFeedback(.selection, trigger: selectedFilter)
            .animation(.snappy, value: selectedFilter)
        }
    }

    private var sections: [ReminderListSection] {
        switch selectedFilter {
        case .all:
            return [
                ReminderListSection(title: "收件箱", items: store.inboxReminders, tint: .purple),
                ReminderListSection(title: "今天", items: store.todayReminders, tint: .blue),
                ReminderListSection(title: "即将到来", items: store.upcomingReminders, tint: .orange),
            ]
            .filter { !$0.items.isEmpty }
        case .inbox:
            return [ReminderListSection(title: "收件箱", items: store.inboxReminders, tint: .purple)].filter { !$0.items.isEmpty }
        case .today:
            return [ReminderListSection(title: "今天", items: store.todayReminders, tint: .blue)].filter { !$0.items.isEmpty }
        case .upcoming:
            return [ReminderListSection(title: "即将到来", items: store.upcomingReminders, tint: .orange)].filter { !$0.items.isEmpty }
        case .completed:
            return [ReminderListSection(title: "已完成", items: store.completedReminders, tint: .green)].filter { !$0.items.isEmpty }
        }
    }
}

private struct ReminderListSection {
    let title: String
    let items: [Reminder]
    let tint: Color
}
