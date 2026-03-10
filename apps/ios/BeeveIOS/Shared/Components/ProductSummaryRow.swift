import SwiftUI

struct ProductSummaryRow: View {
  let product: Product

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      HStack(alignment: .firstTextBaseline) {
        Text(product.title)
          .font(.headline)
        Spacer()
        Text(product.priceText)
          .font(.subheadline)
          .foregroundStyle(.secondary)
      }
      Text(product.subtitle)
        .foregroundStyle(.secondary)
      Text(product.summary)
      HStack {
        Label(product.category.rawValue, systemImage: product.category.systemImage)
        Spacer()
        Text("标签：\(product.tags.joined(separator: "、"))")
      }
      .font(.footnote)
      .foregroundStyle(.secondary)
    }
    .padding(.vertical, 4)
  }
}
