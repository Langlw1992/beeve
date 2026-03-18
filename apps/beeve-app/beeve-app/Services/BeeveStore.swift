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

        if let data = UserDefaults.standard.data(forKey: "beeve.messages"),
           let saved = try? JSONDecoder().decode([AssistantMessage].self, from: data) {
            self.messages = saved
        } else {
            self.messages = [
                AssistantMessage(
                    role: .assistant,
                    content: "我是 Beeve。先把今天要做的事收进来，我会帮你理解、安排，并给出下一步。"
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
        return fetched.filter(\.isTopLevel).sorted { lhs, rhs in
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
        Array(todayPlanReminders.prefix(3))
    }

    var todayPlanReminders: [Reminder] {
        Array((overdueReminders + todayReminders + upcomingReminders).prefix(6))
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
        let baseline = 76 + completedCount * 3 - (overdueReminders.count * 6) - (pendingFlashNotes.count * 3)
        return min(max(baseline, 34), 98)
    }

    // MARK: - FlashNote Queries

    var allFlashNotes: [FlashNote] {
        let descriptor = FetchDescriptor<FlashNote>(sortBy: [SortDescriptor(\.createdAt, order: .reverse)])
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    var pendingFlashNotes: [FlashNote] {
        allFlashNotes.filter { $0.status == .pending }
    }

    var processedFlashNotes: [FlashNote] {
        allFlashNotes.filter { $0.status != .pending }
    }

    var recentFlashNotes: [FlashNote] {
        Array(allFlashNotes.prefix(10))
    }

    var captureBacklogCount: Int {
        pendingFlashNotes.count
    }

    // MARK: - Notes / Memory

    var allNotes: [Note] {
        let descriptor = FetchDescriptor<Note>(sortBy: [SortDescriptor(\.updatedAt, order: .reverse)])
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    var allMemoryItems: [UserMemoryItem] {
        let descriptor = FetchDescriptor<UserMemoryItem>(
            sortBy: [SortDescriptor(\.updatedAt, order: .reverse)]
        )
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    var enabledMemoryItems: [UserMemoryItem] {
        allMemoryItems.filter(\.isEnabled)
    }

    var memorySummaryLines: [String] {
        Array(enabledMemoryItems.prefix(4).map(\.summaryLine))
    }

    var preferredName: String? {
        memoryValue(for: "称呼")
    }

    var preferredTone: String? {
        memoryValue(for: "沟通风格")
    }

    var workHoursSummary: String? {
        memoryValue(for: "工作时段")
    }

    var defaultFocusDuration: Int {
        Int(memoryValue(for: "默认专注") ?? "") ?? 25
    }

    // MARK: - Today

    var greetingTitle: String {
        let hour = Calendar.current.component(.hour, from: .now)
        let prefix = preferredName.map { "\($0)，" } ?? ""
        switch hour {
        case 5..<12:
            return "\(prefix)早上好，先收拢今天"
        case 12..<18:
            return "\(prefix)下午好，继续推进关键动作"
        default:
            return "\(prefix)晚上好，收尾并准备明天"
        }
    }

    var formattedToday: String {
        Date.now.formatted(.dateTime.weekday(.wide).month().day())
    }

    var triageSummary: String {
        if captureBacklogCount > 0 {
            return "你有 \(captureBacklogCount) 条待理解记录，先把它们转成任务或笔记会更清晰。"
        }
        if !inboxReminders.isEmpty {
            return "你有 \(inboxReminders.count) 条待分拣事项，适合先安排到今天或本周。"
        }
        if let nextImportantReminder {
            return "下一件最值得推进的是「\(nextImportantReminder.title)」。先开始，比继续整理更有效。"
        }
        return "当前列表很轻，适合先收集想法，或做一次简短复盘。"
    }

    var homeSuggestion: String {
        todayPrimaryAction.detail
    }

    var assistantContextSummary: String {
        let memoryLine = enabledMemoryItems.isEmpty ? nil : "我记得你的偏好是：\(memorySummaryLines.joined(separator: "，"))。"
        if captureBacklogCount > 0 {
            return [memoryLine, "当前有 \(captureBacklogCount) 条待理解记录，适合先做一次快速分拣。"]
                .compactMap { $0 }
                .joined(separator: " ")
        }
        if let nextImportantReminder {
            return [memoryLine, "当前上下文重点是「\(nextImportantReminder.title)」，你可以让我帮你拆任务、安排时间或给专注建议。"]
                .compactMap { $0 }
                .joined(separator: " ")
        }
        return [memoryLine, "当前待办压力不高，适合规划下一段时间或整理记录。"]
            .compactMap { $0 }
            .joined(separator: " ")
    }

    var todayPrimaryAction: TodayPrimaryAction {
        if captureBacklogCount > 0 {
            return TodayPrimaryAction(
                title: "先清理记录收件箱",
                detail: "有 \(captureBacklogCount) 条记录还没理解。先把模糊输入变成任务、笔记或想法。",
                buttonTitle: "打开 Capture",
                buttonSystemImage: "square.and.pencil",
                destination: nil,
                preferredTab: .capture
            )
        }

        if let overdue = overdueReminders.first {
            return TodayPrimaryAction(
                title: "先处理逾期事项",
                detail: "「\(overdue.title)」已经过期。先处理或重新安排，能马上降低心理负担。",
                buttonTitle: "查看任务",
                buttonSystemImage: "checklist",
                destination: .reminders,
                preferredTab: .today
            )
        }

        if let nextImportantReminder {
            return TodayPrimaryAction(
                title: "推进今天的下一步",
                detail: "现在最值得推进的是「\(nextImportantReminder.title)」。建议直接开一个 \(defaultFocusDuration) 分钟专注块。",
                buttonTitle: "开始专注",
                buttonSystemImage: "timer",
                destination: .focus,
                preferredTab: .today
            )
        }

        if !completedReminders.isEmpty {
            return TodayPrimaryAction(
                title: "收个尾，整理明天",
                detail: "今天已经完成 \(completedCount) 项。花 2 分钟看一下明天的时间线，会更从容。",
                buttonTitle: "查看规划",
                buttonSystemImage: "calendar",
                destination: .planner,
                preferredTab: .today
            )
        }

        return TodayPrimaryAction(
            title: "先收集今天的第一件事",
            detail: "现在列表是空的。先把要做的事记下来，我再帮你安排成今天的节奏。",
            buttonTitle: "开始记录",
            buttonSystemImage: "square.and.pencil",
            destination: nil,
            preferredTab: .capture
        )
    }

    // MARK: - Reminder Actions

    func addReminder(
        title: String,
        note: String = "",
        dueDate: Date? = nil,
        category: ReminderCategory = .work,
        priority: ReminderPriority = .medium,
        tags: [Tag] = [],
        repeatRule: RepeatRule? = nil,
        origin: ReminderOrigin = .manual,
        suggestedAt: Date? = nil
    ) {
        let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanTitle.isEmpty else { return }

        let reminder = Reminder(
            title: cleanTitle,
            note: note.trimmingCharacters(in: .whitespacesAndNewlines),
            dueDate: dueDate,
            category: category,
            priority: priority,
            origin: origin,
            repeatRule: repeatRule,
            lastSuggestedAt: suggestedAt
        )
        reminder.tags = tags
        modelContext.insert(reminder)
        try? modelContext.save()
    }

    func toggleReminder(_ reminder: Reminder) {
        reminder.isCompleted.toggle()
        if reminder.isCompleted {
            reminder.completedAt = .now
            if let rule = reminder.repeatRule, let due = reminder.dueDate {
                spawnNextOccurrence(from: reminder, rule: rule, baseDue: due)
            }
            completionSuggestion = followUpSuggestion(afterCompleting: reminder)
        } else {
            reminder.completedAt = nil
            completionSuggestion = nil
        }
        try? modelContext.save()
    }

    func deleteReminder(_ reminder: Reminder) {
        modelContext.delete(reminder)
        try? modelContext.save()
    }

    // MARK: - FlashNote Actions

    func addFlashNote(
        content: String,
        source: FlashNoteSource = .text,
        transcript: String? = nil
    ) {
        let cleanContent = content.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanContent.isEmpty else { return }

        let suggestion = captureSuggestion(for: transcript ?? cleanContent)
        let flashNote = FlashNote(
            content: cleanContent,
            source: source,
            transcript: transcript,
            category: suggestion.category,
            status: .pending,
            aiConfidence: suggestion.confidence,
            suggestedAction: suggestion.action,
            aiSuggestion: suggestion.summary
        )
        modelContext.insert(flashNote)
        try? modelContext.save()
    }

    func archiveFlashNote(_ flashNote: FlashNote) {
        flashNote.status = .archived
        flashNote.processedAt = flashNote.processedAt ?? .now
        try? modelContext.save()
    }

    func deleteFlashNote(_ flashNote: FlashNote) {
        modelContext.delete(flashNote)
        try? modelContext.save()
    }

    func processFlashNote(
        _ flashNote: FlashNote,
        category: FlashNoteCategory,
        linkedReminderId: UUID? = nil,
        linkedNoteId: UUID? = nil,
        aiSuggestion: String? = nil
    ) {
        flashNote.category = category
        flashNote.status = .processed
        flashNote.processedAt = .now
        flashNote.linkedReminderId = linkedReminderId
        flashNote.linkedNoteId = linkedNoteId
        flashNote.aiSuggestion = aiSuggestion
        try? modelContext.save()
    }

    func applySuggestedAction(for flashNote: FlashNote) {
        switch flashNote.suggestedAction ?? .idea {
        case .reminder:
            convertFlashNoteToReminder(flashNote)
        case .note:
            convertFlashNoteToNote(flashNote)
        case .idea:
            keepFlashNoteAsIdea(flashNote)
        case .schedule:
            scheduleFlashNoteToday(flashNote)
        }
    }

    func convertFlashNoteToReminder(_ flashNote: FlashNote, dueDate: Date? = nil) {
        let parsed = captureTitleAndNote(from: flashNote.rawText)
        let reminder = Reminder(
            title: parsed.title,
            note: parsed.note,
            dueDate: dueDate,
            category: flashNote.category == .idea ? .idea : .work,
            priority: .medium,
            origin: .capture,
            lastSuggestedAt: .now
        )
        modelContext.insert(reminder)
        processFlashNote(
            flashNote,
            category: dueDate == nil ? .reminder : .schedule,
            linkedReminderId: reminder.id,
            aiSuggestion: flashNote.aiSuggestion
        )
        try? modelContext.save()
    }

    func scheduleFlashNoteToday(_ flashNote: FlashNote) {
        convertFlashNoteToReminder(flashNote, dueDate: suggestedScheduleDate(for: flashNote.rawText))
    }

    func convertFlashNoteToNote(_ flashNote: FlashNote) {
        let parsed = captureTitleAndNote(from: flashNote.rawText)
        let note = Note(title: parsed.title, content: flashNote.rawText)
        modelContext.insert(note)
        processFlashNote(
            flashNote,
            category: .note,
            linkedNoteId: note.id,
            aiSuggestion: flashNote.aiSuggestion
        )
        try? modelContext.save()
    }

    func keepFlashNoteAsIdea(_ flashNote: FlashNote) {
        processFlashNote(
            flashNote,
            category: .idea,
            aiSuggestion: flashNote.aiSuggestion ?? "保留为想法，稍后再决定是否进入计划。"
        )
    }

    // MARK: - Subtask Actions

    func addSubtask(to parent: Reminder, title: String) {
        let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanTitle.isEmpty else { return }

        let sub = Reminder(
            title: cleanTitle,
            category: parent.category,
            priority: parent.priority,
            origin: parent.origin,
            sortOrder: parent.children?.count ?? 0
        )
        sub.parent = parent
        modelContext.insert(sub)
        try? modelContext.save()
    }

    func toggleSubtask(_ subtask: Reminder) {
        subtask.isCompleted.toggle()
        subtask.completedAt = subtask.isCompleted ? .now : nil

        if let parent = subtask.parent {
            let allDone = parent.subtasks.allSatisfy(\.isCompleted)
            if allDone && !parent.isCompleted {
                parent.isCompleted = true
                parent.completedAt = .now
                if let rule = parent.repeatRule, let due = parent.dueDate {
                    spawnNextOccurrence(from: parent, rule: rule, baseDue: due)
                }
                completionSuggestion = followUpSuggestion(afterCompleting: parent)
            }
        }

        try? modelContext.save()
    }

    func deleteSubtask(_ subtask: Reminder) {
        modelContext.delete(subtask)
        try? modelContext.save()
    }

    // MARK: - Tag Actions

    var allTags: [Tag] {
        let descriptor = FetchDescriptor<Tag>(sortBy: [SortDescriptor(\.name)])
        return (try? modelContext.fetch(descriptor)) ?? []
    }

    func createTag(name: String, colorHex: String = "4F7CFF") {
        let clean = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { return }
        let tag = Tag(name: clean, colorHex: colorHex)
        modelContext.insert(tag)
        try? modelContext.save()
    }

    func deleteTag(_ tag: Tag) {
        modelContext.delete(tag)
        try? modelContext.save()
    }

    func addTag(_ tag: Tag, to reminder: Reminder) {
        var current = reminder.tags ?? []
        guard !current.contains(where: { $0.id == tag.id }) else { return }
        current.append(tag)
        reminder.tags = current
        try? modelContext.save()
    }

    func removeTag(_ tag: Tag, from reminder: Reminder) {
        reminder.tags = (reminder.tags ?? []).filter { $0.id != tag.id }
        try? modelContext.save()
    }

    // MARK: - Memory Actions

    func upsertMemory(title: String, value: String, category: UserMemoryCategory) {
        let cleanValue = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanValue.isEmpty else { return }

        if let existing = allMemoryItems.first(where: { $0.title == title }) {
            existing.value = cleanValue
            existing.category = category
            existing.isEnabled = true
            existing.updatedAt = .now
        } else {
            modelContext.insert(UserMemoryItem(title: title, value: cleanValue, category: category))
        }
        try? modelContext.save()
    }

    func toggleMemory(_ item: UserMemoryItem) {
        item.isEnabled.toggle()
        item.updatedAt = .now
        try? modelContext.save()
    }

    func deleteMemory(_ item: UserMemoryItem) {
        modelContext.delete(item)
        try? modelContext.save()
    }

    func saveOnboardingProfile(
        preferredName: String,
        workHours: String,
        focusDuration: Int,
        tone: String
    ) {
        if !preferredName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            upsertMemory(title: "称呼", value: preferredName, category: .identity)
        }
        upsertMemory(title: "工作时段", value: workHours, category: .schedule)
        upsertMemory(title: "默认专注", value: "\(focusDuration)", category: .focus)
        upsertMemory(title: "沟通风格", value: tone, category: .preference)
    }

    // MARK: - Batch Operations

    func batchComplete(_ reminders: [Reminder]) {
        for reminder in reminders {
            reminder.isCompleted = true
            reminder.completedAt = .now
            if let rule = reminder.repeatRule, let due = reminder.dueDate {
                spawnNextOccurrence(from: reminder, rule: rule, baseDue: due)
            }
        }
        try? modelContext.save()
    }

    func batchDelete(_ reminders: [Reminder]) {
        for reminder in reminders {
            modelContext.delete(reminder)
        }
        try? modelContext.save()
    }

    func batchAssignToday(_ reminders: [Reminder]) {
        let calendar = Calendar.current
        let today9am = calendar.date(bySettingHour: 9, minute: 0, second: 0, of: .now) ?? .now
        for reminder in reminders {
            reminder.dueDate = today9am
            reminder.lastSuggestedAt = .now
        }
        try? modelContext.save()
    }

    func batchSetCategory(_ reminders: [Reminder], category: ReminderCategory) {
        for reminder in reminders {
            reminder.category = category
        }
        try? modelContext.save()
    }

    func moveReminder(from source: IndexSet, to destination: Int, in list: [Reminder]) {
        var mutable = list
        mutable.move(fromOffsets: source, toOffset: destination)
        for (index, reminder) in mutable.enumerated() {
            reminder.sortOrder = index
        }
        try? modelContext.save()
    }

    // MARK: - Smart Inbox

    func quickTriageToday(_ reminder: Reminder) {
        let calendar = Calendar.current
        reminder.dueDate = calendar.date(bySettingHour: 9, minute: 0, second: 0, of: .now) ?? .now
        reminder.lastSuggestedAt = .now
        try? modelContext.save()
    }

    func quickTriageThisWeek(_ reminder: Reminder) {
        let calendar = Calendar.current
        let weekday = calendar.component(.weekday, from: .now)
        let daysToFriday = (6 - weekday + 7) % 7
        let friday = calendar.date(byAdding: .day, value: max(1, daysToFriday), to: .now) ?? .now
        reminder.dueDate = calendar.date(bySettingHour: 9, minute: 0, second: 0, of: friday) ?? friday
        reminder.lastSuggestedAt = .now
        try? modelContext.save()
    }

    func quickTriageSomeday(_ reminder: Reminder) {
        reminder.priority = .low
        reminder.lastSuggestedAt = .now
        try? modelContext.save()
    }

    func assignTonight(_ reminder: Reminder) {
        let calendar = Calendar.current
        reminder.dueDate = calendar.date(bySettingHour: 20, minute: 0, second: 0, of: .now)
            ?? .now.addingTimeInterval(60 * 60 * 3)
        reminder.lastSuggestedAt = .now
        try? modelContext.save()
    }

    func assignTomorrowMorning(_ reminder: Reminder) {
        let calendar = Calendar.current
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: .now) ?? .now.addingTimeInterval(60 * 60 * 24)
        reminder.dueDate = calendar.date(bySettingHour: 9, minute: 0, second: 0, of: tomorrow) ?? tomorrow
        reminder.lastSuggestedAt = .now
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

    // MARK: - Tools

    func runTool(_ tool: ToolItem) -> String {
        switch tool.kind {
        case .focus:
            return "已准备 \(defaultFocusDuration) 分钟专注建议：先处理当前最重要的一项，然后用 5 分钟整理收尾。"
        case .note:
            return "快速笔记已准备好。建议立刻把脑中的信息写下来，避免继续占用注意力。"
        case .habit:
            return "今天的习惯建议是：先做最容易完成的一项，用小动作把节奏拉起来。"
        case .inbox:
            return "Capture 队列已准备好。先收集，再决定它是提醒、笔记还是以后再看。"
        }
    }

    // MARK: - Assistant

    func sendMessage(_ rawText: String) {
        let text = rawText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        messages.append(AssistantMessage(role: .user, content: text))

        let context = AssistantContext(
            pendingCount: pendingReminders.count,
            completedCount: completedReminders.count,
            inboxCount: inboxReminders.count,
            pendingCaptureCount: pendingFlashNotes.count,
            nextImportantTitle: nextImportantReminder?.title,
            memorySummary: memorySummaryLines,
            preferredFocusDuration: defaultFocusDuration
        )

        let placeholderIndex = messages.count
        messages.append(AssistantMessage(role: .assistant, content: "正在思考…"))
        persistMessages()

        let aiService = AIAssistantService()
        Task {
            let response = await aiService.getReply(
                for: text,
                context: context,
                localFallback: { [self] message, localContext in
                    self.localAssistantResponse(for: message, context: localContext)
                }
            )
            if placeholderIndex < messages.count {
                messages[placeholderIndex] = AssistantMessage(
                    role: .assistant,
                    content: response.reply,
                    suggestedActions: normalizedAssistantActions(from: response)
                )
            }
            persistMessages()
        }
    }

    func suggestedAssistantPrompts() -> [String] {
        var prompts: [String] = []
        if captureBacklogCount > 0 { prompts.append("帮我处理记录收件箱") }
        if !inboxReminders.isEmpty { prompts.append("帮我分拣待办收件箱") }
        if nextImportantReminder != nil {
            prompts.append("今天最重要的事是什么？")
            prompts.append("帮我拆解下一步")
        }
        prompts.append("给我一个专注建议")
        return Array(prompts.prefix(4))
    }

    func defaultAssistantActions() -> [AssistantActionSuggestion] {
        if captureBacklogCount > 0 {
            return [
                AssistantActionSuggestion(title: "整理记录", systemImage: "square.and.pencil", kind: .capture),
                AssistantActionSuggestion(title: "查看规划", systemImage: "calendar", kind: .planner),
            ]
        }
        if nextImportantReminder != nil {
            return [
                AssistantActionSuggestion(title: "打开任务", systemImage: "checklist", kind: .reminders),
                AssistantActionSuggestion(title: "开始专注", systemImage: "timer", kind: .focus),
            ]
        }
        return [
            AssistantActionSuggestion(title: "去记录", systemImage: "square.and.pencil", kind: .capture),
            AssistantActionSuggestion(title: "查看任务", systemImage: "checklist", kind: .reminders),
        ]
    }

    // MARK: - Private

    private func dueDateSort(_ reminder: Reminder) -> Date {
        reminder.dueDate ?? reminder.createdAt.addingTimeInterval(60 * 60 * 24 * 365)
    }

    private func persistMessages() {
        guard let data = try? JSONEncoder().encode(messages) else { return }
        UserDefaults.standard.set(data, forKey: "beeve.messages")
    }

    private func memoryValue(for title: String) -> String? {
        enabledMemoryItems.first(where: { $0.title == title })?.value
    }

    private func followUpSuggestion(afterCompleting reminder: Reminder) -> CompletionSuggestion {
        if let nextReminder = nextImportantReminder {
            return CompletionSuggestion(
                title: "很好，继续推进主线",
                detail: "你刚完成了「\(reminder.title)」。接下来最值得推进的是「\(nextReminder.title)」。",
                primaryLabel: "打开下一项",
                primaryDestination: .reminders,
                secondaryLabel: "开始专注",
                secondaryDestination: .tools
            )
        }

        if captureBacklogCount > 0 {
            return CompletionSuggestion(
                title: "顺手清一清记录收件箱",
                detail: "还有 \(captureBacklogCount) 条记录没有理解。趁着节奏还在，处理掉会更轻松。",
                primaryLabel: "去整理",
                primaryDestination: .assistant,
                secondaryLabel: "查看提醒",
                secondaryDestination: .reminders
            )
        }

        return CompletionSuggestion(
            title: "当前节奏不错",
            detail: "你已经推进了一件事。可以继续推进下一项，或者直接收个尾。",
            primaryLabel: "查看提醒",
            primaryDestination: .reminders,
            secondaryLabel: "开始专注",
            secondaryDestination: .tools
        )
    }

    private func normalizedAssistantActions(from response: AssistantResponse) -> [AssistantActionSuggestion]? {
        if let actions = response.suggestedActions, !actions.isEmpty {
            return actions
        }
        if let destination = response.recommendedDestination {
            return [
                AssistantActionSuggestion(
                    title: destination.label,
                    systemImage: destination.systemImage,
                    kind: actionKind(for: destination)
                ),
            ]
        }
        return nil
    }

    private func actionKind(for destination: SecondaryDestination) -> AssistantActionKind {
        switch destination {
        case .reminders:
            return .reminders
        case .planner:
            return .planner
        case .focus:
            return .focus
        case .notes:
            return .notes
        case .habits:
            return .habits
        }
    }

    private func localAssistantResponse(for text: String, context: AssistantContext) -> AssistantResponse {
        let focusMinutes = context.preferredFocusDuration ?? 25
        let memoryHint = context.memorySummary.isEmpty ? "" : "我会参考你保存的偏好。"

        if text.contains("记录") || text.contains("capture") {
            return AssistantResponse(
                reply: "\(memoryHint) 现在最适合先处理 \(context.pendingCaptureCount) 条待理解记录，把模糊输入变成任务、笔记或想法。",
                suggestedActions: [
                    AssistantActionSuggestion(title: "整理记录", systemImage: "square.and.pencil", kind: .capture),
                    AssistantActionSuggestion(title: "查看规划", systemImage: "calendar", kind: .planner),
                ],
                recommendedDestination: .planner
            )
        }

        if text.contains("收件箱") || text.contains("分拣") {
            if context.inboxCount == 0 {
                return AssistantResponse(
                    reply: "当前没有待分拣事项。你可以先把新想法记进来，我再帮你安排成下一步。",
                    suggestedActions: [
                        AssistantActionSuggestion(title: "去记录", systemImage: "square.and.pencil", kind: .capture),
                    ]
                )
            }

            return AssistantResponse(
                reply: "\(memoryHint) 你现在有 \(context.inboxCount) 条待分拣事项。建议按“今天 / 本周 / 以后”三层快速归位，再给最重要的一项补上时间。",
                suggestedActions: [
                    AssistantActionSuggestion(title: "打开任务", systemImage: "checklist", kind: .reminders),
                    AssistantActionSuggestion(title: "查看规划", systemImage: "calendar", kind: .planner),
                ],
                recommendedDestination: .reminders
            )
        }

        if text.contains("拆解") || text.contains("下一步") {
            if let title = context.nextImportantTitle {
                return AssistantResponse(
                    reply: "可以把「\(title)」拆成三步：先定义结果，再推进第一小段，最后留 5 分钟检查。这样更容易开始。",
                    suggestedActions: [
                        AssistantActionSuggestion(title: "打开任务", systemImage: "checklist", kind: .reminders),
                        AssistantActionSuggestion(title: "开始专注", systemImage: "timer", kind: .focus),
                    ],
                    recommendedDestination: .focus
                )
            }
        }

        if text.contains("重要") || text.contains("今天") {
            if let title = context.nextImportantTitle {
                return AssistantResponse(
                    reply: "\(memoryHint) 当前最值得优先推进的是「\(title)」。建议直接开一个 \(focusMinutes) 分钟专注块，把它推进到可交付的下一状态。",
                    suggestedActions: [
                        AssistantActionSuggestion(title: "开始专注", systemImage: "timer", kind: .focus),
                        AssistantActionSuggestion(title: "查看规划", systemImage: "calendar", kind: .planner),
                    ],
                    recommendedDestination: .focus
                )
            }
        }

        if text.contains("专注") || text.contains("focus") {
            return AssistantResponse(
                reply: "建议你现在开始一个 \(focusMinutes) 分钟专注块：只保留当前最重要的一项，结束后回来做一次简短复盘。",
                suggestedActions: [
                    AssistantActionSuggestion(title: "开始专注", systemImage: "timer", kind: .focus),
                    AssistantActionSuggestion(title: "打开任务", systemImage: "checklist", kind: .reminders),
                ],
                recommendedDestination: .focus
            )
        }

        return AssistantResponse(
            reply: "\(memoryHint) 我可以帮你安排今天、拆任务、处理记录收件箱，或者把想法转成提醒。你也可以直接说“帮我规划今天”。",
            suggestedActions: defaultAssistantActions(),
            recommendedDestination: nextImportantReminder == nil ? nil : .reminders
        )
    }

    private func captureSuggestion(for text: String) -> (action: FlashNoteSuggestedAction, category: FlashNoteCategory, confidence: Double, summary: String) {
        let lowercased = text.lowercased()

        if containsAny(lowercased, words: ["明天", "今晚", "下午", "上午", "周", "会议", "开会", "预约", "提醒"]) {
            return (
                .schedule,
                .schedule,
                0.88,
                "建议直接安排进今天或明天的时间线。"
            )
        }

        if text.count > 72 || text.contains("\n") || containsAny(lowercased, words: ["复盘", "总结", "笔记", "记录"]) {
            return (
                .note,
                .note,
                0.8,
                "更像一段需要保存上下文的笔记，适合先沉淀再拆任务。"
            )
        }

        if containsAny(lowercased, words: ["想法", "灵感", "idea", "也许", "可以做"]) {
            return (
                .idea,
                .idea,
                0.74,
                "先保留成想法，避免过早排进今天。"
            )
        }

        return (
            .reminder,
            .reminder,
            0.71,
            "适合直接转成提醒，再补时间和优先级。"
        )
    }

    private func captureTitleAndNote(from text: String) -> (title: String, note: String) {
        let lines = text
            .split(whereSeparator: \.isNewline)
            .map { String($0).trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }

        if let first = lines.first {
            let remainder = lines.dropFirst().joined(separator: "\n")
            if !remainder.isEmpty {
                return (String(first.prefix(40)), remainder)
            }

            let sentence = first.replacingOccurrences(of: "记得", with: "")
            if sentence.count > 40 {
                return (String(sentence.prefix(40)), first)
            }
            return (sentence, "")
        }

        return ("新提醒", text)
    }

    private func suggestedScheduleDate(for text: String) -> Date {
        let calendar = Calendar.current
        if text.contains("明天") {
            let tomorrow = calendar.date(byAdding: .day, value: 1, to: .now) ?? .now
            return calendar.date(bySettingHour: 9, minute: 0, second: 0, of: tomorrow) ?? tomorrow
        }
        if text.contains("今晚") {
            return calendar.date(bySettingHour: 20, minute: 0, second: 0, of: .now) ?? .now
        }
        if text.contains("下午") {
            return calendar.date(bySettingHour: 15, minute: 0, second: 0, of: .now) ?? .now
        }

        let nextHour = calendar.date(byAdding: .hour, value: 1, to: .now) ?? .now.addingTimeInterval(60 * 60)
        return calendar.date(bySetting: .minute, value: 0, of: nextHour) ?? nextHour
    }

    private func containsAny(_ text: String, words: [String]) -> Bool {
        words.contains { text.contains($0) }
    }

    private func spawnNextOccurrence(from reminder: Reminder, rule: RepeatRule, baseDue: Date) {
        let nextDate = rule.nextOccurrence(from: baseDue)
        let next = Reminder(
            title: reminder.title,
            note: reminder.note,
            dueDate: nextDate,
            category: reminder.category,
            priority: reminder.priority,
            origin: .recurring,
            repeatRule: rule
        )
        next.tags = reminder.tags
        modelContext.insert(next)
    }
}

// MARK: - Data Migration

extension BeeveStore {
    static func migrateFromUserDefaults(into context: ModelContext) {
        ensureDefaultTags(in: context)

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
                origin: .manual,
                isCompleted: item.isCompleted,
                completedAt: item.isCompleted ? .now : nil
            )
            context.insert(reminder)
        }

        try? context.save()
        UserDefaults.standard.removeObject(forKey: "beeve.reminders")
    }

    static func ensureDefaultTags(in context: ModelContext) {
        let descriptor = FetchDescriptor<Tag>()
        let tagCount = (try? context.fetchCount(descriptor)) ?? 0
        guard tagCount == 0 else { return }

        for (name, hex) in Tag.defaultTags {
            context.insert(Tag(name: name, colorHex: hex))
        }

        try? context.save()
    }
}
