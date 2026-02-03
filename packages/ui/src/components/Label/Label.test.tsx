/**
 * Label 组件测试
 */

import {describe, it, expect} from 'vitest'
import {render, screen} from '@solidjs/testing-library'
import {Label} from './Label'

describe('Label', () => {
  // ==================== 渲染测试 ====================
  describe('渲染', () => {
    it('应该正确渲染子内容', () => {
      render(() => <Label>用户名</Label>)
      expect(screen.getByText('用户名')).toBeInTheDocument()
    })

    it('应该渲染为 label 元素', () => {
      render(() => <Label>标签</Label>)
      expect(document.querySelector('label')).toBeInTheDocument()
    })
  })

  // ==================== for 属性测试 ====================
  describe('for 属性', () => {
    it('应该正确设置 for 属性', () => {
      render(() => <Label for="email">邮箱</Label>)
      const label = document.querySelector('label')
      expect(label).toHaveAttribute('for', 'email')
    })

    it.skip('点击 label 应该聚焦关联的 input (jsdom 限制)', () => {
      // jsdom 中 label 的 click 行为不完全模拟
      render(() => (
        <div>
          <Label for="test-input">测试</Label>
          <input
            id="test-input"
            type="text"
          />
        </div>
      ))

      const label = document.querySelector('label')
      label?.click()

      expect(document.activeElement).toBe(screen.getByRole('textbox'))
    })
  })

  // ==================== required 属性测试 ====================
  describe('required 属性', () => {
    it('required 时应该显示 * 标记', () => {
      render(() => <Label required>必填字段</Label>)
      const label = document.querySelector('label')
      // 使用 CSS ::after 伪元素显示 *，检查类名
      expect(label?.className).toContain("after:content-['*']")
    })

    it('非 required 时不应该有 * 标记样式', () => {
      render(() => <Label>可选字段</Label>)
      const label = document.querySelector('label')
      expect(label?.className).not.toContain("after:content-['*']")
    })
  })

  // ==================== disabled 属性测试 ====================
  describe('disabled 属性', () => {
    it('disabled 时应该有禁用样式', () => {
      render(() => <Label disabled>禁用的标签</Label>)
      const label = document.querySelector('label')
      expect(label?.className).toContain('opacity-70')
      expect(label?.className).toContain('cursor-not-allowed')
    })

    it('非 disabled 时不应该有直接禁用样式', () => {
      render(() => <Label>正常标签</Label>)
      const label = document.querySelector('label')
      // 非禁用时不应该有直接的 cursor-not-allowed 样式
      // 注意：peer-disabled:cursor-not-allowed 是条件样式，不是直接禁用样式
      expect(label?.className).toMatch(
        /^(?!.*(?:^|\s)cursor-not-allowed(?:\s|$))/,
      )
    })
  })

  // ==================== 样式定制测试 ====================
  describe('样式定制', () => {
    it('应该支持自定义 class', () => {
      render(() => <Label class="custom-label">自定义</Label>)
      const label = document.querySelector('label')
      expect(label).toHaveClass('custom-label')
    })

    it('自定义 class 应该与默认样式合并', () => {
      render(() => <Label class="my-label">合并</Label>)
      const label = document.querySelector('label')
      expect(label).toHaveClass('my-label')
      expect(label?.className).toContain('text-sm') // 默认样式保留
    })
  })

  // ==================== 组合测试 ====================
  describe('组合属性', () => {
    it('同时设置 required 和 disabled', () => {
      render(() => (
        <Label
          required
          disabled
        >
          组合状态
        </Label>
      ))
      const label = document.querySelector('label')
      expect(label?.className).toContain("after:content-['*']")
      expect(label?.className).toContain('opacity-70')
    })
  })
})
