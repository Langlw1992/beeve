import SwiftUI

enum BeeveDesign {
    static let background = Color(.systemBackground)
    static let secondaryBackground = Color(.secondarySystemBackground)
    static let border = Color(.separator).opacity(0.35)
    static let accent = Color.blue
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
