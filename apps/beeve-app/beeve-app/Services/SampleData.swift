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
