import SwiftUI

struct HomeView: View {
  let products: [Product]
  let onOpenCatalog: (CatalogScope) -> Void

  private var featuredProducts: [Product] {
    products.filter { $0.isFeatured }
  }

  var body: some View {
    List {
      Section {
        Text("首版聚焦终端消费者场景，先用产品展示、收藏和提醒验证产品价值。")
        Text("当前已经支持首页快捷入口、精选浏览与产品搜索，便于后续切换到真实接口。")
      } header: {
        Text("项目说明")
      }

      Section {
        ForEach(CatalogScope.allCases.filter { $0 != .all }) { scope in
          Button {
            onOpenCatalog(scope)
          } label: {
            HStack {
              Label(scope.rawValue, systemImage: scope.systemImage)
              Spacer()
              Text(scope.description)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.trailing)
            }
          }
          .buttonStyle(.plain)
        }
      } header: {
        Text("快捷入口")
      }

      Section {
        ForEach(featuredProducts) { product in
          NavigationLink(value: product) {
            ProductSummaryRow(product: product)
          }
        }
      } header: {
        Text("精选推荐")
      }

      Section {
        ForEach(ProductCategory.allCases) { category in
          Button {
            onOpenCatalog(category.catalogScope)
          } label: {
            HStack {
              Label(category.rawValue, systemImage: category.systemImage)
              Spacer()
              Text("查看")
                .foregroundStyle(.secondary)
            }
          }
          .buttonStyle(.plain)
        }
      } header: {
        Text("分类入口")
      }
    }
    .navigationTitle("首页")
    .navigationDestination(for: Product.self) { product in
      ProductDetailView(product: product)
    }
  }
}

#Preview("首页") {
  NavigationStack {
    HomeView(
      products: Product.samples,
      onOpenCatalog: { _ in },
    )
  }
}
