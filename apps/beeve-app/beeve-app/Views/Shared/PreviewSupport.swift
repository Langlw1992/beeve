import SwiftData
import SwiftUI

enum BeevePreviewData {
    static let container: ModelContainer = {
        let configuration = ModelConfiguration(isStoredInMemoryOnly: true)
        let container = try! ModelContainer(
            for: Reminder.self,
            Tag.self,
            FocusSession.self,
            Habit.self,
            HabitLog.self,
            Note.self,
            FlashNote.self,
            UserMemoryItem.self,
            configurations: configuration
        )

        let context = container.mainContext
        BeeveStore.ensureDefaultTags(in: context)

        let reminder = Reminder(
            title: "整理今天的版本优先级",
            note: "先收口 AI 主路径，再补细节",
            dueDate: .now.addingTimeInterval(60 * 45),
            category: .work,
            priority: .high
        )
        let inbox = Reminder(title: "给周会准备要点", category: .work, priority: .medium)
        let focus = FocusSession(duration: 25 * 60, linkedReminder: reminder)
        focus.elapsed = 15 * 60
        focus.isCompleted = true
        let note = Note(title: "产品思路", content: "把 Beeve 收敛为真正的 AI 助理。")
        let flash = FlashNote(
            content: "明天上午和设计对一下 Today 页节奏",
            category: .schedule,
            status: .pending,
            aiConfidence: 0.86,
            suggestedAction: .schedule,
            aiSuggestion: "建议直接安排到明天上午。"
        )

        context.insert(reminder)
        context.insert(inbox)
        context.insert(focus)
        context.insert(note)
        context.insert(flash)
        context.insert(UserMemoryItem(title: "工作时段", value: "09:00 - 18:00", category: .schedule))
        context.insert(UserMemoryItem(title: "默认专注", value: "25", category: .focus))
        try? context.save()

        return container
    }()

    static let store = BeeveStore(modelContext: container.mainContext)
}

struct BeevePreview<Content: View>: View {
    let content: () -> Content

    var body: some View {
        content()
            .environment(BeevePreviewData.store)
            .modelContainer(BeevePreviewData.container)
    }
}
