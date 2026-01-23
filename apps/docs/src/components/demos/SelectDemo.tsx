import { Select, Label } from '@beeve/ui'
import { createSignal } from 'solid-js'
import { DemoBox } from '../DemoBox'

export function SelectBasic() {
  const [value, setValue] = createSignal('')

  return (
    <DemoBox title="基础选择器" class="flex-col items-stretch">
      <Select
        value={value()}
        onChange={(v) => setValue(v as string)}
        placeholder="请选择"
        options={[
          { value: 'apple', label: '苹果' },
          { value: 'banana', label: '香蕉' },
          { value: 'orange', label: '橙子' },
          { value: 'grape', label: '葡萄' },
        ]}
      />
      <p class="mt-2 text-sm text-muted-foreground">
        当前选择: {value() || '未选择'}
      </p>
    </DemoBox>
  )
}

export function SelectSizes() {
  return (
    <DemoBox title="选择器尺寸" class="flex-col items-stretch gap-3">
      <Select
        size="sm"
        placeholder="小尺寸"
        options={[
          { value: '1', label: '选项一' },
          { value: '2', label: '选项二' },
        ]}
      />
      <Select
        size="md"
        placeholder="中尺寸"
        options={[
          { value: '1', label: '选项一' },
          { value: '2', label: '选项二' },
        ]}
      />
      <Select
        size="lg"
        placeholder="大尺寸"
        options={[
          { value: '1', label: '选项一' },
          { value: '2', label: '选项二' },
        ]}
      />
    </DemoBox>
  )
}

export function SelectWithGroups() {
  return (
    <DemoBox title="分组选择器" class="flex-col items-stretch">
      <Select
        placeholder="选择水果"
        options={[
          {
            label: '热带水果',
            options: [
              { value: 'mango', label: '芒果' },
              { value: 'pineapple', label: '菠萝' },
              { value: 'coconut', label: '椰子' },
            ],
          },
          {
            label: '温带水果',
            options: [
              { value: 'apple', label: '苹果' },
              { value: 'pear', label: '梨' },
              { value: 'peach', label: '桃子' },
            ],
          },
        ]}
      />
    </DemoBox>
  )
}

export function SelectDisabled() {
  return (
    <DemoBox title="禁用状态" class="flex-col items-stretch gap-3">
      <Select
        placeholder="禁用选择器"
        disabled
        options={[
          { value: '1', label: '选项一' },
        ]}
      />
      <Select
        placeholder="禁用部分选项"
        options={[
          { value: '1', label: '可选项' },
          { value: '2', label: '禁用项', disabled: true },
          { value: '3', label: '可选项' },
        ]}
      />
    </DemoBox>
  )
}

export function SelectWithLabel() {
  return (
    <DemoBox title="带标签选择器" class="flex-col items-stretch gap-4">
      <div class="space-y-2">
        <Label for="country" required>国家/地区</Label>
        <Select
          id="country"
          placeholder="请选择国家"
          options={[
            { value: 'cn', label: '中国' },
            { value: 'us', label: '美国' },
            { value: 'jp', label: '日本' },
            { value: 'kr', label: '韩国' },
          ]}
        />
      </div>
    </DemoBox>
  )
}
