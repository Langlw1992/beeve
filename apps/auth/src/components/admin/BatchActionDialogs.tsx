/**
 * 批量操作弹窗
 * 支持批量封禁、批量删除
 */
import {createSignal, createEffect, type Component} from 'solid-js'
import {Dialog, Input, Select, Label, toast} from '@beeve/ui'
import {authClient} from '../../lib/auth-client'
import type {BatchDialogProps} from './types'

/** 封禁时长选项（值为秒数，0 表示永久） */
const banDurationOptions = [
  {label: '1 天', value: 86400},
  {label: '7 天', value: 604800},
  {label: '30 天', value: 2592000},
  {label: '永久', value: 0},
]

/** 批量封禁弹窗 */
export const BatchBanDialog: Component<BatchDialogProps> = (props) => {
  const [reason, setReason] = createSignal('')
  const [duration, setDuration] = createSignal<string | number | undefined>(
    86400,
  )

  createEffect(() => {
    if (props.open) {
      setReason('')
      setDuration(86400)
    }
  })

  const handleOk = async () => {
    const ids = props.userIds
    let successCount = 0
    let failCount = 0

    const banParams: {banReason?: string; banExpiresIn?: number} = {}
    const trimmedReason = reason().trim()
    if (trimmedReason) {
      banParams.banReason = trimmedReason
    }
    const selectedDuration = Number(duration())
    if (selectedDuration > 0) {
      banParams.banExpiresIn = selectedDuration
    }

    for (const userId of ids) {
      const {error} = await authClient.admin.banUser({
        userId,
        ...banParams,
      })
      if (error) {
        failCount++
      } else {
        successCount++
      }
    }

    if (failCount === 0) {
      toast.success(`成功封禁 ${successCount} 个用户`)
    } else {
      toast.warning(`封禁完成: 成功 ${successCount} 个，失败 ${failCount} 个`)
    }
    props.onSuccess()
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="批量封禁"
      description={`确定要封禁选中的 ${props.userIds.length} 个用户吗？`}
      onOk={handleOk}
      okText="确认封禁"
      okType="destructive"
      width="md"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <Label>封禁原因</Label>
          <Input
            value={reason()}
            onInput={(v: string) => setReason(v)}
            placeholder="请输入封禁原因（可选）"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label>封禁时长</Label>
          <Select
            options={banDurationOptions}
            value={duration()}
            onChange={setDuration}
            placeholder="请选择封禁时长"
          />
        </div>
      </div>
    </Dialog>
  )
}

/** 批量删除弹窗 */
export const BatchDeleteDialog: Component<BatchDialogProps> = (props) => {
  const handleOk = async () => {
    const ids = props.userIds
    let successCount = 0
    let failCount = 0

    for (const userId of ids) {
      const {error} = await authClient.admin.removeUser({userId})
      if (error) {
        failCount++
      } else {
        successCount++
      }
    }

    if (failCount === 0) {
      toast.success(`成功删除 ${successCount} 个用户`)
    } else {
      toast.warning(`删除完成: 成功 ${successCount} 个，失败 ${failCount} 个`)
    }
    props.onSuccess()
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="批量删除"
      description={`确定要永久删除选中的 ${props.userIds.length} 个用户吗？此操作不可撤销。`}
      role="alertdialog"
      okType="destructive"
      okText="确认删除"
      onOk={handleOk}
      maskClosable={false}
      width="md"
    />
  )
}
