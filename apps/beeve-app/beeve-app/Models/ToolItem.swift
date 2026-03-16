import Foundation
import SwiftUI

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
        case .focus: .orange
        case .note: .blue
        case .habit: .green
        case .inbox: .purple
        }
    }

    static let defaults: [ToolItem] = [
        ToolItem(kind: .focus, title: "专注计时", description: "给当前最重要的任务一个 25 分钟时间块。", symbolName: "timer", statusText: "适合现在开始"),
        ToolItem(kind: .note, title: "快速笔记", description: "把脑中的事项和灵感快速落下来。", symbolName: "note.text", statusText: "适合即时记录"),
        ToolItem(kind: .habit, title: "习惯打卡", description: "用最小动作建立今天的状态。", symbolName: "checkmark.seal", statusText: "适合建立节奏"),
        ToolItem(kind: .inbox, title: "灵感收件箱", description: "先收集，再决定是否变成提醒。", symbolName: "tray.full", statusText: "适合清理脑负担"),
    ]
}
