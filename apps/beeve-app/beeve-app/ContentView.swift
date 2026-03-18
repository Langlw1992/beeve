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

    private let tabBarInsetHeight: CGFloat = 88

    var body: some View {
        ZStack(alignment: .bottom) {
            currentTabView
                .safeAreaInset(edge: .bottom, spacing: 0) {
                    Color.clear
                        .frame(height: tabBarInsetHeight)
                }

            customTabBar
        }
        .sheet(isPresented: $showAddReminder) {
            AddReminderSheet()
                .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showQuickCapture) {
            QuickCaptureSheet()
        }
        .onAppear {
            setupNotifications()
        }
    }

    @ViewBuilder
    private var currentTabView: some View {
        switch selectedTab {
        case .home:
            DashboardView(
                onAddReminder: { showAddReminder = true },
                onOpenFlashNotes: { selectedTab = .record }
            )
        case .record:
            FlashNoteListView()
        }
    }

    private var customTabBar: some View {
        HStack(alignment: .bottom, spacing: 12) {
            tabButton(tab: .home, symbol: "house.fill", label: "首页")

            centerButton
                .frame(width: 84)

            tabButton(tab: .record, symbol: "clock.arrow.circlepath", label: "记录")
        }
        .padding(.horizontal, 32)
        .padding(.top, 12)
        .padding(.bottom, 8)
        .background(alignment: .bottom) {
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea(edges: .bottom)
        }
    }

    private func tabButton(tab: AppTab, symbol: String, label: String) -> some View {
        Button {
            selectedTab = tab
        } label: {
            VStack(spacing: 4) {
                Image(systemName: symbol)
                    .font(.system(size: 22, weight: .semibold))
                Text(label)
                    .font(.caption2)
            }
            .foregroundStyle(selectedTab == tab ? Color.indigo : .secondary)
            .frame(maxWidth: .infinity)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private var centerButton: some View {
        Button {
            showQuickCapture = true
        } label: {
            ZStack {
                Circle()
                    .fill(Color(uiColor: .systemBackground))
                    .frame(width: 64, height: 64)

                Circle()
                    .fill(Color.indigo)
                    .frame(width: 56, height: 56)
                    .overlay {
                        Image(systemName: "mic.fill")
                            .font(.system(size: 22, weight: .semibold))
                            .foregroundStyle(.white)
                    }
                    .shadow(color: Color.indigo.opacity(0.25), radius: 8, y: 4)
            }
        }
        .buttonStyle(PressableScaleButtonStyle())
        .offset(y: -20)
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
