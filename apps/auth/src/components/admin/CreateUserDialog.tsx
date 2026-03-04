/**
 * 创建用户弹窗
 * 支持创建新用户（姓名、邮箱、密码、角色）
 */
import {createSignal, createEffect, type Component} from 'solid-js'
import {Dialog, Input, Select, Label, toast} from '@beeve/ui'
import {authClient} from '../../lib/auth-client'
import type {DialogBaseProps} from './types'

const roleOptions = [
  {label: '普通用户', value: 'user'},
  {label: '管理员', value: 'admin'},
]

export const CreateUserDialog: Component<DialogBaseProps> = (props) => {
  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [role, setRole] = createSignal<string | number | undefined>('user')

  // 当弹窗打开时，重置表单
  createEffect(() => {
    if (props.open) {
      setName('')
      setEmail('')
      setPassword('')
      setRole('user')
    }
  })

  const handleOk = async () => {
    const trimmedName = name().trim()
    const trimmedEmail = email().trim()
    const pwd = password()

    if (!trimmedName) {
      toast.error('姓名不能为空')
      throw new Error('姓名不能为空')
    }
    if (!trimmedEmail) {
      toast.error('邮箱不能为空')
      throw new Error('邮箱不能为空')
    }
    if (!pwd) {
      toast.error('密码不能为空')
      throw new Error('密码不能为空')
    }
    if (pwd.length < 8) {
      toast.error('密码至少 8 个字符')
      throw new Error('密码至少 8 个字符')
    }

    const {error} = await authClient.admin.createUser({
      name: trimmedName,
      email: trimmedEmail,
      password: pwd,
      role: (role() as 'user' | 'admin') || 'user',
    })

    if (error) {
      toast.error(`创建用户失败: ${error.message}`)
      throw error
    }

    toast.success('用户创建成功')
    props.onSuccess()
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="创建用户"
      onOk={handleOk}
      okText="创建"
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
          <Label required>邮箱</Label>
          <Input
            value={email()}
            onInput={(v: string) => setEmail(v)}
            type="email"
            placeholder="请输入邮箱"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label required>密码</Label>
          <Input
            value={password()}
            onInput={(v: string) => setPassword(v)}
            type="password"
            placeholder="至少 8 个字符"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label>角色</Label>
          <Select
            options={roleOptions}
            value={role()}
            onChange={setRole}
            placeholder="请选择角色"
          />
        </div>
      </div>
    </Dialog>
  )
}
