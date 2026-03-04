/**
 * 封禁用户弹窗
 * 支持设置封禁原因和封禁时长
 */
import {createSignal, createEffect, type Component} from 'solid-js'
import {Dialog, Input, Select, Label, toast} from '@beeve/ui'
import {authClient} from '../../lib/auth-client'
import type {UserDialogProps} from './types'

/** 封禁时长选项（值为秒数，0 表示永久） */
const banDurationOptions = [
  {label: '1 天', value: 86400},
  {label: '7 天', value: 604800},
  {label: '30 天', value: 2592000},
  {label: '永久', value: 0},
]

export const BanUserDialog: Component<UserDialogProps> = (props) => {
  const [reason, setReason] = createSignal('')
  const [duration, setDuration] = createSignal<string | number | undefined>(
    86400,
  )

  // 当弹窗打开时，重置表单
  createEffect(() => {
    if (props.open) {
      setReason('')
      setDuration(86400)
    }
  })

  const handleOk = async () => {
    const selectedDuration = duration()
    const banParams: Record<string, unknown> = {
      userId: props.user.id,
      banReason: reason().trim() || undefined,
    }

    // 0 表示永久，不传 banExpiresIn
    if (selectedDuration && Number(selectedDuration) > 0) {
      banParams.banExpiresIn = Number(selectedDuration)
    }

    const {error} = await authClient.admin.banUser(
      banParams as {userId: string; banReason?: string; banExpiresIn?: number},
    )

    if (error) {
      toast.error(`封禁失败: ${error.message}`)
      throw error
    }

    toast.success('用户已封禁')
    props.onSuccess()
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="封禁用户"
      description={`确定要封禁用户「${props.user.name || props.user.email}」吗？`}
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
