import SwiftUI

struct EmptyStateView: View {
  let title: String
  let message: String

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(title)
      Text(message)
    }
    .padding(.vertical, 12)
  }
}
