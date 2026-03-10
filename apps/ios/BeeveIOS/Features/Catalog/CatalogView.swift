import SwiftUI

struct CatalogView: View {
  let products: [Product]
  @Binding var selectedScope: CatalogScope

  @State private var searchText = ""

  private var filteredProducts: [Product] {
    products.filter { product in
      selectedScope.matches(product) && product.matches(searchText: searchText)
    }
  }

  private var groupedProducts: [ProductCategory: [Product]] {
    Dictionary(grouping: filteredProducts, by: \.category)
  }

  private var searchSuggestions: [String] {
    Array(
      Set(
        products.flatMap { product in
          [product.title, product.category.rawValue] + product.tags
        }
      )
    )
    .sorted()
    .prefix(6)
    .map { $0 }
  }

  var body: some View {
    List {
      Section {
        Text("当前支持搜索、精选与分类浏览，先用本地数据验证产品发现路径。")
        Text(selectedScope.description)
      } header: {
        Text("浏览说明")
      }

      Section {
        Picker("浏览范围", selection: $selectedScope) {
          ForEach(CatalogScope.allCases) { scope in
            Text(scope.rawValue).tag(scope)
          }
        }
        .pickerStyle(.segmented)
      } header: {
        Text("筛选范围")
      }

      if filteredProducts.isEmpty && searchText.isEmpty {
        Section {
          EmptyStateView(
            title: "当前范围暂无产品",
            message: "可以切换到其他分类，或查看精选推荐。",
          )
        }
      }

      ForEach(ProductCategory.allCases) { category in
        if let categoryProducts = groupedProducts[category], !categoryProducts.isEmpty {
          Section {
            ForEach(categoryProducts) { product in
              NavigationLink(value: product) {
                ProductSummaryRow(product: product)
              }
            }
          } header: {
            Text(category.rawValue)
          }
        }
      }
    }
    .navigationTitle("产品")
    .searchable(text: $searchText, prompt: "搜索产品、标签、分类")
    .searchSuggestions {
      ForEach(searchSuggestions, id: \.self) { suggestion in
        Text(suggestion).searchCompletion(suggestion)
      }
    }
    .overlay {
      if !searchText.isEmpty && filteredProducts.isEmpty {
        ContentUnavailableView.search(text: searchText)
      }
    }
    .navigationDestination(for: Product.self) { product in
      ProductDetailView(product: product)
    }
  }
}

private struct CatalogPreviewContainer: View {
  @State private var selectedScope: CatalogScope = .all

  var body: some View {
    NavigationStack {
      CatalogView(
        products: Product.samples,
        selectedScope: $selectedScope,
      )
    }
  }
}

#Preview("产品列表") {
  CatalogPreviewContainer()
}
