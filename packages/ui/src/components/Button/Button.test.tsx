/**
 * Button 组件测试
 * 遵循 TDD 原则，先编写测试用例
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@solidjs/testing-library'
import { Button } from './Button'

describe('Button', () => {
  // ==================== 渲染测试 ====================
  describe('渲染', () => {
    it('应该正确渲染子内容', () => {
      render(() => <Button>点击我</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('点击我')
    })

    it('应该渲染为 button 元素', () => {
      render(() => <Button>测试</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('默认 type 应该是 button', () => {
      render(() => <Button>测试</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })
  })

  // ==================== 变体测试 ====================
  describe('变体 (variant)', () => {
    it('默认变体应该是 primary', () => {
      render(() => <Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-primary')
    })

    it('应该支持 secondary 变体', () => {
      render(() => <Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-secondary')
    })

    it('应该支持 outline 变体', () => {
      render(() => <Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('border')
    })

    it('应该支持 ghost 变体', () => {
      render(() => <Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('hover:bg-accent')
    })

    it('应该支持 destructive 变体', () => {
      render(() => <Button variant="destructive">Destructive</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-destructive')
    })

    it('应该支持 link 变体', () => {
      render(() => <Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('underline-offset')
    })
  })

  // ==================== 尺寸测试 ====================
  describe('尺寸 (size)', () => {
    it('默认尺寸应该是 md', () => {
      render(() => <Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-10')
    })

    it('应该支持 sm 尺寸', () => {
      render(() => <Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-8')
    })

    it('应该支持 lg 尺寸', () => {
      render(() => <Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-12')
    })

    it('应该支持 icon 尺寸', () => {
      render(() => <Button size="icon">🔔</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('size-10')
    })
  })

  // ==================== 交互测试 ====================
  describe('交互', () => {
    it('点击时应该触发 onClick 回调', async () => {
      const handleClick = vi.fn()
      render(() => <Button onClick={handleClick}>点击</Button>)
      
      await fireEvent.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('禁用状态下不应该触发 onClick', async () => {
      const handleClick = vi.fn()
      render(() => <Button disabled onClick={handleClick}>禁用</Button>)
      
      await fireEvent.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('禁用状态下应该有 disabled 属性', () => {
      render(() => <Button disabled>禁用</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  // ==================== 类型测试 ====================
  describe('HTML type 属性', () => {
    it('应该支持 type="submit"', () => {
      render(() => <Button type="submit">提交</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('应该支持 type="reset"', () => {
      render(() => <Button type="reset">重置</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')
    })
  })

  // ==================== 样式定制测试 ====================
  describe('样式定制', () => {
    it('应该支持自定义 class', () => {
      render(() => <Button class="custom-class">自定义</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    it('自定义 class 应该与默认样式合并', () => {
      render(() => <Button class="my-btn">合并</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('my-btn')
      expect(button.className).toContain('inline-flex') // 默认样式保留
    })
  })
})

