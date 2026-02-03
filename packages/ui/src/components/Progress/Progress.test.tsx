/**
 * @beeve/ui - Progress Tests
 */

import {describe, it, expect} from 'vitest'
import {render, screen} from '@solidjs/testing-library'
import {Progress} from './Progress'

describe('Progress', () => {
  describe('线性进度条', () => {
    it('应该渲染线性进度条', () => {
      const {container} = render(() => <Progress percent={50} />)
      const track = container.querySelector('.bg-muted')
      expect(track).toBeInTheDocument()
    })

    it('应该显示正确的百分比', () => {
      render(() => (
        <Progress
          percent={75}
          showInfo
        />
      ))
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('应该限制百分比在 0-100 之间', () => {
      const {container} = render(() => <Progress percent={150} />)
      // 150% 被 clamp 到 100%，而 100% 会触发 success 状态
      const indicator = container.querySelector('.bg-green-500')
      expect(indicator).toHaveStyle({width: '100%'})
    })

    it('应该支持自定义格式化', () => {
      render(() => (
        <Progress
          percent={50}
          format={(p) => `已完成 ${p}%`}
        />
      ))
      expect(screen.getByText('已完成 50%')).toBeInTheDocument()
    })
  })

  describe('环形进度条', () => {
    it('应该渲染环形进度条', () => {
      const {container} = render(() => (
        <Progress
          type="circle"
          percent={50}
        />
      ))
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('应该显示正确的百分比', () => {
      render(() => (
        <Progress
          type="circle"
          percent={75}
        />
      ))
      expect(screen.getByText('75%')).toBeInTheDocument()
    })
  })

  describe('状态', () => {
    it('100% 时应该自动变为 success 状态', () => {
      const {container} = render(() => <Progress percent={100} />)
      const indicator = container.querySelector('.bg-green-500')
      expect(indicator).toBeInTheDocument()
    })

    it('应该支持手动设置 exception 状态', () => {
      const {container} = render(() => (
        <Progress
          percent={50}
          status="exception"
        />
      ))
      const indicator = container.querySelector('.bg-destructive')
      expect(indicator).toBeInTheDocument()
    })

    it('应该支持 active 状态动画', () => {
      const {container} = render(() => (
        <Progress
          percent={50}
          status="active"
        />
      ))
      const indicator = container.querySelector('.animate-progress-stripe')
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('尺寸', () => {
    it('应该支持 sm 尺寸', () => {
      const {container} = render(() => (
        <Progress
          percent={50}
          size="sm"
        />
      ))
      const track = container.querySelector('.h-1')
      expect(track).toBeInTheDocument()
    })

    it('应该支持 lg 尺寸', () => {
      const {container} = render(() => (
        <Progress
          percent={50}
          size="lg"
        />
      ))
      const track = container.querySelector('.h-3')
      expect(track).toBeInTheDocument()
    })
  })

  describe('分段进度条', () => {
    it('应该渲染分段进度条', () => {
      const {container} = render(() => (
        <Progress.Steps
          steps={5}
          current={3}
        />
      ))
      const steps = container.querySelectorAll('.rounded-full')
      expect(steps).toHaveLength(5)
    })

    it('已完成的步骤应该有正确的颜色', () => {
      const {container} = render(() => (
        <Progress.Steps
          steps={5}
          current={2}
        />
      ))
      const completedSteps = container.querySelectorAll('.bg-primary')
      expect(completedSteps.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('showInfo', () => {
    it('默认应该显示进度信息', () => {
      render(() => <Progress percent={50} />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('showInfo 为 false 时不显示进度信息', () => {
      render(() => (
        <Progress
          percent={50}
          showInfo={false}
        />
      ))
      expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })
  })
})
