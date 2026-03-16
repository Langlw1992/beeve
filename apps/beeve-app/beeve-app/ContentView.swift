//
//  ContentView.swift
//  beeve-app
//
//  Created by lang on 2026/3/12.
//

import SwiftUI

struct ContentView: View {
    @Environment(BeeveStore.self) private var store
    @State private var selectedTab: AppTab = .home
    @State private var showAddReminder = false
    @State private var showAssistant = false

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab("首页", systemImage: "house.fill", value: .home) {
                DashboardView(
                    onAddReminder: { showAddReminder = true },
                    onOpenReminders: { selectedTab = .reminders },
                    onOpenTools: { selectedTab = .tools },
                    onOpenAssistant: { showAssistant = true }
                )
            }

            Tab("提醒", systemImage: "bell.badge.fill", value: .reminders) {
                RemindersView(
                    onAddReminder: { showAddReminder = true },
                    onOpenAssistant: { showAssistant = true }
                )
            }

            Tab("工具", systemImage: "square.grid.2x2.fill", value: .tools) {
                ToolsView(onOpenAssistant: { showAssistant = true })
            }

            Tab("我的", systemImage: "person.circle.fill", value: .profile) {
                ProfileView(onOpenAssistant: { showAssistant = true })
            }
        }
        .tint(.indigo)
        .sheet(isPresented: $showAddReminder) {
            AddReminderSheet()
                .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showAssistant) {
            AssistantSheet()
                .presentationDetents([.large])
        }
        .onAppear {
            configureTabBarAppearance()
        }
    }
}
