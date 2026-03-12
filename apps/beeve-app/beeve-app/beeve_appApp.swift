//
//  beeve_appApp.swift
//  beeve-app
//
//  Created by lang on 2026/3/12.
//

import SwiftUI

@main
struct BeeveAppApp: App {
    @State private var store = BeeveStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(store)
        }
    }
}
