//
//  beeve_appApp.swift
//  beeve-app
//
//  Created by lang on 2026/3/12.
//

import SwiftData
import SwiftUI

@main
struct BeeveAppApp: App {
    let modelContainer: ModelContainer
    @State private var store: BeeveStore

    init() {
        let container = try! ModelContainer(
            for: Reminder.self,
            Tag.self,
            FocusSession.self,
            Habit.self,
            HabitLog.self,
            Note.self,
            FlashNote.self,
            UserMemoryItem.self
        )
        self.modelContainer = container

        let context = container.mainContext
        BeeveStore.migrateFromUserDefaults(into: context)
        BeeveStore.ensureDefaultTags(in: context)

        self._store = State(initialValue: BeeveStore(modelContext: context))
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(store)
                .modelContainer(modelContainer)
        }
    }
}
