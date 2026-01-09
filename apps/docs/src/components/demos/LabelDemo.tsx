import { Label, Input, Checkbox, Switch } from '@beeve/ui'
import { DemoBox } from '../DemoBox'

export function LabelBasic() {
  return (
    <DemoBox title="基础标签" class="flex-col items-stretch gap-4">
      <div class="space-y-2">
        <Label for="email">邮箱地址</Label>
        <Input id="email" type="email" placeholder="请输入邮箱" />
      </div>
    </DemoBox>
  )
}

export function LabelRequired() {
  return (
    <DemoBox title="必填标记" class="flex-col items-stretch gap-4">
      <div class="space-y-2">
        <Label for="username" required>用户名</Label>
        <Input id="username" placeholder="请输入用户名" />
      </div>
      <div class="space-y-2">
        <Label for="password" required>密码</Label>
        <Input id="password" type="password" placeholder="请输入密码" />
      </div>
    </DemoBox>
  )
}

export function LabelDisabled() {
  return (
    <DemoBox title="禁用状态" class="flex-col items-stretch gap-4">
      <div class="space-y-2">
        <Label for="disabled-input" disabled>禁用输入框</Label>
        <Input id="disabled-input" placeholder="不可编辑" disabled />
      </div>
    </DemoBox>
  )
}

export function LabelWithControls() {
  return (
    <DemoBox title="与表单控件配合" class="flex-col items-stretch gap-4">
      <div class="space-y-2">
        <Label for="name" required>姓名</Label>
        <Input id="name" placeholder="请输入姓名" />
      </div>
      <div class="space-y-2">
        <Label for="bio">个人简介</Label>
        <Input id="bio" placeholder="可选" />
      </div>
      <div class="flex items-center gap-2">
        <Checkbox id="agree" />
        <Label for="agree">我已阅读并同意服务条款</Label>
      </div>
      <div class="flex items-center justify-between">
        <Label for="notifications">接收通知</Label>
        <Switch id="notifications" />
      </div>
    </DemoBox>
  )
}
