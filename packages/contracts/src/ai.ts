/**
 * AI 助手相关契约
 */

export const AI_CONTEXT_TYPE = [
  'global',
  'today',
  'task',
  'reminders',
  'note_input',
] as const
export type AIContextType = (typeof AI_CONTEXT_TYPE)[number]

export const AI_ACTION_TYPE = [
  'ask',
  'summarize',
  'rewrite',
  'extract_tasks',
  'extract_reminders',
] as const
export type AIActionType = (typeof AI_ACTION_TYPE)[number]

export const AI_MESSAGE_ROLE = ['user', 'assistant', 'system'] as const
export type AIMessageRole = (typeof AI_MESSAGE_ROLE)[number]

export type AIConversation = {
  id: string
  userId: string
  title: string | null
  contextType: AIContextType
  contextRefId: string | null
  createdAt: Date
  updatedAt: Date
}

export type AIMessage = {
  id: string
  conversationId: string
  role: AIMessageRole
  content: string
  actionType: AIActionType
  createdAt: Date
}

export type AIUsageContext = {
  taskCount: number
  reminderCount: number
}

export type AskAIRequest = {
  question: string
}

export type AskAIResponse = {
  answer: string
  context: AIUsageContext
}

export type SummarizeAIRequest = {
  text?: string
  scope?: 'today' | 'tasks' | 'reminders'
}

export type SummarizeAIResponse = {
  summary: string
  context: AIUsageContext
}

export type RewriteAIRequest = {
  text: string
  tone?: 'clear' | 'concise' | 'actionable'
}

export type RewriteAIResponse = {
  rewrittenText: string
}

export type ExtractedTaskCandidate = {
  title: string
  note?: string
  priority?: 'high' | 'medium' | 'low'
  dueAt?: string | null
}

export type ExtractedReminderCandidate = {
  title: string
  note?: string
  scheduledAt?: string | null
  repeatRule?: 'none' | 'daily' | 'weekly'
}

export type ExtractAIRequest = {
  text: string
}

export type ExtractAIResponse = {
  summary: string
  tasks: ExtractedTaskCandidate[]
  reminders: ExtractedReminderCandidate[]
}
