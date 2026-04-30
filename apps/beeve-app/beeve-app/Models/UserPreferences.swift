import Foundation
import SwiftData

@Model
final class UserPreferences {
    var preferredName: String
    var workStartHour: Int
    var workStartMinute: Int
    var workEndHour: Int
    var workEndMinute: Int
    var toneRawValue: String
    var hasCompletedOnboarding: Bool
    var notificationsEnabled: Bool
    var createdAt: Date
    var updatedAt: Date

    init(
        preferredName: String = "",
        workStartHour: Int = 9,
        workStartMinute: Int = 30,
        workEndHour: Int = 18,
        workEndMinute: Int = 30,
        tone: FutureSelfTone = .calm,
        hasCompletedOnboarding: Bool = false,
        notificationsEnabled: Bool = true,
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.preferredName = preferredName
        self.workStartHour = workStartHour
        self.workStartMinute = workStartMinute
        self.workEndHour = workEndHour
        self.workEndMinute = workEndMinute
        self.toneRawValue = tone.rawValue
        self.hasCompletedOnboarding = hasCompletedOnboarding
        self.notificationsEnabled = notificationsEnabled
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    var tone: FutureSelfTone {
        get { FutureSelfTone(rawValue: toneRawValue) ?? .calm }
        set {
            toneRawValue = newValue.rawValue
            updatedAt = .now
        }
    }
}
