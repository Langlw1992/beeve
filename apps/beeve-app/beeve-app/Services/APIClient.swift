import Foundation

actor APIClient {
    static let shared = APIClient()

    #if DEBUG
    private let baseURL = "http://localhost:3000/api"
    #else
    private let baseURL = "https://auth.beeve.app/api"
    #endif

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        d.dateDecodingStrategy = .iso8601
        return d
    }()

    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.keyEncodingStrategy = .convertToSnakeCase
        e.dateEncodingStrategy = .iso8601
        return e
    }()

    // MARK: - Auth

    func signInWithApple(idToken: String, name: String?) async throws -> AuthResponse {
        struct Body: Encodable {
            let idToken: String
            let name: String?
            let provider: String = "apple"
        }
        return try await post("/auth/sign-in/social", body: Body(idToken: idToken, name: name))
    }

    func getMe(token: String) async throws -> AuthUser {
        try await get("/auth/get-session", token: token)
    }

    func refreshToken(_ refreshToken: String) async throws -> AuthResponse {
        struct Body: Encodable { let refreshToken: String }
        return try await post("/auth/refresh", body: Body(refreshToken: refreshToken))
    }

    // MARK: - Reminders Sync (future)

    func fetchReminders(token: String) async throws -> [RemoteReminder] {
        try await get("/reminders", token: token)
    }

    func pushReminders(_ reminders: [RemoteReminder], token: String) async throws -> SyncResponse {
        try await post("/reminders/sync", body: reminders, token: token)
    }

    // MARK: - AI Assistant

    func sendAssistantMessage(_ message: String, context: AssistantContext, token: String?) async throws -> AssistantResponse {
        struct Body: Encodable {
            let message: String
            let context: AssistantContext
        }
        return try await post("/ai/chat", body: Body(message: message, context: context), token: token)
    }

    // MARK: - HTTP Helpers

    private func get<T: Decodable>(_ path: String, token: String? = nil) async throws -> T {
        var request = URLRequest(url: URL(string: baseURL + path)!)
        request.httpMethod = "GET"
        if let token { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await URLSession.shared.data(for: request)
        try validateResponse(response)
        return try decoder.decode(T.self, from: data)
    }

    private func post<B: Encodable, T: Decodable>(_ path: String, body: B, token: String? = nil) async throws -> T {
        var request = URLRequest(url: URL(string: baseURL + path)!)
        request.httpMethod = "POST"
        request.httpBody = try encoder.encode(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let token { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }

        let (data, response) = try await URLSession.shared.data(for: request)
        try validateResponse(response)
        return try decoder.decode(T.self, from: data)
    }

    private func validateResponse(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        guard (200...299).contains(http.statusCode) else {
            throw APIError.httpError(http.statusCode)
        }
    }
}

// MARK: - API Types

enum APIError: LocalizedError {
    case invalidResponse
    case httpError(Int)

    var errorDescription: String? {
        switch self {
        case .invalidResponse: "服务器响应异常"
        case .httpError(let code): "请求失败 (\(code))"
        }
    }
}

struct RemoteReminder: Codable {
    let id: String
    let title: String
    let note: String
    let dueDate: Date?
    let category: String
    let priority: String
    let isCompleted: Bool
    let updatedAt: Date
}

struct SyncResponse: Codable {
    let synced: Int
    let conflicts: Int
}

struct AssistantContext: Codable {
    let pendingCount: Int
    let completedCount: Int
    let inboxCount: Int
    let pendingCaptureCount: Int
    let nextImportantTitle: String?
    let memorySummary: [String]
    let preferredFocusDuration: Int?
}

struct AssistantResponse: Codable {
    let reply: String
    let suggestedActions: [AssistantActionSuggestion]?
    let recommendedDestination: SecondaryDestination?
    let memoryCandidates: [String]?
    let captureResult: AssistantCaptureResult?

    init(
        reply: String,
        suggestedActions: [AssistantActionSuggestion]? = nil,
        recommendedDestination: SecondaryDestination? = nil,
        memoryCandidates: [String]? = nil,
        captureResult: AssistantCaptureResult? = nil
    ) {
        self.reply = reply
        self.suggestedActions = suggestedActions
        self.recommendedDestination = recommendedDestination
        self.memoryCandidates = memoryCandidates
        self.captureResult = captureResult
    }
}

struct AssistantCaptureResult: Codable {
    let title: String?
    let category: FlashNoteCategory?
    let suggestedAction: FlashNoteSuggestedAction?
    let confidence: Double?
}
