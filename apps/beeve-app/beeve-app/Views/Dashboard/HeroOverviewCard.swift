import SwiftUI

// MARK: - Hero Overview Card

struct HeroOverviewCard: View {
    let focusScore: Int
    let completedCount: Int
    let pendingCount: Int
    let inboxCount: Int
    let homeSuggestion: String

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            HStack(alignment: .center, spacing: 18) {
                VStack(alignment: .leading, spacing: 8) {
                    SurfaceKicker(
                        title: pendingCount == 0 ? "Ready" : "Today",
                        symbol: "sparkles",
                        tint: pendingCount == 0 ? .green : .indigo
                    )
                    Text("先把今天收拢成几个清晰动作。")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(.primary)
                        .fixedSize(horizontal: false, vertical: true)

                    Text(homeSuggestion)
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .padding(.top, 2)
                }

                Spacer(minLength: 12)

                DailyProgressRing(
                    progress: progress,
                    score: focusScore,
                    completedCount: completedCount,
                    pendingCount: pendingCount
                )
            }

            HStack(spacing: 12) {
                HeroMetric(title: "专注分", value: "\(focusScore)")
                HeroMetric(title: "已完成", value: "\(completedCount)")
                HeroMetric(title: "收件箱", value: "\(inboxCount)")
            }
        }
        .padding(22)
        .appCard(tint: .blue, cornerRadius: 30)
    }

    private var progress: Double {
        let total = completedCount + pendingCount
        guard total > 0 else { return 0 }
        return Double(completedCount) / Double(total)
    }
}

// MARK: - Hero Metric

struct HeroMetric: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.headline)
                .contentTransition(.numericText())
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard(cornerRadius: 18)
        .animation(.snappy, value: value)
    }
}

// MARK: - Daily Progress Ring

struct DailyProgressRing: View {
    let progress: Double
    let score: Int
    let completedCount: Int
    let pendingCount: Int

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.primary.opacity(0.08), lineWidth: 10)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    Color.indigo,
                    style: StrokeStyle(lineWidth: 10, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.snappy(duration: 0.45), value: progress)

            VStack(spacing: 2) {
                Text("\(score)")
                    .font(.title2.bold())
                    .contentTransition(.numericText())
                Text("\(completedCount)/\(completedCount + pendingCount)")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(width: 92, height: 92)
        .scaleEffect(completedCount > 0 ? 1.0 : 0.96)
        .animation(.spring(response: 0.35, dampingFraction: 0.72), value: completedCount)
    }
}
