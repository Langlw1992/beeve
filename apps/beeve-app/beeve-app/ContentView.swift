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
    @State private var showQuickCapture = false

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab("首页", systemImage: "house.fill", value: .home) {
                DashboardView(
                    onAddReminder: { showAddReminder = true },
                    onOpenFlashNotes: { selectedTab = .record }
                )
            }

            Tab("记录", systemImage: "clock.arrow.circlepath", value: .record) {
                FlashNoteListView()
            }
        }
        .tint(.indigo)
        .overlay(alignment: .bottom) {
            quickCaptureButton
        }
        .sheet(isPresented: $showAddReminder) {
            AddReminderSheet()
                .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showQuickCapture) {
            QuickCaptureSheet()
        }
        .onAppear {
            configureTabBarAppearance()
            setupNotifications()
        }
    }

    private var quickCaptureButton: some View {
        Button {
            showQuickCapture = true
        } label: {
            Image(systemName: "mic.fill")
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 56, height: 56)
                .background(Color.indigo, in: Circle())
                .shadow(color: Color.indigo.opacity(0.3), radius: 8, y: 4)
        }
        .buttonStyle(PressableScaleButtonStyle())
        .padding(.bottom, 18)
        .accessibilityLabel("AI 速记")
    }

    private func setupNotifications() {
        let service = NotificationService.shared
        service.registerCategories()
        Task {
            let granted = await service.requestAuthorization()
            if granted {
                service.scheduleMorningDigest(pendingCount: store.pendingCount)
                service.scheduleEveningReview(completedToday: store.completedCount, pendingCount: store.pendingCount)
                // Schedule notifications for pending reminders with due dates
                for reminder in store.pendingReminders where reminder.dueDate != nil {
                    service.scheduleNotification(for: reminder)
                }
            }
        }
    }
}

private struct QuickCaptureSheet: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Spacer()

                CircleIconBadge(symbol: "mic.fill", tint: .indigo, size: 64, iconSize: 24)

                VStack(spacing: 8) {
                    Text("快速记录")
                        .font(.title2.bold())
                    Text("先把想法记下来，稍后再整理成提醒、笔记或灵感。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 24)

                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(AppBackgroundView())
            .navigationTitle("快速记录")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("关闭") { dismiss() }
                }
            }
            .safeAreaInset(edge: .bottom) {
                FlashNoteInputBar(onSend: { dismiss() })
            }
        }
    }
}
