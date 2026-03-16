import Foundation
import Observation
import SwiftData
import SwiftUI

@MainActor
@Observable
final class BeeveStore {
    private var modelContext: ModelContext

    var completionSuggestion: CompletionSuggestion?
    var messages: [AssistantMessage]
    let tools: [ToolItem] = ToolItem.defaults

    init(modelContext: ModelContext) {
        self.modelContext = modelContext

        // Load persisted messages or seed defaults
        if let data = UserDefaults.standard.data(forKey: "beeve.messages"),
           let saved = try? JSONDecoder().decode([AssistantMessage].self, from: data) {
            self.messages = saved
        } else {
            self.messages = [
                AssistantMessage(
                    role: .assistant,
                    content: "我是 Beeve。你可以让我帮你安排今天、拆解任务，或者给你一个更轻松的推进节奏。"
                ),
            ]
        }
    }

    // MARK: - Reminder Queries

    var allReminders: [Reminder] {
        let descriptor = FetchDescriptor<Reminder>(
            sortBy: [SortDescriptor(\.sortOrder), SortDescriptor(\.createdAt, order: .reverse)]
        )
        let fetched = (try? modelContext.fetch(descriptor)) ?? []
        return fetched.sorted { lhs, rhs in
            if lhs.isCompleted != rhs.isCompleted { return !lhs.isCompleted }
            if let ld = lhs.dueDate, let rd = rhs.dueDate { return ld < rd }
            if lhs.dueDate != nil { return true }
            if rhs.dueDate != nil { return false }
            return lhs.createdAt > rhs.createdAt
        }
    }

    var pendingReminders: [Reminder] {
        allReminders.filter { !$0.isCompleted }
    }

    var completedReminders: [Reminder] {
        allReminders.filter(\.isCompleted)
    }

    var inboxReminders: [Reminder] {
        pendingReminders.filter(\.isInbox).sorted { $0.createdAt > $1.createdAt }
    }

    var overdueReminders: [Reminder] {
        pendingReminders.filter(\.isOverdue).sorted { dueDateSort($0) < dueDateSort($1) }
    }

    var todayReminders: [Reminder] {
        pendingReminders.filter(\.isToday).sorted { dueDateSort($0) < dueDateSort($1) }
    }

    var upcomingReminders: [Reminder] {
        pendingReminders.filter(\.isUpcoming).sorted { dueDateSort($0) < dueDateSort($1) }
    }

    var pendingPreviewReminders: [Reminder] {
        Array(pendingReminders.prefix(3))
    }

    var nextImportantReminder: Reminder? {
        pendingReminders
            .sorted {
                if $0.priority == $1.priority {
                    return dueDateSort($0) < dueDateSort($1)
                }
                return $0.priority.rank < $1.priority.rank
            }
            .first
    }

    var completedCount: Int { completedReminders.count }
    var pendingCount: Int { pendingReminders.count }

    var focusScore: Int {
        max(62, 90 - pendingCount * 4 + completedCount * 3)
    }

    // MARK: - Reminder Actions

    func addReminder(
        title: String,
        note: String = "",
        dueDate: Date? = nil,
        category: ReminderCategory = .work,
        priority: ReminderPriority = .medium
    ) {
        let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanTitle.isEmpty else { return }

        let reminder = Reminder(
            title: cleanTitle,
            note: note.trimmingCharacters(in: .whitespacesAndNewlines),
            dueDate: dueDate,
            category: category,
            priority: priority
        )
        modelContext.insert(reminder)
        try? modelContext.save()
    }

    func toggleReminder(_ reminder: Reminder) {
        reminder.isCompleted.toggle()
        if reminder.isCompleted {
            completionSuggestion = followUpSuggestion(afterCompleting: reminder)
        } else {
            completionSuggestion = nil
        }
        try? modelContext.save()
    }

    func deleteReminder(_ reminder: Reminder) {
        modelContext.delete(reminder)
        try? modelContext.save()
    }

    func assignTonight(_ reminder: Reminder) {
        let calendar = Calendar.current
        reminder.dueDate = calendar.date(bySettingHour: 20, minute: 0, second: 0, of: .now)
            ?? .now.addingTimeInterval(60 * 60 * 3)
        try? modelContext.save()
    }

    func assignTomorrowMorning(_ reminder: Reminder) {
        let calendar = Calendar.current
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: .now) ?? .now.addingTimeInterval(60 * 60 * 24)
        reminder.dueDate = calendar.date(bySettingHour: 9, minute: 0, second: 0, of: tomorrow) ?? tomorrow
        try? modelContext.save()
    }

    func clearCompletionSuggestion() {
        completionSuggestion = nil
    }

    // MARK: - Schedule Text

    func scheduleText(for reminder: Reminder) -> String {
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

    // MARK: - Greeting & Suggestions

    var greetingTitle: String {
        let hour = Calendar.current.component(.hour, from: .now)
        switch hour {
        case 5..<12: return "早上好，准备开工吧"
        case 12..<18: return "下午好，继续推进今天"
        default: return "晚上好，收拢一下今天"
        }
    }

    var formattedToday: String {
        Date.now.formatted(.dateTime.weekday(.wide).month().day())
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

    var assistantContextSummary: String {
        if !inboxReminders.isEmpty {
            return "你目前有 \(inboxReminders.count) 条收件箱事项，还没安排时间。可以先分拣，再决定优先级。"
        }
        if let nextImportantReminder {
            return "当前上下文重点是「\(nextImportantReminder.title)」。你可以让我帮你拆任务、安排时间或给专注建议。"
        }
        return "当前待办压力不高，适合做计划、收集想法，或给今天收个尾。"
    }

    // MARK: - Tools

    func runTool(_ tool: ToolItem) -> String {
        switch tool.kind {
        case .focus: "已为你启动一个 25 分钟专注建议：先处理最高优先级提醒，再用 5 分钟整理收尾。"
        case .note: "快速笔记已准备好。建议立刻写下你脑中还没落地的想法，避免占用注意力。"
        case .habit: "今天的习惯打卡建议是：先完成最容易的一项，建立节奏后再处理难任务。"
        case .inbox: "收件箱清空模式已准备：把临时想法先记下来，再决定它是提醒、笔记还是以后再看。"
        }
    }

    // MARK: - Assistant

    func sendMessage(_ rawText: String) {
        let text = rawText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        messages.append(AssistantMessage(role: .user, content: text))
        messages.append(AssistantMessage(role: .assistant, content: assistantReply(for: text)))
        persistMessages()
    }

    func suggestedAssistantPrompts() -> [String] {
        var prompts: [String] = []
        if !inboxReminders.isEmpty { prompts.append("帮我分拣收件箱") }
        if nextImportantReminder != nil {
            prompts.append("今天最重要的事是什么？")
            prompts.append("帮我拆解下一步")
        }
        prompts.append("给我一个 25 分钟专注建议")
        return Array(prompts.prefix(3))
    }

    // MARK: - Private

    private func dueDateSort(_ reminder: Reminder) -> Date {
        reminder.dueDate ?? reminder.createdAt.addingTimeInterval(60 * 60 * 24 * 365)
    }

    private func persistMessages() {
        guard let data = try? JSONEncoder().encode(messages) else { return }
        UserDefaults.standard.set(data, forKey: "beeve.messages")
    }

    private func followUpSuggestion(afterCompleting reminder: Reminder) -> CompletionSuggestion {
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

    private func assistantReply(for text: String) -> String {
        if text.contains("收件箱") || text.contains("分拣") {
            if inboxReminders.isEmpty {
                return "当前没有待分拣事项。你可以直接把新想法记进来，稍后我再帮你一起整理。"
            }
            return "我建议你先把收件箱里的事项按「今天必须做 / 这周处理 / 只是灵感」三类分开，再给最重要的一项补上时间。"
        }

        if text.contains("拆解") || text.contains("下一步") {
            if let r = nextImportantReminder {
                return "可以把「\(r.title)」拆成三步：先定义结果，再推进第一小段，最后留 5 分钟做检查。这样更容易开始。"
            }
            return "先选出一件最想推进的事，我再帮你把它拆成可执行的下一步。"
        }

        if text.contains("下午") || text.contains("安排") {
            if let r = nextImportantReminder {
                return """
                我建议你这样安排接下来的时间：
                1. 先用 25 分钟推进「\(r.title)」
                2. 完成后花 10 分钟处理零碎事项
                3. 留一个 15 分钟缓冲，用来确认今天是否还需要补新提醒
                """
            }
            return "你现在的列表比较空，适合先收集任务，再决定优先级。我建议先添加 1 到 3 个最关键提醒。"
        }

        if text.contains("重要") {
            if let r = nextImportantReminder {
                return "当前最值得优先推进的是「\(r.title)」。它的时间最接近，而且优先级最高，建议先把它推进到一个明确结果。"
            }
            return "目前没有高优先级提醒。你可以先新增一个最重要的目标，我再帮你拆解。"
        }

        if text.contains("专注") || text.contains("focus") {
            return "建议你现在开始一个 25 分钟专注块：关闭外部干扰，只保留当前最重要的一项，结束后回来做一次简短复盘。"
        }

        if text.contains("提醒") {
            return "如果这件事需要被记住，建议把它写成一个清晰动作句，并加上时间与优先级。这样提醒页会更容易直接执行。"
        }

        return "我可以帮你安排今天、拆任务、建议专注节奏，或者把想法转成提醒。你也可以直接说「帮我安排下午」。"
    }
}

// MARK: - Data Migration

extension BeeveStore {
    static func migrateFromUserDefaults(into context: ModelContext) {
        guard let data = UserDefaults.standard.data(forKey: "beeve.reminders") else { return }

        struct LegacyReminder: Codable {
            let id: UUID
            var title: String
            var note: String
            var dueDate: Date?
            var category: ReminderCategory
            var priority: ReminderPriority
            var isCompleted: Bool
            var createdAt: Date?
        }

        guard let legacy = try? JSONDecoder().decode([LegacyReminder].self, from: data) else { return }

        // Check if migration already happened
        let descriptor = FetchDescriptor<Reminder>()
        let existingCount = (try? context.fetchCount(descriptor)) ?? 0
        guard existingCount == 0 else { return }

        for item in legacy {
            let reminder = Reminder(
                title: item.title,
                note: item.note,
                dueDate: item.dueDate,
                category: item.category,
                priority: item.priority,
                isCompleted: item.isCompleted
            )
            context.insert(reminder)
        }

        try? context.save()
        UserDefaults.standard.removeObject(forKey: "beeve.reminders")
    }

    static func seedSampleDataIfEmpty(into context: ModelContext) {
        let descriptor = FetchDescriptor<Reminder>()
        let count = (try? context.fetchCount(descriptor)) ?? 0
        guard count == 0 else { return }

        let samples = [
            Reminder(title: "整理今天的产品思路", note: "把 AI 助理首页的结构定下来", dueDate: .now.addingTimeInterval(60 * 45), category: .work, priority: .high),
            Reminder(title: "喝水和站起来走动", note: "给自己留 10 分钟", dueDate: .now.addingTimeInterval(60 * 120), category: .health, priority: .medium),
            Reminder(title: "把脑中的新功能先记下来", note: "先放收件箱，晚点再决定是否排期", category: .idea, priority: .medium),
            Reminder(title: "记录一个新灵感", note: "把最近想到的工具功能记下来", dueDate: .now.addingTimeInterval(60 * 60 * 24), category: .idea, priority: .low, isCompleted: true),
        ]

        for sample in samples {
            context.insert(sample)
        }
        try? context.save()
    }
}
