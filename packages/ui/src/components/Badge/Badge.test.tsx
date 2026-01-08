/**
 * @beeve/ui - Badge Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { Badge } from './Badge'

describe('Badge', () => {
  describe('基础渲染', () => {
    it('应该渲染数字徽标', () => {
      render(() => <Badge count={5} data-testid="badge" />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('应该渲染附着到子元素的徽标', () => {
      render(() => (
        <Badge count={5}>
          <span data-testid="child">内容</span>
        </Badge>
      ))
      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('数字溢出', () => {
    it('默认溢出值为 99', () => {
      render(() => <Badge count={100} />)
      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('应该支持自定义溢出值', () => {
      render(() => <Badge count={20} overflowCount={10} />)
      expect(screen.getByText('10+')).toBeInTheDocument()
    })

    it('不超过溢出值时显示原数字', () => {
      render(() => <Badge count={50} overflowCount={99} />)
      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })

  describe('零值显示', () => {
    it('默认不显示 0', () => {
      const { container } = render(() => <Badge count={0} />)
      expect(container.querySelector('.bg-destructive')).not.toBeInTheDocument()
    })

    it('showZero 为 true 时显示 0', () => {
      render(() => <Badge count={0} showZero />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('小红点模式', () => {
    it('应该渲染小红点', () => {
      const { container } = render(() => <Badge dot />)
      const dot = container.querySelector('.rounded-full')
      expect(dot).toBeInTheDocument()
    })

    it('小红点模式不显示数字', () => {
      render(() => <Badge dot count={5} />)
      expect(screen.queryByText('5')).not.toBeInTheDocument()
    })
  })

  describe('颜色', () => {
    it('默认应该是红色', () => {
      const { container } = render(() => <Badge count={1} />)
      const badge = container.querySelector('.bg-destructive')
      expect(badge).toBeInTheDocument()
    })

    it('应该支持 blue 颜色', () => {
      const { container } = render(() => <Badge count={1} color="blue" />)
      const badge = container.querySelector('.bg-blue-500')
      expect(badge).toBeInTheDocument()
    })

    it('应该支持 green 颜色', () => {
      const { container } = render(() => <Badge count={1} color="green" />)
      const badge = container.querySelector('.bg-green-500')
      expect(badge).toBeInTheDocument()
    })

    it('应该支持 orange 颜色', () => {
      const { container } = render(() => <Badge count={1} color="orange" />)
      const badge = container.querySelector('.bg-orange-500')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('状态徽标', () => {
    it('应该渲染状态徽标带文字', () => {
      render(() => <Badge status="success" text="已完成" />)
      expect(screen.getByText('已完成')).toBeInTheDocument()
    })

    it('应该支持 processing 状态动画', () => {
      const { container } = render(() => <Badge status="processing" text="进行中" />)
      const dot = container.querySelector('.animate-pulse')
      expect(dot).toBeInTheDocument()
    })
  })

  describe('尺寸', () => {
    it('应该支持 sm 尺寸', () => {
      const { container } = render(() => <Badge count={1} size="sm" />)
      const badge = container.querySelector('.h-4')
      expect(badge).toBeInTheDocument()
    })

    it('默认应该是 md 尺寸', () => {
      const { container } = render(() => <Badge count={1} />)
      const badge = container.querySelector('.min-w-\\[18px\\]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('自定义内容', () => {
    it('应该支持 JSX 作为 count', () => {
      render(() => <Badge count={<span data-testid="custom">自定义</span>} />)
      expect(screen.getByTestId('custom')).toBeInTheDocument()
    })
  })

  describe('无障碍', () => {
    it('应该支持 title 属性', () => {
      render(() => <Badge count={5} title="5 条新消息" />)
      const badge = screen.getByTitle('5 条新消息')
      expect(badge).toBeInTheDocument()
    })
  })
})
