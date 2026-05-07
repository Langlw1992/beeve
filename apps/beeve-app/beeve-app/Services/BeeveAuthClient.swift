import Combine
import Foundation

struct BeeveAuthUser: Decodable, Equatable {
    let id: String
    let name: String?
    let email: String
}

private struct BeeveAuthSessionResponse: Decodable {
    let user: BeeveAuthUser?
}

private struct BeeveAuthErrorResponse: Decodable {
    let message: String?
    let error: String?
}

@MainActor
final class BeeveAuthSession: ObservableObject {
    @Published private(set) var user: BeeveAuthUser?
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?

    private let client = BeeveAuthClient()

    var isSignedIn: Bool {
        user != nil
    }

    func refresh() async {
        isLoading = true
        defer { isLoading = false }

        do {
            user = try await client.currentUser()
            errorMessage = nil
        } catch {
            user = nil
        }
    }

    func signIn(email: String, password: String) async -> Bool {
        await authenticate {
            try await client.signIn(email: email, password: password)
        }
    }

    func signUp(name: String, email: String, password: String) async -> Bool {
        await authenticate {
            try await client.signUp(name: name, email: email, password: password)
        }
    }

    func signOut() async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await client.signOut()
            user = nil
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func authenticate(_ action: () async throws -> Void) async -> Bool {
        isLoading = true
        defer { isLoading = false }

        do {
            try await action()
            user = try await client.currentUser()
            errorMessage = nil
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
}

struct BeeveAuthClient {
    private var apiBaseURL: URL {
        BeeveAssistantClient.apiBaseURL()
    }

    func currentUser() async throws -> BeeveAuthUser? {
        let url = apiBaseURL
            .appendingPathComponent("auth")
            .appendingPathComponent("get-session")
            .appending(queryItems: [URLQueryItem(name: "disableCookieCache", value: "true")])
        let (data, response) = try await URLSession.shared.data(for: URLRequest(url: url))
        guard let httpResponse = response as? HTTPURLResponse else {
            throw BeeveAuthClientError.invalidResponse
        }
        guard httpResponse.statusCode != 401 else {
            return nil
        }
        guard (200..<300).contains(httpResponse.statusCode) else {
            throw BeeveAuthClientError.requestFailed(message: errorMessage(from: data))
        }

        if data.isEmpty || String(data: data, encoding: .utf8) == "null" {
            return nil
        }

        return try JSONDecoder().decode(BeeveAuthSessionResponse.self, from: data).user
    }

    func signIn(email: String, password: String) async throws {
        try await postAuth("sign-in/email", body: [
            "email": email.trimmingCharacters(in: .whitespacesAndNewlines),
            "password": password,
            "rememberMe": true,
        ])
    }

    func signUp(name: String, email: String, password: String) async throws {
        try await postAuth("sign-up/email", body: [
            "name": name.trimmingCharacters(in: .whitespacesAndNewlines),
            "email": email.trimmingCharacters(in: .whitespacesAndNewlines),
            "password": password,
        ])
    }

    func signOut() async throws {
        try await postAuth("sign-out", body: [:])
    }

    private func postAuth(_ path: String, body: [String: Any]) async throws {
        let url = path
            .split(separator: "/")
            .reduce(apiBaseURL.appendingPathComponent("auth")) { partialURL, component in
                partialURL.appendingPathComponent(String(component))
            }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiBaseURL.origin, forHTTPHeaderField: "Origin")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw BeeveAuthClientError.invalidResponse
        }
        guard (200..<300).contains(httpResponse.statusCode) else {
            throw BeeveAuthClientError.requestFailed(message: errorMessage(from: data))
        }
    }

    private func errorMessage(from data: Data) -> String {
        guard !data.isEmpty else {
            return "登录请求失败。"
        }

        if let payload = try? JSONDecoder().decode(BeeveAuthErrorResponse.self, from: data) {
            return userFacingMessage(from: payload.message ?? payload.error)
        }

        return userFacingMessage(from: String(data: data, encoding: .utf8))
    }

    private func userFacingMessage(from message: String?) -> String {
        let fallback = "暂时无法完成登录，请稍后再试。"
        guard let message, !message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return fallback
        }

        let normalized = message.lowercased()
        if normalized.contains("invalid") || normalized.contains("wrong") || normalized.contains("incorrect") {
            return "邮箱或密码不正确。"
        }
        if normalized.contains("already") || normalized.contains("exists") {
            return "这个邮箱已经注册，可以直接登录。"
        }
        if normalized.contains("password") {
            return "密码不符合要求，请至少输入 8 位。"
        }

        return fallback
    }
}

private extension URL {
    var origin: String {
        guard let scheme, let host else {
            return absoluteString
        }

        if let port {
            return "\(scheme)://\(host):\(port)"
        }

        return "\(scheme)://\(host)"
    }
}

enum BeeveAuthClientError: LocalizedError {
    case invalidResponse
    case requestFailed(message: String)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            "暂时无法完成登录，请稍后再试。"
        case let .requestFailed(message):
            message
        }
    }
}
