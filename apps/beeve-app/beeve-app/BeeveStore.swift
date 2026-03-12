//
//  BeeveStore.swift
//  beeve-app
//
//  Created by lang on 2026/3/12.
//

import Foundation
import Observation
import SwiftUI

enum ReminderPriority: String, CaseIterable, Codable, Identifiable {
    case high
    case medium
    case low

    var id: String { rawValue }

    var label: String {
        switch self {
        case .high:
            return "高优先级"
        case .medium:
            return "中优先级"
        case .low:
            return "低优先级"
        }
    }

    var color: Color {
        switch self {
        case .high:
            return .red
        case .medium:
            return .orange
        case .low:
            return .green
        }
    }
}

enum ReminderCategory: String, CaseIterable, Codable, Identifiable {
    case work
    case personal
    case health
    case idea

    var id: String { rawValue }

    var label: String {
        switch self {
        case .work:
            return "工作"
        case .personal:
            return "生活"
        case .health:
            return "健康"
        case .idea:
            return "灵感"
        }
    }
}

struct ReminderItem: Identifiable, Codable, Equatable {
    let id: UUID
    var title: String
    var note: String
    var dueDate: Date?
    var category: ReminderCategory
    var priority: ReminderPriority
    var isCompleted: Bool
    var createdAt: Date

    init(
        id: UUID,
        title: String,
        note: String,
        dueDate: Date?,
        category: ReminderCategory,
        priority: ReminderPriority,
        isCompleted: Bool,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.note = note
        self.dueDate = dueDate
        self.category = category
        self.priority = priority
        self.isCompleted = isCompleted
        self.createdAt = createdAt
    }

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case note
        case dueDate
        case category
        case priority
        case isCompleted
        case createdAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        note = try container.decode(String.self, forKey: .note)
        dueDate = try container.decodeIfPresent(Date.self, forKey: .dueDate)
        category = try container.decode(ReminderCategory.self, forKey: .category)
        priority = try container.decode(ReminderPriority.self, forKey: .priority)
        isCompleted = try container.decode(Bool.self, forKey: .isCompleted)
        createdAt = try container.decodeIfPresent(Date.self, forKey: .createdAt) ?? .now
    }
}

enum ToolKind: String, CaseIterable, Codable {
    case focus
    case note
    case habit
    case inbox
}

struct ToolItem: Identifiable, Hashable {
    let id = UUID()
    let kind: ToolKind
    let title: String
    let description: String
    let symbolName: String
    let statusText: String

    var tint: Color {
        switch kind {
        case .focus:
            return .orange
        case .note:
            return .blue
        case .habit:
            return .green
        case .inbox:
            return .purple
        }
    }
}

enum MessageRole: String, Codable {
    case assistant
    case user
}

struct AssistantMessage: Identifiable, Codable, Equatable {
    let id: UUID
    let role: MessageRole
    let content: String
    let createdAt: Date
}

enum FollowUpDestination: String, Equatable {
    case reminders
    case tools
    case assistant
}

struct CompletionSuggestion: Equatable {
    let title: String
    let detail: String
    let primaryLabel: String
    let primaryDestination: FollowUpDestination
    let secondaryLabel: String?
    let secondaryDestination: FollowUpDestination?
}

@MainActor
@Observable
final class BeeveStore {
    private enum Keys {
        static let reminders = "beeve.reminders"
        static let messages = "beeve.messages"
    }

    var reminders: [ReminderItem] {
        didSet { persistReminders() }
    }

    var messages: [AssistantMessage] {
        didSet { persistMessages() }
    }

    var completionSuggestion: CompletionSuggestion?

    let tools: [ToolItem]

    init() {
        let seededReminders = Self.load([ReminderItem].self, forKey: Keys.reminders) ?? Self.sampleReminders
        let seededMessages = Self.load([AssistantMessage].self, forKey: Keys.messages) ?? Self.sampleMessages

        reminders = seededReminders.sorted {
            ($0.dueDate ?? $0.createdAt.addingTimeInterval(60 * 60 * 24 * 365)) <
                ($1.dueDate ?? $1.createdAt.addingTimeInterval(60 * 60 * 24 * 365))
        }
        messages = seededMessages
        tools = Self.sampleTools
    }

    var greetingTitle: String {
        let hour = Calendar.current.component(.hour, from: .now)

        switch hour {
        case 5..<12:
            return "早上好，准备开工吧"
        case 12..<18:
            return "下午好，继续推进今天"
        default:
            return "晚上好，收拢一下今天"
        }
    }

    var formattedToday: String {
        Date.now.formatted(.dateTime.weekday(.wide).month().day())
    }

    var completedCount: Int {
        reminders.filter(\.isCompleted).count
    }

    var pendingCount: Int {
        reminders.filter { !$0.isCompleted }.count
    }

    var focusScore: Int {
        max(62, 90 - pendingCount * 4 + completedCount * 3)
    }

    var nextImportantReminder: ReminderItem? {
        reminders
            .filter { !$0.isCompleted }
            .sorted {
                if $0.priority == $1.priority {
                    return dueDateSortValue(for: $0) < dueDateSortValue(for: $1)
                }

                return $0.priority.rank < $1.priority.rank
            }
            .first
    }

    var pendingPreviewReminders: [ReminderItem] {
        Array(reminders.filter { !$0.isCompleted }.prefix(3))
    }

    var inboxReminders: [ReminderItem] {
        reminders
            .filter { !$0.isCompleted && $0.dueDate == nil }
            .sorted { $0.createdAt > $1.createdAt }
    }

    var overdueReminders: [ReminderItem] {
        reminders
            .filter {
                guard !$0.isCompleted, let dueDate = $0.dueDate else {
                    return false
                }

                return dueDate < .now && !Calendar.current.isDateInToday(dueDate)
            }
            .sorted { dueDateSortValue(for: $0) < dueDateSortValue(for: $1) }
    }

    var todayReminders: [ReminderItem] {
        reminders
            .filter {
                guard !$0.isCompleted, let dueDate = $0.dueDate else {
                    return false
                }

                return Calendar.current.isDateInToday(dueDate)
            }
            .sorted { dueDateSortValue(for: $0) < dueDateSortValue(for: $1) }
    }

    var upcomingReminders: [ReminderItem] {
        reminders
            .filter {
                guard !$0.isCompleted, let dueDate = $0.dueDate else {
                    return false
                }

                return !Calendar.current.isDateInToday(dueDate) && dueDate >= .now
            }
            .sorted { dueDateSortValue(for: $0) < dueDateSortValue(for: $1) }
    }

    var completedReminders: [ReminderItem] {
        reminders
            .filter(\.isCompleted)
            .sorted { dueDateSortValue(for: $0) > dueDateSortValue(for: $1) }
    }

    var triageSummary: String {
        if !inboxReminders.isEmpty {
            return "你有 \(inboxReminders.count) 条待分拣事项，适合先把它们安排到今天或明天。"
        }

        if let nextImportantReminder {
            return "下一件最值得推进的是「\(nextImportantReminder.title)」，先动手会比继续整理更有效。"
        }

        return "列表不算重，适合补充新想法，或用助手安排下一段时间。"
    }

    var homeSuggestion: String {
        if !inboxReminders.isEmpty {
            return "先处理收件箱里的事项，把模糊想法变成明确安排，会让今天更轻松。"
        }

        if let nextImportantReminder {
            return "建议先处理「\(nextImportantReminder.title)」，再给自己留一个 25 分钟的专注时间块。完成后我可以帮你继续拆下一步。"
        }

        return "今天看起来比较轻松。可以先补充一个提醒，或者直接用助手安排接下来的时间。"
    }

    func addReminder(
        title: String,
        note: String,
        dueDate: Date?,
        category: ReminderCategory,
        priority: ReminderPriority
    ) {
        let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanNote = note.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !cleanTitle.isEmpty else {
            return
        }

        reminders.append(
            ReminderItem(
                id: UUID(),
                title: cleanTitle,
                note: cleanNote,
                dueDate: dueDate,
                category: category,
                priority: priority,
                isCompleted: false
            )
        )
        sortReminders()
    }

    func toggleReminder(_ reminder: ReminderItem) {
        guard let index = reminders.firstIndex(where: { $0.id == reminder.id }) else {
            return
        }

        reminders[index].isCompleted.toggle()

        if reminders[index].isCompleted {
            completionSuggestion = followUpSuggestion(afterCompleting: reminders[index])
        } else {
            completionSuggestion = nil
        }
        sortReminders()
    }

    func deleteReminder(_ reminder: ReminderItem) {
        reminders.removeAll { $0.id == reminder.id }
    }

    func assignTonight(_ reminder: ReminderItem) {
        updateReminder(reminder) { item in
            item.dueDate = tonightDate()
        }
    }

    func assignTomorrowMorning(_ reminder: ReminderItem) {
        updateReminder(reminder) { item in
            item.dueDate = tomorrowMorningDate()
        }
    }

    func clearCompletionSuggestion() {
        completionSuggestion = nil
    }

    func runTool(_ tool: ToolItem) -> String {
        switch tool.kind {
        case .focus:
            return "已为你启动一个 25 分钟专注建议：先处理最高优先级提醒，再用 5 分钟整理收尾。"
        case .note:
            return "快速笔记已准备好。建议立刻写下你脑中还没落地的想法，避免占用注意力。"
        case .habit:
            return "今天的习惯打卡建议是：先完成最容易的一项，建立节奏后再处理难任务。"
        case .inbox:
            return "收件箱清空模式已准备：把临时想法先记下来，再决定它是提醒、笔记还是以后再看。"
        }
    }

    func sendMessage(_ rawText: String) {
        let text = rawText.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !text.isEmpty else {
            return
        }

        messages.append(
            AssistantMessage(
                id: UUID(),
                role: .user,
                content: text,
                createdAt: .now
            )
        )

        messages.append(
            AssistantMessage(
                id: UUID(),
                role: .assistant,
                content: assistantReply(for: text),
                createdAt: .now
            )
        )
    }

    func suggestedAssistantPrompts() -> [String] {
        var prompts: [String] = []

        if !inboxReminders.isEmpty {
            prompts.append("帮我分拣收件箱")
        }

        if nextImportantReminder != nil {
            prompts.append("今天最重要的事是什么？")
            prompts.append("帮我拆解下一步")
        }

        prompts.append("给我一个 25 分钟专注建议")

        return Array(prompts.prefix(3))
    }

    var assistantContextSummary: String {
        if !inboxReminders.isEmpty {
            return "你目前有 \(inboxReminders.count) 条收件箱事项，还没安排时间。可以先分拣，再决定优先级。"
        }

        if let nextImportantReminder {
            return "当前上下文重点是「\(nextImportantReminder.title)」。你可以让我帮你拆任务、安排时间或给专注建议。"
        }

        return "当前待办压力不高，适合做计划、收集想法，或给今天收个尾。"
    }

    func scheduleText(for reminder: ReminderItem) -> String {
        guard let dueDate = reminder.dueDate else {
            return "待分拣 · \(reminder.category.label)"
        }

        if Calendar.current.isDateInToday(dueDate) {
            return "\(reminder.category.label) · 今天 \(dueDate.formatted(date: .omitted, time: .shortened))"
        }

        if Calendar.current.isDateInTomorrow(dueDate) {
            return "\(reminder.category.label) · 明天 \(dueDate.formatted(date: .omitted, time: .shortened))"
        }

        return "\(reminder.category.label) · \(dueDate.formatted(date: .abbreviated, time: .shortened))"
    }

    private func assistantReply(for text: String) -> String {
        if text.contains("收件箱") || text.contains("分拣") {
            if inboxReminders.isEmpty {
                return "当前没有待分拣事项。你可以直接把新想法记进来，稍后我再帮你一起整理。"
            }

            return "我建议你先把收件箱里的事项按“今天必须做 / 这周处理 / 只是灵感”三类分开，再给最重要的一项补上时间。"
        }

        if text.contains("拆解") || text.contains("下一步") {
            if let nextImportantReminder {
                return "可以把「\(nextImportantReminder.title)」拆成三步：先定义结果，再推进第一小段，最后留 5 分钟做检查。这样更容易开始。"
            }

            return "先选出一件最想推进的事，我再帮你把它拆成可执行的下一步。"
        }

        if text.contains("下午") || text.contains("安排") {
            if let nextImportantReminder {
                return """
                我建议你这样安排接下来的时间：
                1. 先用 25 分钟推进「\(nextImportantReminder.title)」
                2. 完成后花 10 分钟处理零碎事项
                3. 留一个 15 分钟缓冲，用来确认今天是否还需要补新提醒
                """
            }

            return "你现在的列表比较空，适合先收集任务，再决定优先级。我建议先添加 1 到 3 个最关键提醒。"
        }

        if text.contains("重要") {
            if let nextImportantReminder {
                return "当前最值得优先推进的是「\(nextImportantReminder.title)」。它的时间最接近，而且优先级最高，建议先把它推进到一个明确结果。"
            }

            return "目前没有高优先级提醒。你可以先新增一个最重要的目标，我再帮你拆解。"
        }

        if text.contains("专注") || text.contains("focus") {
            return "建议你现在开始一个 25 分钟专注块：关闭外部干扰，只保留当前最重要的一项，结束后回来做一次简短复盘。"
        }

        if text.contains("提醒") {
            return "如果这件事需要被记住，建议把它写成一个清晰动作句，并加上时间与优先级。这样提醒页会更容易直接执行。"
        }

        return "我可以帮你安排今天、拆任务、建议专注节奏，或者把想法转成提醒。你也可以直接说“帮我安排下午”。"
    }

    private func persistReminders() {
        Self.save(reminders, forKey: Keys.reminders)
    }

    private func persistMessages() {
        Self.save(messages, forKey: Keys.messages)
    }

    private func updateReminder(_ reminder: ReminderItem, transform: (inout ReminderItem) -> Void) {
        guard let index = reminders.firstIndex(where: { $0.id == reminder.id }) else {
            return
        }

        transform(&reminders[index])
        sortReminders()
    }

    private func sortReminders() {
        reminders.sort { lhs, rhs in
            switch (lhs.isCompleted, rhs.isCompleted) {
            case (false, true):
                return true
            case (true, false):
                return false
            default:
                return dueDateSortValue(for: lhs) < dueDateSortValue(for: rhs)
            }
        }
    }

    private func dueDateSortValue(for reminder: ReminderItem) -> Date {
        reminder.dueDate ?? reminder.createdAt.addingTimeInterval(60 * 60 * 24 * 365)
    }

    private func followUpSuggestion(afterCompleting reminder: ReminderItem) -> CompletionSuggestion {
        if let nextReminder = nextImportantReminder {
            return CompletionSuggestion(
                title: "做得好，继续保持节奏",
                detail: "你刚完成了「\(reminder.title)」。接下来最值得推进的是「\(nextReminder.title)」。",
                primaryLabel: "打开下一项",
                primaryDestination: .reminders,
                secondaryLabel: "开始专注",
                secondaryDestination: .tools
            )
        }

        if !inboxReminders.isEmpty {
            return CompletionSuggestion(
                title: "已完成一项，顺手清一清收件箱",
                detail: "还有 \(inboxReminders.count) 条事项没安排时间，把它们分拣掉会更轻松。",
                primaryLabel: "去分拣",
                primaryDestination: .reminders,
                secondaryLabel: "问问助手",
                secondaryDestination: .assistant
            )
        }

        return CompletionSuggestion(
            title: "当前节奏不错",
            detail: "你已经推进了一件事。要不要让 Beeve 帮你安排接下来的一段时间？",
            primaryLabel: "打开助手",
            primaryDestination: .assistant,
            secondaryLabel: "看看工具",
            secondaryDestination: .tools
        )
    }

    private func tonightDate() -> Date {
        let calendar = Calendar.current
        return calendar.date(bySettingHour: 20, minute: 0, second: 0, of: .now) ?? .now.addingTimeInterval(60 * 60 * 3)
    }

    private func tomorrowMorningDate() -> Date {
        let calendar = Calendar.current
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: .now) ?? .now.addingTimeInterval(60 * 60 * 24)
        return calendar.date(bySettingHour: 9, minute: 0, second: 0, of: tomorrow) ?? tomorrow
    }

    private static func load<T: Decodable>(_ type: T.Type, forKey key: String) -> T? {
        guard let data = UserDefaults.standard.data(forKey: key) else {
            return nil
        }

        return try? JSONDecoder().decode(type, from: data)
    }

    private static func save<T: Encodable>(_ value: T, forKey key: String) {
        guard let data = try? JSONEncoder().encode(value) else {
            return
        }

        UserDefaults.standard.set(data, forKey: key)
    }
}

private extension ReminderPriority {
    var rank: Int {
        switch self {
        case .high:
            return 0
        case .medium:
            return 1
        case .low:
            return 2
        }
    }
}

private extension BeeveStore {
    static let sampleReminders: [ReminderItem] = [
        ReminderItem(
            id: UUID(),
            title: "整理今天的产品思路",
            note: "把 AI 助理首页的结构定下来",
            dueDate: .now.addingTimeInterval(60 * 45),
            category: .work,
            priority: .high,
            isCompleted: false
        ),
        ReminderItem(
            id: UUID(),
            title: "喝水和站起来走动",
            note: "给自己留 10 分钟",
            dueDate: .now.addingTimeInterval(60 * 120),
            category: .health,
            priority: .medium,
            isCompleted: false
        ),
        ReminderItem(
            id: UUID(),
            title: "把脑中的新功能先记下来",
            note: "先放收件箱，晚点再决定是否排期",
            dueDate: nil,
            category: .idea,
            priority: .medium,
            isCompleted: false
        ),
        ReminderItem(
            id: UUID(),
            title: "记录一个新灵感",
            note: "把最近想到的工具功能记下来",
            dueDate: .now.addingTimeInterval(60 * 60 * 24),
            category: .idea,
            priority: .low,
            isCompleted: true
        )
    ]

    static let sampleMessages: [AssistantMessage] = [
        AssistantMessage(
            id: UUID(),
            role: .assistant,
            content: "我是 Beeve。你可以让我帮你安排今天、拆解任务，或者给你一个更轻松的推进节奏。",
            createdAt: .now
        )
    ]

    static let sampleTools: [ToolItem] = [
        ToolItem(kind: .focus, title: "专注计时", description: "给当前最重要的任务一个 25 分钟时间块。", symbolName: "timer", statusText: "适合现在开始"),
        ToolItem(kind: .note, title: "快速笔记", description: "把脑中的事项和灵感快速落下来。", symbolName: "note.text", statusText: "适合即时记录"),
        ToolItem(kind: .habit, title: "习惯打卡", description: "用最小动作建立今天的状态。", symbolName: "checkmark.seal", statusText: "适合建立节奏"),
        ToolItem(kind: .inbox, title: "灵感收件箱", description: "先收集，再决定是否变成提醒。", symbolName: "tray.full", statusText: "适合清理脑负担")
    ]
}
