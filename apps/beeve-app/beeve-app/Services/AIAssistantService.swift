import Foundation

@MainActor
@Observable
final class AIAssistantService {
    var isProcessing = false

    // Try remote AI first, fall back to local
    func getReply(
        for text: String,
        context: AssistantContext,
        localFallback: (String) -> String
    ) async -> String {
        // If user has auth token, try remote AI
        if let token = loadToken() {
            isProcessing = true
            defer { isProcessing = false }

            do {
                let response = try await APIClient.shared.sendAssistantMessage(
                    text,
                    context: context,
                    token: token
                )
                return response.reply
            } catch {
                // Fall back to local
                return localFallback(text)
            }
        }

        // No auth — use local logic
        return localFallback(text)
    }

    private func loadToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: "com.beeve.auth",
            kSecAttrAccount as String: "access_token",
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }
}
