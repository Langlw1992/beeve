/**
 * 管理弹窗组件共享类型定义
 */

/** 用户数据类型（对应 better-auth admin API 返回的用户结构） */
export type AdminUser = {
  id: string
  name: string
  email: string
  role: string | null
  banned: boolean | null
  banReason: string | null
  banExpires: number | null
  image: string | null
  createdAt: Date
}

/** 通用弹窗 Props（带用户数据） */
export type UserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser
  onSuccess: () => void
}

/** 通用弹窗 Props（不带用户数据，用于创建用户） */
export type DialogBaseProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/** 批量操作弹窗 Props */
export type BatchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userIds: string[]
  onSuccess: () => void
}
