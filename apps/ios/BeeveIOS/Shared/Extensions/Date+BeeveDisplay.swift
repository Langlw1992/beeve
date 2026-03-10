import Foundation
import SwiftUI
import UIKit

extension Date {
  var beeveDisplayText: String {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "zh_Hans_CN")
    formatter.dateStyle = .medium
    formatter.timeStyle = .short
    return formatter.string(from: self)
  }
}

extension Color {
  static let beevePageTop = Color(uiColor: .systemGroupedBackground)
  static let beevePageBottom = Color(uiColor: .secondarySystemGroupedBackground)
  static let beeveSurfaceBackground = Color(uiColor: .secondarySystemGroupedBackground)
  static let beeveElevatedBackground = Color(uiColor: .secondarySystemBackground)
  static let beeveInputBackground = Color(uiColor: .secondarySystemBackground)
  static let beeveSolidBackground = Color(uiColor: .systemBackground)
  static let beeveChipBackground = Color(uiColor: .tertiarySystemFill)
  static let beeveSeparator = Color(uiColor: .separator).opacity(0.24)
  static let beeveNavigationBarBackground = Color(uiColor: .systemBackground).opacity(0.92)
}

struct BeevePageBackground: View {
  var body: some View {
    LinearGradient(
      colors: [Color.beevePageTop, Color.beevePageBottom],
      startPoint: .top,
      endPoint: .bottom,
    )
    .ignoresSafeArea()
  }
}

extension View {
  func beeveCardSurface(cornerRadius: CGFloat = 24) -> some View {
    background(
      Color.beeveSurfaceBackground,
      in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous),
    )
    .overlay {
      RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        .stroke(Color.beeveSeparator, lineWidth: 1)
    }
  }

  func beeveElevatedSurface(cornerRadius: CGFloat = 22) -> some View {
    background(
      Color.beeveElevatedBackground,
      in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous),
    )
    .overlay {
      RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        .stroke(Color.beeveSeparator, lineWidth: 1)
    }
  }

  func beeveInputSurface(cornerRadius: CGFloat = 16) -> some View {
    background(
      Color.beeveInputBackground,
      in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous),
    )
    .overlay {
      RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        .stroke(Color.beeveSeparator, lineWidth: 1)
    }
  }

  func beeveSolidSurface(cornerRadius: CGFloat = 18) -> some View {
    background(
      Color.beeveSolidBackground,
      in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous),
    )
    .overlay {
      RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        .stroke(Color.beeveSeparator, lineWidth: 1)
    }
  }
}
