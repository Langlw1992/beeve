import SwiftUI

struct ProductSummaryRow: View {
  let product: Product

  var body: some View {
    VStack(alignment: .leading, spacing: 14) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 6) {
          Text(product.title)
            .font(.headline)
            .foregroundStyle(.primary)
            .lineLimit(2)

          Text(product.subtitle)
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .lineLimit(2)
        }

        Spacer(minLength: 12)

        Text(product.priceText)
          .font(.subheadline.weight(.semibold))
          .foregroundStyle(.indigo)
      }

      Text(product.summary)
        .font(.footnote)
        .foregroundStyle(.secondary)
        .lineLimit(3)
        .fixedSize(horizontal: false, vertical: true)

      HStack(spacing: 8) {
        ProductSummaryBadge(
          text: product.category.rawValue,
          systemImage: product.category.systemImage,
          tint: .indigo,
        )

        if let firstTag = product.tags.first {
          ProductSummaryBadge(
            text: firstTag,
            systemImage: "sparkles",
            tint: .orange,
          )
        }

        Spacer()

        Image(systemName: "arrow.right.circle.fill")
          .foregroundStyle(.indigo)
      }
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .leading)
    .beeveElevatedSurface(cornerRadius: 22)
  }
}

private struct ProductSummaryBadge: View {
  let text: String
  let systemImage: String
  let tint: Color

  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: systemImage)
      Text(text)
    }
    .font(.caption.weight(.medium))
    .foregroundStyle(tint)
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .background(tint.opacity(0.1), in: Capsule())
  }
}
