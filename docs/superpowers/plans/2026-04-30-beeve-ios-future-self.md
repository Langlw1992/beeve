# Beeve iOS Future Self Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `apps/beeve-app` as a focused native iOS app where "future-you" helps ordinary workers collect the day, generate an achievement card, and make tomorrow lighter.

**Architecture:** Create a local-first SwiftUI app with SwiftData persistence, deterministic future-self generation, and local notifications. Keep generation, persistence, notification scheduling, and views separated so AI, widgets, share sheets, and auth can be added later without rewriting the core loop.

**Tech Stack:** SwiftUI, SwiftData, Observation, UserNotifications, Xcode 26 project format with filesystem synchronized groups.

---

## File Structure

Create these files under `apps/beeve-app`:

- `beeve-app.xcodeproj/project.pbxproj`: Xcode project with one iOS application target named `beeve-app`.
- `beeve-app.xcodeproj/project.xcworkspace/contents.xcworkspacedata`: workspace metadata.
- `beeve-app/beeve_appApp.swift`: app entry point, SwiftData model container, root scene.
- `beeve-app/ContentView.swift`: top-level tab shell.
- `beeve-app/Models/UserPreferences.swift`: onboarding and notification preferences.
- `beeve-app/Models/DailyFocus.swift`: one meaningful focus per day.
- `beeve-app/Models/DayEntry.swift`: done, interrupted, and tomorrow log entries.
- `beeve-app/Models/AchievementCard.swift`: generated evening card.
- `beeve-app/Models/AppTypes.swift`: shared enums and value objects.
- `beeve-app/Services/DayContext.swift`: query container for today's data.
- `beeve-app/Services/FutureSelfGenerator.swift`: deterministic note and achievement-card generation.
- `beeve-app/Services/NotificationScheduler.swift`: local notification permission and scheduling.
- `beeve-app/Services/SampleData.swift`: SwiftUI preview sample values.
- `beeve-app/Theme/DesignSystem.swift`: native iOS visual tokens and reusable styles.
- `beeve-app/Views/Onboarding/OnboardingView.swift`: first-launch setup.
- `beeve-app/Views/Today/TodayView.swift`: primary working surface.
- `beeve-app/Views/Today/QuickLogSheet.swift`: one-sentence logging flow.
- `beeve-app/Views/Today/FocusEditorView.swift`: set or edit today's focus.
- `beeve-app/Views/Cards/CardsView.swift`: achievement-card history.
- `beeve-app/Views/Cards/AchievementCardView.swift`: card presentation.
- `beeve-app/Views/Settings/SettingsView.swift`: preferences, notifications, reset.
- `beeve-app/Assets.xcassets/Contents.json`: asset catalog root.
- `beeve-app/Assets.xcassets/AccentColor.colorset/Contents.json`: blue accent.
- `beeve-app/Assets.xcassets/AppIcon.appiconset/Contents.json`: app icon metadata.

## Task 1: Scaffold the Native iOS Project

**Files:**
- Create: `apps/beeve-app/beeve-app.xcodeproj/project.pbxproj`
- Create: `apps/beeve-app/beeve-app.xcodeproj/project.xcworkspace/contents.xcworkspacedata`
- Create: `apps/beeve-app/beeve-app/beeve_appApp.swift`
- Create: `apps/beeve-app/beeve-app/ContentView.swift`
- Create: `apps/beeve-app/beeve-app/Assets.xcassets/Contents.json`
- Create: `apps/beeve-app/beeve-app/Assets.xcassets/AccentColor.colorset/Contents.json`
- Create: `apps/beeve-app/beeve-app/Assets.xcassets/AppIcon.appiconset/Contents.json`

- [ ] **Step 1: Create the project and workspace metadata**

Use the previous Xcode 26 project format as the template: one `PBXFileSystemSynchronizedRootGroup` named `beeve-app`, one native application target, generated Info.plist, automatic signing, `PRODUCT_BUNDLE_IDENTIFIER = "beeve.beeve-app"`, `TARGETED_DEVICE_FAMILY = "1,2"`, and `IPHONEOS_DEPLOYMENT_TARGET = 26.2`.

`apps/beeve-app/beeve-app.xcodeproj/project.xcworkspace/contents.xcworkspacedata`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Workspace
   version = "1.0">
   <FileRef
      location = "self:">
   </FileRef>
</Workspace>
```

- [ ] **Step 2: Add the minimal app entry point**

`apps/beeve-app/beeve-app/beeve_appApp.swift`:

```swift
import SwiftData
import SwiftUI

@main
struct BeeveAppApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

- [ ] **Step 3: Add the temporary root view**

`apps/beeve-app/beeve-app/ContentView.swift`:

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Beeve")
            .font(.title)
            .fontWeight(.semibold)
            .padding()
    }
}
```

- [ ] **Step 4: Add the asset catalog**

`apps/beeve-app/beeve-app/Assets.xcassets/Contents.json`:

```json
{
  "info": {
    "author": "xcode",
    "version": 1
  }
}
```

`apps/beeve-app/beeve-app/Assets.xcassets/AccentColor.colorset/Contents.json`:

```json
{
  "colors": [
    {
      "idiom": "universal",
      "color": {
        "color-space": "srgb",
        "components": {
          "red": "0.145",
          "green": "0.388",
          "blue": "0.922",
          "alpha": "1.000"
        }
      }
    }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  }
}
```

`apps/beeve-app/beeve-app/Assets.xcassets/AppIcon.appiconset/Contents.json`:

```json
{
  "images": [
    {
      "idiom": "universal",
      "platform": "ios",
      "size": "1024x1024"
    }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  }
}
```

- [ ] **Step 5: Verify the app target builds**

Run:

```bash
xcodebuild -project apps/beeve-app/beeve-app.xcodeproj -scheme beeve-app -destination 'generic/platform=iOS' build
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 6: Commit**

```bash
git add apps/beeve-app
git commit -m "feat: scaffold beeve ios app"
```

## Task 2: Add the Core Domain Models

**Files:**
- Modify: `apps/beeve-app/beeve-app/beeve_appApp.swift`
- Create: `apps/beeve-app/beeve-app/Models/AppTypes.swift`
- Create: `apps/beeve-app/beeve-app/Models/UserPreferences.swift`
- Create: `apps/beeve-app/beeve-app/Models/DailyFocus.swift`
- Create: `apps/beeve-app/beeve-app/Models/DayEntry.swift`
- Create: `apps/beeve-app/beeve-app/Models/AchievementCard.swift`

- [ ] **Step 1: Add shared value types**

`apps/beeve-app/beeve-app/Models/AppTypes.swift`:

```swift
import Foundation

enum AppTab: Hashable {
    case today
    case cards
    case settings
}

enum DayEntryKind: String, Codable, CaseIterable, Identifiable {
    case done
    case interrupted
    case tomorrow

    var id: String { rawValue }

    var title: String {
        switch self {
        case .done: "Done"
        case .interrupted: "Interrupted"
        case .tomorrow: "Tomorrow"
        }
    }

    var prompt: String {
        switch self {
        case .done: "What moved forward?"
        case .interrupted: "What pulled you away?"
        case .tomorrow: "What should future-you remember?"
        }
    }
}

enum FutureSelfTone: String, Codable, CaseIterable, Identifiable {
    case calm
    case concise
    case firm

    var id: String { rawValue }

    var label: String {
        switch self {
        case .calm: "Calm"
        case .concise: "Concise"
        case .firm: "Firm"
        }
    }
}
```

- [ ] **Step 2: Add SwiftData models**

`apps/beeve-app/beeve-app/Models/UserPreferences.swift`:

```swift
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
```

`apps/beeve-app/beeve-app/Models/DailyFocus.swift`:

```swift
import Foundation
import SwiftData

@Model
final class DailyFocus {
    var date: Date
    var title: String
    var isCompleted: Bool
    var createdAt: Date
    var updatedAt: Date

    init(date: Date = .now, title: String, isCompleted: Bool = false, createdAt: Date = .now, updatedAt: Date = .now) {
        self.date = Calendar.current.startOfDay(for: date)
        self.title = title
        self.isCompleted = isCompleted
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
```

`apps/beeve-app/beeve-app/Models/DayEntry.swift`:

```swift
import Foundation
import SwiftData

@Model
final class DayEntry {
    var date: Date
    var kindRawValue: String
    var text: String
    var createdAt: Date

    init(date: Date = .now, kind: DayEntryKind, text: String, createdAt: Date = .now) {
        self.date = Calendar.current.startOfDay(for: date)
        self.kindRawValue = kind.rawValue
        self.text = text
        self.createdAt = createdAt
    }

    var kind: DayEntryKind {
        DayEntryKind(rawValue: kindRawValue) ?? .done
    }
}
```

`apps/beeve-app/beeve-app/Models/AchievementCard.swift`:

```swift
import Foundation
import SwiftData

@Model
final class AchievementCard {
    var date: Date
    var title: String
    var summaryBullets: [String]
    var interruptionReframe: String
    var tomorrowPriorities: [String]
    var closingLine: String
    var createdAt: Date

    init(
        date: Date = .now,
        title: String,
        summaryBullets: [String],
        interruptionReframe: String,
        tomorrowPriorities: [String],
        closingLine: String,
        createdAt: Date = .now
    ) {
        self.date = Calendar.current.startOfDay(for: date)
        self.title = title
        self.summaryBullets = summaryBullets
        self.interruptionReframe = interruptionReframe
        self.tomorrowPriorities = tomorrowPriorities
        self.closingLine = closingLine
        self.createdAt = createdAt
    }
}
```

- [ ] **Step 3: Register the SwiftData model container**

`apps/beeve-app/beeve-app/beeve_appApp.swift`:

```swift
import SwiftData
import SwiftUI

@main
struct BeeveAppApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [
            UserPreferences.self,
            DailyFocus.self,
            DayEntry.self,
            AchievementCard.self,
        ])
    }
}
```

- [ ] **Step 4: Verify the app still builds**

Run:

```bash
xcodebuild -project apps/beeve-app/beeve-app.xcodeproj -scheme beeve-app -destination 'generic/platform=iOS' build
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 5: Commit**

```bash
git add apps/beeve-app
git commit -m "feat: add beeve day models"
```

## Task 3: Add Future-Self Generation

**Files:**
- Create: `apps/beeve-app/beeve-app/Services/DayContext.swift`
- Create: `apps/beeve-app/beeve-app/Services/FutureSelfGenerator.swift`

- [ ] **Step 1: Add the day context value**

`apps/beeve-app/beeve-app/Services/DayContext.swift`:

```swift
import Foundation

struct DayContext {
    let date: Date
    let preferences: UserPreferences
    let focus: DailyFocus?
    let entries: [DayEntry]

    var doneEntries: [DayEntry] {
        entries.filter { $0.kind == .done }
    }

    var interruptedEntries: [DayEntry] {
        entries.filter { $0.kind == .interrupted }
    }

    var tomorrowEntries: [DayEntry] {
        entries.filter { $0.kind == .tomorrow }
    }
}
```

- [ ] **Step 2: Add deterministic generation**

`apps/beeve-app/beeve-app/Services/FutureSelfGenerator.swift`:

```swift
import Foundation

struct FutureSelfGenerator {
    func note(for context: DayContext, now: Date = .now) -> String {
        let hour = Calendar.current.component(.hour, from: now)
        let name = context.preferences.preferredName.trimmingCharacters(in: .whitespacesAndNewlines)
        let prefix = name.isEmpty ? "" : "\(name), "

        switch hour {
        case 5..<12:
            return "\(prefix)future-you only needs one real move today. Pick it before the day picks for you."
        case 12..<17:
            return "\(prefix)do not open another loop yet. Collect what is already moving."
        case 17..<22:
            return "\(prefix)before you call the day wasted, write down what actually moved."
        default:
            return "\(prefix)leave tomorrow one clear thread, not a pile."
        }
    }

    func makeAchievementCard(from context: DayContext) -> AchievementCard {
        let done = context.doneEntries.map(\.text).filter { !$0.isEmpty }
        let interruptions = context.interruptedEntries.map(\.text).filter { !$0.isEmpty }
        let tomorrow = context.tomorrowEntries.map(\.text).filter { !$0.isEmpty }

        let bullets = Array(done.prefix(5))
        let title = bullets.isEmpty ? "A day worth collecting" : "Today moved more than it felt"
        let reframe: String

        if interruptions.isEmpty {
            reframe = "There were no logged interruptions. Keep the day simple and honest."
        } else {
            reframe = "The interruptions counted too: \(interruptions.prefix(2).joined(separator: ", "))."
        }

        let priorities = Array((tomorrow + [context.focus?.title].compactMap { $0 }).prefix(3))
        let closingLine = priorities.isEmpty
            ? "Future-you only needs one clear start tomorrow."
            : "Tomorrow starts lighter because you named the next thread."

        return AchievementCard(
            date: context.date,
            title: title,
            summaryBullets: bullets.isEmpty ? ["You showed up enough to collect the day."] : bullets,
            interruptionReframe: reframe,
            tomorrowPriorities: priorities,
            closingLine: closingLine
        )
    }
}
```

- [ ] **Step 3: Verify build**

Run:

```bash
xcodebuild -project apps/beeve-app/beeve-app.xcodeproj -scheme beeve-app -destination 'generic/platform=iOS' build
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 4: Commit**

```bash
git add apps/beeve-app
git commit -m "feat: add future-self generation"
```

## Task 4: Add Notification Scheduling

**Files:**
- Create: `apps/beeve-app/beeve-app/Services/NotificationScheduler.swift`

- [ ] **Step 1: Add the scheduler**

`apps/beeve-app/beeve-app/Services/NotificationScheduler.swift`:

```swift
import Foundation
import UserNotifications

struct NotificationScheduler {
    private let center = UNUserNotificationCenter.current()

    func requestAuthorization() async -> Bool {
        do {
            return try await center.requestAuthorization(options: [.alert, .sound, .badge])
        } catch {
            return false
        }
    }

    func scheduleDailyReminders(preferences: UserPreferences) async {
        center.removePendingNotificationRequests(withIdentifiers: [
            "beeve.morning-focus",
            "beeve.afternoon-collect",
            "beeve.evening-card",
        ])

        guard preferences.notificationsEnabled else { return }

        await schedule(
            id: "beeve.morning-focus",
            title: "Future-you has one request",
            body: "Pick the one thing that would make today feel less scattered.",
            hour: preferences.workStartHour,
            minute: min(preferences.workStartMinute + 15, 59)
        )

        await schedule(
            id: "beeve.afternoon-collect",
            title: "Collect before you continue",
            body: "Do not open another loop yet. Write down what already moved.",
            hour: max(preferences.workEndHour - 1, 0),
            minute: preferences.workEndMinute
        )

        await schedule(
            id: "beeve.evening-card",
            title: "Was today really wasted?",
            body: "Future-you wants the evidence before you decide.",
            hour: preferences.workEndHour,
            minute: min(preferences.workEndMinute + 30, 59)
        )
    }

    private func schedule(id: String, title: String, body: String, hour: Int, minute: Int) async {
        var components = DateComponents()
        components.hour = hour
        components.minute = minute

        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
        try? await center.add(request)
    }
}
```

- [ ] **Step 2: Verify build**

Run:

```bash
xcodebuild -project apps/beeve-app/beeve-app.xcodeproj -scheme beeve-app -destination 'generic/platform=iOS' build
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 3: Commit**

```bash
git add apps/beeve-app
git commit -m "feat: schedule beeve daily reminders"
```

## Task 5: Add the Visual System and App Shell

**Files:**
- Modify: `apps/beeve-app/beeve-app/ContentView.swift`
- Create: `apps/beeve-app/beeve-app/Theme/DesignSystem.swift`
- Create: `apps/beeve-app/beeve-app/Services/SampleData.swift`

- [ ] **Step 1: Add native visual tokens**

`apps/beeve-app/beeve-app/Theme/DesignSystem.swift`:

```swift
import SwiftUI

enum BeeveDesign {
    static let background = Color(.systemBackground)
    static let secondaryBackground = Color(.secondarySystemBackground)
    static let border = Color(.separator).opacity(0.35)
    static let accent = Color.accentColor
    static let mutedText = Color.secondary
    static let radius: CGFloat = 12
    static let controlHeight: CGFloat = 44
}

struct BeevePanel: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(BeeveDesign.secondaryBackground)
            .clipShape(RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous)
                    .stroke(BeeveDesign.border, lineWidth: 1)
            }
    }
}

extension View {
    func beevePanel() -> some View {
        modifier(BeevePanel())
    }
}
```

- [ ] **Step 2: Add sample data helpers for previews**

`apps/beeve-app/beeve-app/Services/SampleData.swift`:

```swift
import Foundation

enum SampleData {
    static let preferences = UserPreferences(preferredName: "Lang", hasCompletedOnboarding: true)
    static let focus = DailyFocus(title: "Ship the first Beeve iOS loop")
    static let entries = [
        DayEntry(kind: .done, text: "Finished the product direction"),
        DayEntry(kind: .interrupted, text: "Handled an urgent auth issue"),
        DayEntry(kind: .tomorrow, text: "Create the first shareable achievement card"),
    ]
}
```

- [ ] **Step 3: Replace the temporary root with the tab shell**

`apps/beeve-app/beeve-app/ContentView.swift`:

```swift
import SwiftUI

struct ContentView: View {
    @State private var selectedTab: AppTab = .today

    var body: some View {
        TabView(selection: $selectedTab) {
            TodayView()
                .tag(AppTab.today)
                .tabItem {
                    Label("Today", systemImage: "sun.max")
                }

            CardsView()
                .tag(AppTab.cards)
                .tabItem {
                    Label("Cards", systemImage: "rectangle.stack")
                }

            SettingsView()
                .tag(AppTab.settings)
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
        }
        .tint(BeeveDesign.accent)
    }
}
```

- [ ] **Step 4: Add minimal destination views so the shell builds**

`apps/beeve-app/beeve-app/Views/Today/TodayView.swift`:

```swift
import SwiftUI

struct TodayView: View {
    var body: some View {
        NavigationStack {
            Text("Today")
                .navigationTitle("Beeve")
        }
    }
}
```

`apps/beeve-app/beeve-app/Views/Cards/CardsView.swift`:

```swift
import SwiftUI

struct CardsView: View {
    var body: some View {
        NavigationStack {
            Text("Cards")
                .navigationTitle("Cards")
        }
    }
}
```

`apps/beeve-app/beeve-app/Views/Settings/SettingsView.swift`:

```swift
import SwiftUI

struct SettingsView: View {
    var body: some View {
        NavigationStack {
            Text("Settings")
                .navigationTitle("Settings")
        }
    }
}
```

- [ ] **Step 5: Verify build**

Run:

```bash
xcodebuild -project apps/beeve-app/beeve-app.xcodeproj -scheme beeve-app -destination 'generic/platform=iOS' build
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 6: Commit**

```bash
git add apps/beeve-app
git commit -m "feat: add beeve ios app shell"
```

## Task 6: Build Onboarding

**Files:**
- Modify: `apps/beeve-app/beeve-app/ContentView.swift`
- Create: `apps/beeve-app/beeve-app/Views/Onboarding/OnboardingView.swift`

- [ ] **Step 1: Add onboarding view**

`apps/beeve-app/beeve-app/Views/Onboarding/OnboardingView.swift`:

```swift
import SwiftData
import SwiftUI

struct OnboardingView: View {
    @Environment(\.modelContext) private var modelContext
    @Bindable var preferences: UserPreferences
    let onComplete: () -> Void

    var body: some View {
        NavigationStack {
            Form {
                Section("Future-you") {
                    TextField("Preferred name", text: $preferences.preferredName)
                    Picker("Tone", selection: Binding(
                        get: { preferences.tone },
                        set: { preferences.tone = $0 }
                    )) {
                        ForEach(FutureSelfTone.allCases) { tone in
                            Text(tone.label).tag(tone)
                        }
                    }
                }

                Section("Workday rhythm") {
                    Stepper("Start hour: \(preferences.workStartHour)", value: $preferences.workStartHour, in: 0...23)
                    Stepper("End hour: \(preferences.workEndHour)", value: $preferences.workEndHour, in: 0...23)
                    Toggle("Daily reminders", isOn: $preferences.notificationsEnabled)
                }

                Section {
                    Button("Start with today") {
                        preferences.hasCompletedOnboarding = true
                        preferences.updatedAt = .now
                        try? modelContext.save()
                        onComplete()
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle("Set your rhythm")
        }
    }
}
```

- [ ] **Step 2: Present onboarding when preferences are incomplete**

Replace `ContentView` with this structure:

```swift
import SwiftData
import SwiftUI

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var preferences: [UserPreferences]
    @State private var selectedTab: AppTab = .today

    private var activePreferences: UserPreferences {
        if let existing = preferences.first {
            return existing
        }

        let created = UserPreferences()
        modelContext.insert(created)
        try? modelContext.save()
        return created
    }

    var body: some View {
        let preferences = activePreferences

        Group {
            if preferences.hasCompletedOnboarding {
                tabShell
            } else {
                OnboardingView(preferences: preferences) {
                    Task {
                        await NotificationScheduler().scheduleDailyReminders(preferences: preferences)
                    }
                }
            }
        }
    }

    private var tabShell: some View {
        TabView(selection: $selectedTab) {
            TodayView()
                .tag(AppTab.today)
                .tabItem {
                    Label("Today", systemImage: "sun.max")
                }

            CardsView()
                .tag(AppTab.cards)
                .tabItem {
                    Label("Cards", systemImage: "rectangle.stack")
                }

            SettingsView()
                .tag(AppTab.settings)
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
        }
        .tint(BeeveDesign.accent)
    }
}
```

- [ ] **Step 3: Verify build**

Run:

```bash
xcodebuild -project apps/beeve-app/beeve-app.xcodeproj -scheme beeve-app -destination 'generic/platform=iOS' build
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 4: Commit**

```bash
git add apps/beeve-app
git commit -m "feat: add beeve onboarding"
```

## Task 7: Build Today, Quick Log, and Focus Editing

**Files:**
- Create/Modify: `apps/beeve-app/beeve-app/Views/Today/TodayView.swift`
- Create: `apps/beeve-app/beeve-app/Views/Today/QuickLogSheet.swift`
- Create: `apps/beeve-app/beeve-app/Views/Today/FocusEditorView.swift`

- [ ] **Step 1: Build the Today layout**

`TodayView` fetches today's focus and entries with SwiftData queries, creates a `DayContext`, displays the generated future-self note, displays today's focus, groups entries by `DayEntryKind`, and exposes one primary "Log one thing" button. Use this structure:

```swift
import SwiftData
import SwiftUI

struct TodayView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var preferences: [UserPreferences]
    @Query(sort: \DailyFocus.createdAt, order: .reverse) private var focuses: [DailyFocus]
    @Query(sort: \DayEntry.createdAt, order: .reverse) private var entries: [DayEntry]
    @State private var isLogging = false
    @State private var isEditingFocus = false

    private var today: Date {
        Calendar.current.startOfDay(for: .now)
    }

    private var activePreferences: UserPreferences {
        preferences.first ?? UserPreferences(hasCompletedOnboarding: true)
    }

    private var todayFocus: DailyFocus? {
        focuses.first { Calendar.current.isDate($0.date, inSameDayAs: today) }
    }

    private var todayEntries: [DayEntry] {
        entries.filter { Calendar.current.isDate($0.date, inSameDayAs: today) }
    }

    private var context: DayContext {
        DayContext(date: today, preferences: activePreferences, focus: todayFocus, entries: todayEntries)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text(FutureSelfGenerator().note(for: context))
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(.primary)
                        .beevePanel()

                    focusSection
                    entrySection(title: "Moved forward", kind: .done)
                    entrySection(title: "Still counted", kind: .interrupted)
                    entrySection(title: "Tomorrow remembers", kind: .tomorrow)
                }
                .padding(16)
            }
            .background(BeeveDesign.background)
            .navigationTitle("Today")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isLogging = true
                    } label: {
                        Label("Log one thing", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $isLogging) {
                QuickLogSheet()
                    .presentationDetents([.medium])
            }
            .sheet(isPresented: $isEditingFocus) {
                FocusEditorView(focus: todayFocus)
                    .presentationDetents([.medium])
            }
        }
    }

    private var focusSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("One real move")
                .font(.headline)

            Text(todayFocus?.title ?? "Name the one thing that would make today feel less scattered.")
                .foregroundStyle(todayFocus == nil ? BeeveDesign.mutedText : .primary)

            Button(todayFocus == nil ? "Set focus" : "Edit focus") {
                isEditingFocus = true
            }
            .buttonStyle(.borderedProminent)
        }
        .beevePanel()
    }

    private func entrySection(title: String, kind: DayEntryKind) -> some View {
        let sectionEntries = todayEntries.filter { $0.kind == kind }

        return VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)

            if sectionEntries.isEmpty {
                Text("Nothing logged yet.")
                    .foregroundStyle(BeeveDesign.mutedText)
            } else {
                ForEach(sectionEntries) { entry in
                    Text(entry.text)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.vertical, 6)
                    Divider()
                }
            }
        }
        .beevePanel()
    }
}
```

- [ ] **Step 2: Build quick logging**

`QuickLogSheet` uses a segmented picker for `Done`, `Interrupted`, and `Tomorrow`, a single text editor, and one primary save action. Saving inserts a `DayEntry` with today's start-of-day date and dismisses the sheet:

```swift
import SwiftData
import SwiftUI

struct QuickLogSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var kind: DayEntryKind = .done
    @State private var text = ""

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Picker("Kind", selection: $kind) {
                    ForEach(DayEntryKind.allCases) { kind in
                        Text(kind.title).tag(kind)
                    }
                }
                .pickerStyle(.segmented)

                Text(kind.prompt)
                    .font(.headline)

                TextEditor(text: $text)
                    .frame(minHeight: 140)
                    .padding(8)
                    .overlay {
                        RoundedRectangle(cornerRadius: BeeveDesign.radius, style: .continuous)
                            .stroke(BeeveDesign.border, lineWidth: 1)
                    }

                Spacer()
            }
            .padding(16)
            .navigationTitle("Log one thing")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        modelContext.insert(DayEntry(kind: kind, text: trimmed))
                        try? modelContext.save()
                        dismiss()
                    }
                }
            }
        }
    }
}
```

- [ ] **Step 3: Build focus editing**

`FocusEditorView` allows the user to set or replace today's single focus. Saving inserts a `DailyFocus` if none exists or updates the existing one:

```swift
import SwiftData
import SwiftUI

struct FocusEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    let focus: DailyFocus?
    @State private var title: String

    init(focus: DailyFocus?) {
        self.focus = focus
        self._title = State(initialValue: focus?.title ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("One real move") {
                    TextField("What would make today feel less scattered?", text: $title)
                }
            }
            .navigationTitle("Today's focus")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let trimmed = title.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        if let focus {
                            focus.title = trimmed
                            focus.updatedAt = .now
                        } else {
                            modelContext.insert(DailyFocus(title: trimmed))
                        }
                        try? modelContext.save()
                        dismiss()
                    }
                }
            }
        }
    }
}
```

- [ ] **Step 4: Verify build**

Run:

```bash
xcodebuild -project apps/beeve-app/beeve-app.xcodeproj -scheme beeve-app -destination 'generic/platform=iOS' build
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 5: Commit**

```bash
git add apps/beeve-app
git commit -m "feat: build beeve today loop"
```

## Task 8: Build Achievement Cards and History

**Files:**
- Create/Modify: `apps/beeve-app/beeve-app/Views/Cards/CardsView.swift`
- Create: `apps/beeve-app/beeve-app/Views/Cards/AchievementCardView.swift`
- Modify: `apps/beeve-app/beeve-app/Views/Today/TodayView.swift`

- [ ] **Step 1: Add card generation action**

Add a "Generate today's card" action to `TodayView`. It creates a `DayContext`, calls `FutureSelfGenerator.makeAchievementCard(from:)`, inserts the returned `AchievementCard`, saves, and shows a confirmation state:

```swift
private func generateCard() {
    let card = FutureSelfGenerator().makeAchievementCard(from: context)
    modelContext.insert(card)
    try? modelContext.save()
}
```

- [ ] **Step 2: Build reusable card presentation**

`AchievementCardView` shows title, summary bullets, interruption reframe, tomorrow priorities, and closing line in a flat bordered panel with restrained spacing:

```swift
import SwiftUI

struct AchievementCardView: View {
    let card: AchievementCard

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(card.title)
                .font(.title3.weight(.semibold))

            ForEach(card.summaryBullets, id: \.self) { bullet in
                Label(bullet, systemImage: "checkmark.circle")
                    .labelStyle(.titleAndIcon)
            }

            Text(card.interruptionReframe)
                .foregroundStyle(BeeveDesign.mutedText)

            if !card.tomorrowPriorities.isEmpty {
                Divider()
                Text("Tomorrow")
                    .font(.headline)
                ForEach(card.tomorrowPriorities, id: \.self) { priority in
                    Text(priority)
                }
            }

            Divider()
            Text(card.closingLine)
                .font(.callout.weight(.medium))
        }
        .beevePanel()
    }
}
```

- [ ] **Step 3: Build card history**

`CardsView` fetches cards sorted newest first:

```swift
import SwiftData
import SwiftUI

struct CardsView: View {
    @Query(sort: \AchievementCard.createdAt, order: .reverse) private var cards: [AchievementCard]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if cards.isEmpty {
                        Text("No cards yet. Collect one day first.")
                            .foregroundStyle(BeeveDesign.mutedText)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .beevePanel()
                    } else {
                        ForEach(cards) { card in
                            AchievementCardView(card: card)
                        }
                    }
                }
                .padding(16)
            }
            .navigationTitle("Cards")
            .background(BeeveDesign.background)
        }
    }
}
```

- [ ] **Step 4: Verify build**

Run:

```bash
xcodebuild -project apps/beeve-app/beeve-app.xcodeproj -scheme beeve-app -destination 'generic/platform=iOS' build
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 5: Commit**

```bash
git add apps/beeve-app
git commit -m "feat: add achievement cards"
```

## Task 9: Build Settings and Notification Wiring

**Files:**
- Modify: `apps/beeve-app/beeve-app/Views/Settings/SettingsView.swift`
- Modify: `apps/beeve-app/beeve-app/Views/Onboarding/OnboardingView.swift`
- Modify: `apps/beeve-app/beeve-app/ContentView.swift`

- [ ] **Step 1: Build Settings**

Settings edits preferred name, work start and end hours, tone, and notification toggle. It includes a quiet destructive reset action that deletes preferences, focuses, entries, and cards after confirmation:

```swift
import SwiftData
import SwiftUI

struct SettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var preferences: [UserPreferences]

    var body: some View {
        NavigationStack {
            Form {
                if let active = preferences.first {
                    Section("Future-you") {
                        TextField("Preferred name", text: Bindable(active).preferredName)
                        Picker("Tone", selection: Binding(
                            get: { active.tone },
                            set: { active.tone = $0 }
                        )) {
                            ForEach(FutureSelfTone.allCases) { tone in
                                Text(tone.label).tag(tone)
                            }
                        }
                    }

                    Section("Workday") {
                        Stepper("Start hour: \(active.workStartHour)", value: Bindable(active).workStartHour, in: 0...23)
                        Stepper("End hour: \(active.workEndHour)", value: Bindable(active).workEndHour, in: 0...23)
                        Toggle("Daily reminders", isOn: Bindable(active).notificationsEnabled)
                    }

                    Section {
                        Button("Save reminder schedule") {
                            active.updatedAt = .now
                            try? modelContext.save()
                            Task {
                                await NotificationScheduler().scheduleDailyReminders(preferences: active)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}
```

- [ ] **Step 2: Wire notification scheduling**

After onboarding completion and after settings changes, request notification authorization if needed and call:

```swift
await NotificationScheduler().scheduleDailyReminders(preferences: preferences)
```

- [ ] **Step 3: Verify build**

Run:

```bash
xcodebuild -project apps/beeve-app/beeve-app.xcodeproj -scheme beeve-app -destination 'generic/platform=iOS' build
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 4: Commit**

```bash
git add apps/beeve-app
git commit -m "feat: wire beeve reminders and settings"
```

## Task 10: Final Verification and Polish

**Files:**
- Modify as needed under: `apps/beeve-app/beeve-app`

- [ ] **Step 1: Run final build**

Run:

```bash
xcodebuild -project apps/beeve-app/beeve-app.xcodeproj -scheme beeve-app -destination 'generic/platform=iOS' build
```

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 2: Run repository status check**

Run:

```bash
git status --short
```

Expected: no uncommitted files after the final task commit.

- [ ] **Step 3: Perform visual and product pass**

Check the built app manually in simulator if available:

- Onboarding can be completed quickly.
- Today always has one obvious primary action.
- Quick logging takes one sentence and one save action.
- Generated cards are readable without decorative effects.
- Settings can reschedule notifications.

- [ ] **Step 4: Commit final polish if any files changed**

```bash
git add apps/beeve-app
git commit -m "polish: refine beeve ios mvp"
```

## Plan Self-Review

- Spec coverage: the plan covers onboarding, Today, quick logging, local generation, cards, settings, notifications, local-first persistence, and restrained native UI.
- Marker scan: no unfinished markers or empty implementation notes remain.
- Type consistency: model names, enum names, and service names are consistent across tasks.
