/**
 * 角色管理弹窗
 * 支持切换用户角色（普通用户/管理员）
 */
import {createSignal, createEffect, type Component} from 'solid-js'
import {Dialog, Select, Label, toast} from '@beeve/ui'
import {authClient} from '../../lib/auth-client'
import type {UserDialogProps} from './types'

const roleOptions = [
  {label: '普通用户', value: 'user'},
  {label: '管理员', value: 'admin'},
]

export const SetRoleDialog: Component<UserDialogProps> = (props) => {
  const [role, setRole] = createSignal<string | number | undefined>('user')

  // 当弹窗打开时，初始化角色
  createEffect(() => {
    if (props.open) {
      setRole(props.user.role || 'user')
    }
  })

  const handleOk = async () => {
    const selectedRole = role()
    if (!selectedRole) {
      toast.error('请选择角色')
      throw new Error('请选择角色')
    }

    const {error} = await authClient.admin.setRole({
      userId: props.user.id,
      role: selectedRole as 'user' | 'admin',
    })

    if (error) {
      toast.error(`设置角色失败: ${error.message}`)
      throw error
    }

    toast.success('用户角色已更新')
    props.onSuccess()
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="角色管理"
      description={`当前用户: ${props.user.name || props.user.email}`}
      onOk={handleOk}
      okText="确认"
      width="md"
    >
      <div class="flex flex-col gap-2">
        <Label>选择角色</Label>
        <Select
          options={roleOptions}
          value={role()}
          onChange={setRole}
          placeholder="请选择角色"
        />
      </div>
    </Dialog>
  )
}
