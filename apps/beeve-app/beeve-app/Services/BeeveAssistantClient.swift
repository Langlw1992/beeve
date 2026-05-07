import Foundation

struct AssistantReply: Codable, Equatable, Sendable {
    var headline: String
    var message: String
    var focus: String
    var done: String
    var interrupted: String
    var tomorrow: String
    var quickPrompts: [String]

    init(
        headline: String,
        message: String,
        focus: String,
        done: String,
        interrupted: String,
        tomorrow: String,
        quickPrompts: [String]
    ) {
        self.headline = headline
        self.message = message
        self.focus = focus
        self.done = done
        self.interrupted = interrupted
        self.tomorrow = tomorrow
        self.quickPrompts = quickPrompts
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        headline = (try? container.decode(String.self, forKey: .headline)) ?? ""
        message = (try? container.decode(String.self, forKey: .message)) ?? ""
        focus = (try? container.decode(String.self, forKey: .focus)) ?? ""
        done = (try? container.decode(String.self, forKey: .done)) ?? ""
        interrupted = (try? container.decode(String.self, forKey: .interrupted)) ?? ""
        tomorrow = (try? container.decode(String.self, forKey: .tomorrow)) ?? ""
        quickPrompts = (try? container.decode([String].self, forKey: .quickPrompts)) ?? []
    }

    func normalized(fallback: AssistantReply) -> AssistantReply {
        AssistantReply(
            headline: headline.trimmedOr(fallback.headline),
            message: message.trimmedOr(fallback.message),
            focus: focus.trimmedOr(fallback.focus),
            done: done.trimmedOr(fallback.done),
            interrupted: interrupted.trimmedOr(fallback.interrupted),
            tomorrow: tomorrow.trimmedOr(fallback.tomorrow),
            quickPrompts: quickPrompts.isEmpty ? fallback.quickPrompts : Array(quickPrompts.prefix(4))
        )
    }
}

enum BeeveAPISettings {
    private static let apiBaseURLStorageKey = "beeve.api.baseURL"

    static var apiBaseURL: String {
        get {
            let stored = UserDefaults.standard.string(forKey: apiBaseURLStorageKey) ?? ""
            return stored.isEmpty ? "http://localhost:3000/api" : stored
        }
        set {
            UserDefaults.standard.set(newValue.trimmingCharacters(in: .whitespacesAndNewlines), forKey: apiBaseURLStorageKey)
        }
    }

    static var isConfigured: Bool {
        URL(string: apiBaseURL.trimmingCharacters(in: .whitespacesAndNewlines)) != nil
    }
}

enum AssistantSuggestionEngine {
    static func makeReply(
        intent: AssistantIntent,
        userText: String,
        snapshot: AssistantContextSnapshot
    ) -> AssistantReply {
        let trimmedInput = userText.trimmingCharacters(in: .whitespacesAndNewlines)
        let existingFocus = snapshot.focusTitle?.trimmingCharacters(in: .whitespacesAndNewlines)
        let focus = concise(
            trimmedInput,
            fallback: existingFocus?.isEmpty == false ? existingFocus! : "完成一个可验证的小推进"
        )

        switch intent {
        case .planToday:
            return AssistantReply(
                headline: "先定一条主线",
                message: "只保留一个焦点，其余放进明天或打断。",
                focus: focus,
                done: "围绕「\(focus)」完成一个可看见的结果",
                interrupted: "临时事项出现时，先记下来源和下一步",
                tomorrow: "明早先检查「\(focus)」的下一步",
                quickPrompts: ["我只有 30 分钟", "帮我拆成三步", "只保留最重要的一件", "我现在没状态"]
            )
        case .importText:
            return AssistantReply(
                headline: "收束成行动",
                message: trimmedInput.isEmpty ? "导入会议或笔记，我来提取下一步。" : "先压成一个焦点，杂项放到明天。",
                focus: focus,
                done: "整理导入内容，确认今天能推进的一项",
                interrupted: "导入内容里不属于今天的部分先不处理",
                tomorrow: "回看导入内容中剩余的待办和上下文",
                quickPrompts: ["提取待办", "变成今日计划", "只要下一步", "生成明天提醒"]
            )
        case .voiceCapture:
            return AssistantReply(
                headline: "说一段就够了",
                message: "不用组织语言，我会压成可执行句子。",
                focus: focus,
                done: "用自然语言整理出今天的下一步",
                interrupted: "描述里提到的干扰先单独记录",
                tomorrow: "把没法今天做完的部分留给明天",
                quickPrompts: ["我先随便说", "提炼一句焦点", "帮我记录打断", "转成明天提醒"]
            )
        case .recover:
            return AssistantReply(
                headline: "先回到下一步",
                message: "先记录原因，再回到一个很小的动作。",
                focus: existingFocus?.isEmpty == false ? existingFocus! : focus,
                done: "从打断后恢复，完成一个小动作",
                interrupted: concise(trimmedInput, fallback: "被临时事项打断，已重新找回下一步"),
                tomorrow: "明天减少同类打断，先预留处理窗口",
                quickPrompts: ["我被会议打断", "我被构建问题卡住", "帮我找回焦点", "只给我下一步"]
            )
        case .handoff:
            return AssistantReply(
                headline: "交给明天",
                message: "把明天要接住的上下文写清楚。",
                focus: existingFocus?.isEmpty == false ? existingFocus! : focus,
                done: "完成今天能收尾的最小部分",
                interrupted: "剩余内容不再强行推进",
                tomorrow: concise(trimmedInput, fallback: "明早先接住今天留下的关键线索"),
                quickPrompts: ["保留背景", "压成三条", "生成明早第一步", "标出风险"]
            )
        }
    }

    private static func concise(_ text: String, fallback: String) -> String {
        let lines = text
            .split(whereSeparator: \.isNewline)
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
        let candidate = lines.first ?? text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !candidate.isEmpty else { return fallback }
        return String(candidate.prefix(42))
    }
}

struct BeeveAssistantClient {
    var apiBaseURL: URL

    init?(apiBaseURLString: String = BeeveAPISettings.apiBaseURL) {
        let trimmed = apiBaseURLString.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let url = URL(string: trimmed) else {
            return nil
        }
        apiBaseURL = url
    }

    func assistantReply(
        intent: AssistantIntent,
        userText: String,
        snapshot: AssistantContextSnapshot
    ) async throws -> AssistantReply {
        let fallback = AssistantSuggestionEngine.makeReply(intent: intent, userText: userText, snapshot: snapshot)
        let endpoint = apiBaseURL.appendingPathComponent("assistant")

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(AssistantRequest(
            intent: intent.rawValue,
            userText: userText,
            context: AssistantRequest.Context(snapshot: snapshot)
        ))

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw BeeveAssistantClientError.invalidResponse
        }
        guard (200..<300).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw BeeveAssistantClientError.requestFailed(statusCode: httpResponse.statusCode, body: body)
        }

        return try JSONDecoder().decode(AssistantReply.self, from: data).normalized(fallback: fallback)
    }
}

private struct AssistantRequest: Encodable {
    let intent: String
    let userText: String
    let context: Context

    struct Context: Encodable {
        let dateText: String
        let preferredName: String
        let tone: String
        let focusTitle: String?
        let doneItems: [String]
        let interruptedItems: [String]
        let tomorrowItems: [String]

        init(snapshot: AssistantContextSnapshot) {
            dateText = snapshot.dateText
            preferredName = snapshot.preferredName
            tone = snapshot.tone
            focusTitle = snapshot.focusTitle
            doneItems = snapshot.doneItems
            interruptedItems = snapshot.interruptedItems
            tomorrowItems = snapshot.tomorrowItems
        }
    }
}

enum BeeveAssistantClientError: LocalizedError {
    case invalidResponse
    case requestFailed(statusCode: Int, body: String)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            "Beeve API 返回内容无法解析"
        case let .requestFailed(statusCode, _):
            "Beeve API 请求失败（\(statusCode)）"
        }
    }
}

private extension String {
    func trimmedOr(_ fallback: String) -> String {
        let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? fallback : trimmed
    }
}
