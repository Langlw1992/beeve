import type {
  AssistantContextInput,
  AssistantIntent,
  AssistantReplyDto,
  AssistantRequestInput,
} from '@/lib/services/contracts'
import {requireSession, ServiceError} from './context'

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekChatResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const defaultModel = 'deepseek-v4-flash'
const defaultBaseUrl = 'https://api.deepseek.com'

export async function createAssistantReply(
  headers: Headers,
  input: AssistantRequestInput,
): Promise<AssistantReplyDto> {
  await assertAssistantAccess(headers)

  const fallback = makeLocalReply(input.intent, input.userText, input.context)
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim()

  if (!apiKey) {
    throw new ServiceError(
      500,
      'ASSISTANT_NOT_CONFIGURED',
      'DeepSeek API Key 未配置。',
    )
  }

  const baseUrl = normalizeBaseUrl(process.env.DEEPSEEK_BASE_URL)
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL?.trim() || defaultModel,
      messages: [
        {role: 'system', content: systemPrompt},
        {
          role: 'user',
          content: userPrompt(input.intent, input.userText, input.context),
        },
      ] satisfies DeepSeekMessage[],
      temperature: 0.45,
      max_tokens: 700,
      stream: false,
      response_format: {type: 'json_object'},
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new ServiceError(
      response.status,
      'ASSISTANT_PROVIDER_ERROR',
      trimProviderError(body) || `DeepSeek 请求失败（${response.status}）。`,
    )
  }

  const payload = (await response.json()) as DeepSeekChatResponse
  const content = payload.choices?.[0]?.message?.content

  if (!content) {
    throw new ServiceError(
      502,
      'ASSISTANT_INVALID_PROVIDER_RESPONSE',
      'DeepSeek 返回内容为空。',
    )
  }

  return normalizeReply(decodeReply(content), fallback)
}

async function assertAssistantAccess(headers: Headers) {
  const allowAnonymous =
    process.env.BEEVE_ASSISTANT_ALLOW_ANONYMOUS === 'true'
  const requireAuth =
    process.env.BEEVE_ASSISTANT_REQUIRE_AUTH === 'true' ||
    (process.env.NODE_ENV === 'production' && !allowAnonymous)

  if (requireAuth) {
    await requireSession(headers)
  }
}

function normalizeBaseUrl(value: string | undefined) {
  const trimmed = value?.trim()

  if (!trimmed) {
    return defaultBaseUrl
  }

  return trimmed.replace(/\/+$/, '')
}

function decodeReply(content: string): AssistantReplyDto {
  const trimmed = content
    .replaceAll('```json', '')
    .replaceAll('```', '')
    .trim()

  try {
    return JSON.parse(trimmed) as AssistantReplyDto
  } catch {
    const firstBrace = trimmed.indexOf('{')
    const lastBrace = trimmed.lastIndexOf('}')

    if (firstBrace < 0 || lastBrace < firstBrace) {
      throw new ServiceError(
        502,
        'ASSISTANT_INVALID_PROVIDER_RESPONSE',
        'DeepSeek 返回内容无法解析。',
      )
    }

    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as AssistantReplyDto
  }
}

function normalizeReply(
  reply: Partial<AssistantReplyDto>,
  fallback: AssistantReplyDto,
): AssistantReplyDto {
  return {
    headline: trimmedOr(reply.headline, fallback.headline),
    message: trimmedOr(reply.message, fallback.message),
    focus: trimmedOr(reply.focus, fallback.focus),
    done: trimmedOr(reply.done, fallback.done),
    interrupted: trimmedOr(reply.interrupted, fallback.interrupted),
    tomorrow: trimmedOr(reply.tomorrow, fallback.tomorrow),
    quickPrompts:
      Array.isArray(reply.quickPrompts) && reply.quickPrompts.length > 0
        ? reply.quickPrompts
            .map((prompt) => `${prompt}`.trim())
            .filter(Boolean)
            .slice(0, 4)
        : fallback.quickPrompts,
  }
}

function trimmedOr(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function trimProviderError(body: string) {
  return body.trim().slice(0, 240)
}

function makeLocalReply(
  intent: AssistantIntent,
  userText: string,
  context: AssistantContextInput,
): AssistantReplyDto {
  const trimmedInput = userText.trim()
  const existingFocus = context.focusTitle?.trim()
  const focus = concise(
    trimmedInput,
    existingFocus || '完成一个可验证的小推进',
  )

  switch (intent) {
    case 'planToday':
      return {
        headline: '先定一条主线',
        message: '只保留一个焦点，其余放进明天或打断。',
        focus,
        done: `围绕「${focus}」完成一个可看见的结果`,
        interrupted: '临时事项出现时，先记下来源和下一步',
        tomorrow: `明早先检查「${focus}」的下一步`,
        quickPrompts: [
          '我只有 30 分钟',
          '帮我拆成三步',
          '只保留最重要的一件',
          '我现在没状态',
        ],
      }
    case 'importText':
      return {
        headline: '收束成行动',
        message: trimmedInput ? '先压成一个焦点，杂项放到明天。' : '导入会议或笔记，我来提取下一步。',
        focus,
        done: '整理导入内容，确认今天能推进的一项',
        interrupted: '导入内容里不属于今天的部分先不处理',
        tomorrow: '回看导入内容中剩余的待办和上下文',
        quickPrompts: ['提取待办', '变成今日计划', '只要下一步', '生成明天提醒'],
      }
    case 'voiceCapture':
      return {
        headline: '说一段就够了',
        message: '不用组织语言，我会压成可执行句子。',
        focus,
        done: '用自然语言整理出今天的下一步',
        interrupted: '描述里提到的干扰先单独记录',
        tomorrow: '把没法今天做完的部分留给明天',
        quickPrompts: ['我先随便说', '提炼一句焦点', '帮我记录打断', '转成明天提醒'],
      }
    case 'recover':
      return {
        headline: '先回到下一步',
        message: '先记录原因，再回到一个很小的动作。',
        focus: existingFocus || focus,
        done: '从打断后恢复，完成一个小动作',
        interrupted: concise(trimmedInput, '被临时事项打断，已重新找回下一步'),
        tomorrow: '明天减少同类打断，先预留处理窗口',
        quickPrompts: ['我被会议打断', '我被构建问题卡住', '帮我找回焦点', '只给我下一步'],
      }
    case 'handoff':
      return {
        headline: '交给明天',
        message: '把明天要接住的上下文写清楚。',
        focus: existingFocus || focus,
        done: '完成今天能收尾的最小部分',
        interrupted: '剩余内容不再强行推进',
        tomorrow: concise(trimmedInput, '明早先接住今天留下的关键线索'),
        quickPrompts: ['保留背景', '压成三条', '生成明早第一步', '标出风险'],
      }
  }
}

function concise(text: string, fallback: string) {
  const firstLine =
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? text.trim()

  return firstLine ? Array.from(firstLine).slice(0, 42).join('') : fallback
}

const systemPrompt = `
你是 Beeve 的中文 AI 助手。目标是减少用户输入，把零散内容整理为今天可执行的一步。语气直白、短、像 iOS 原生效率工具。不要长篇解释。
只输出 JSON，不要 Markdown。字段必须是：
headline, message, focus, done, interrupted, tomorrow, quickPrompts。
每个字段用中文。headline 不超过 12 个汉字，message 不超过 48 个汉字，focus/done/interrupted/tomorrow 各不超过 32 个汉字，quickPrompts 给 4 个短提示。
`.trim()

function userPrompt(
  intent: AssistantIntent,
  userText: string,
  context: AssistantContextInput,
) {
  return `
用户意图：${intent}
用户补充：${userText.trim() || '无'}

今日上下文：
日期：${context.dateText || '未提供'}
称呼：${context.preferredName || '用户'}
语气：${context.tone || '温和'}
今日焦点：${context.focusTitle || '未设定'}
已推进：${context.doneItems.length ? context.doneItems.join('；') : '暂无'}
打断：${context.interruptedItems.length ? context.interruptedItems.join('；') : '暂无'}
明天：${context.tomorrowItems.length ? context.tomorrowItems.join('；') : '暂无'}
`.trim()
}
