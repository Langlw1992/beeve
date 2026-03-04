/**
 * 编辑用户信息弹窗
 * 支持修改用户姓名，邮箱为只读
 */
import {createSignal, createEffect, type Component} from 'solid-js'
import {Dialog, Input, Label, toast} from '@beeve/ui'
import {authClient} from '../../lib/auth-client'
import type {UserDialogProps} from './types'

export const EditUserDialog: Component<UserDialogProps> = (props) => {
  const [name, setName] = createSignal('')

  // 当弹窗打开时，初始化表单数据
  createEffect(() => {
    if (props.open) {
      setName(props.user.name || '')
    }
  })

  const handleOk = async () => {
    const trimmedName = name().trim()
    if (!trimmedName) {
      toast.error('姓名不能为空')
      throw new Error('姓名不能为空')
    }

    const {error} = await authClient.admin.updateUser({
      userId: props.user.id,
      data: {name: trimmedName},
    })

    if (error) {
      toast.error(`更新失败: ${error.message}`)
      throw error
    }

    toast.success('用户信息已更新')
    props.onSuccess()
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="编辑用户信息"
      onOk={handleOk}
      okText="保存"
      width="md"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <Label required>姓名</Label>
          <Input
            value={name()}
            onInput={(v: string) => setName(v)}
            placeholder="请输入姓名"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label>邮箱</Label>
          <Input
            value={props.user.email}
            disabled
          />
        </div>
      </div>
    </Dialog>
  )
}
