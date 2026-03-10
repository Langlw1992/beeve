import Foundation

struct ProductCatalogService {
  let products: [Product]

  init(products: [Product] = Product.samples) {
    self.products = products
  }
}
