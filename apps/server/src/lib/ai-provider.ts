import {env} from '@/config/env'
import {Errors} from '@/lib/errors'

type ChatRole = 'developer' | 'user'

type ChatMessage = {
  role: ChatRole
  content: string
}

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
}

function getAIConfig() {
  if (!env.AI_BASE_URL || !env.AI_API_KEY || !env.AI_MODEL) {
    throw Errors.serviceUnavailable(
      'AI 服务尚未配置，请先设置 AI_BASE_URL、AI_API_KEY 和 AI_MODEL',
      'AI_NOT_CONFIGURED',
    )
  }

  return {
    baseURL: env.AI_BASE_URL.replace(/\/$/, ''),
    apiKey: env.AI_API_KEY,
    model: env.AI_MODEL,
  }
}

async function requestChatCompletion(
  messages: ChatMessage[],
  responseFormat?: {type: 'json_object'},
) {
  const config = getAIConfig()
  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      ...(responseFormat ? {response_format: responseFormat} : {}),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error(
      '[AIProvider] Completion request failed:',
      response.status,
      body,
    )
    throw Errors.serviceUnavailable('AI 服务调用失败', 'AI_REQUEST_FAILED')
  }

  const payload = (await response.json()) as ChatCompletionResponse
  const content = payload.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw Errors.internal('AI 返回内容为空', 'AI_EMPTY_RESPONSE')
  }

  return content
}

export async function generateText(params: {
  systemPrompt: string
  userPrompt: string
}) {
  return requestChatCompletion([
    {
      role: 'developer',
      content: params.systemPrompt,
    },
    {
      role: 'user',
      content: params.userPrompt,
    },
  ])
}

export async function generateJSON<T>(params: {
  systemPrompt: string
  userPrompt: string
}) {
  const content = await requestChatCompletion(
    [
      {
        role: 'developer',
        content: `${params.systemPrompt}\n\n请严格返回 JSON 对象，不要返回 Markdown。`,
      },
      {
        role: 'user',
        content: params.userPrompt,
      },
    ],
    {type: 'json_object'},
  )

  try {
    return JSON.parse(content) as T
  } catch (error) {
    console.error('[AIProvider] JSON parse failed:', content, error)
    throw Errors.internal('AI 返回 JSON 解析失败', 'AI_INVALID_JSON')
  }
}
