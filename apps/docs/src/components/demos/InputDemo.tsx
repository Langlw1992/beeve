import { Input, Label } from '@beeve/ui'
import { Search, Mail, Eye, EyeOff } from 'lucide-solid'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

export function InputBasic() {
  return (
    <DemoBox title="基础输入框" class="flex-col items-stretch">
      <Input placeholder="请输入内容" />
    </DemoBox>
  )
}

export function InputSizes() {
  return (
    <DemoBox title="输入框尺寸" class="flex-col items-stretch gap-3">
      <Input size="sm" placeholder="小尺寸" />
      <Input size="md" placeholder="中尺寸" />
      <Input size="lg" placeholder="大尺寸" />
    </DemoBox>
  )
}

export function InputWithIcon() {
  return (
    <DemoBox title="带图标输入框" class="flex-col items-stretch gap-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input class="pl-10" placeholder="搜索..." />
      </div>
      <div class="relative">
        <Mail class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input class="pl-10" type="email" placeholder="邮箱地址" />
      </div>
    </DemoBox>
  )
}

export function InputPassword() {
  const [show, setShow] = createSignal(false)

  return (
    <DemoBox title="密码输入框" class="flex-col items-stretch">
      <div class="relative">
        <Input
          type={show() ? 'text' : 'password'}
          placeholder="请输入密码"
          class="pr-10"
        />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShow(!show())}
        >
          {show() ? <EyeOff class="size-4" /> : <Eye class="size-4" />}
        </button>
      </div>
    </DemoBox>
  )
}

export function InputStates() {
  return (
    <DemoBox title="输入框状态" class="flex-col items-stretch gap-3">
      <Input placeholder="正常状态" />
      <Input placeholder="禁用状态" disabled />
      <Input placeholder="只读状态" readonly value="只读内容" />
      <Input placeholder="错误状态" class="border-error focus:ring-error" />
    </DemoBox>
  )
}

export function InputWithLabel() {
  return (
    <DemoBox title="带标签输入框" class="flex-col items-stretch gap-4">
      <div class="space-y-2">
        <Label for="username" required>用户名</Label>
        <Input id="username" placeholder="请输入用户名" />
      </div>
      <div class="space-y-2">
        <Label for="email">邮箱</Label>
        <Input id="email" type="email" placeholder="请输入邮箱" />
      </div>
    </DemoBox>
  )
}
