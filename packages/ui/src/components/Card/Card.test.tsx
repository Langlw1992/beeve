/**
 * @beeve/ui - Card Tests
 */

import {describe, it, expect, vi} from 'vitest'
import {render, screen, fireEvent} from '@solidjs/testing-library'
import {Card} from './Card'

describe('Card', () => {
  describe('基础渲染', () => {
    it('应该渲染卡片内容', () => {
      render(() => <Card>卡片内容</Card>)
      expect(screen.getByText('卡片内容')).toBeInTheDocument()
    })

    it('应该渲染标题', () => {
      render(() => <Card title="卡片标题">内容</Card>)
      expect(screen.getByText('卡片标题')).toBeInTheDocument()
    })

    it('应该渲染描述', () => {
      render(() => (
        <Card
          title="标题"
          description="卡片描述"
        >
          内容
        </Card>
      ))
      expect(screen.getByText('卡片描述')).toBeInTheDocument()
    })

    it('应该渲染额外内容', () => {
      render(() => (
        <Card
          title="标题"
          extra={<button type="button">操作</button>}
        >
          内容
        </Card>
      ))
      expect(screen.getByText('操作')).toBeInTheDocument()
    })
  })

  describe('变体', () => {
    it('应该支持 elevated 变体', () => {
      const {container} = render(() => <Card variant="elevated">内容</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('shadow-md')
    })

    it('应该支持 outlined 变体', () => {
      const {container} = render(() => <Card variant="outlined">内容</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('border')
    })

    it('应该支持 filled 变体', () => {
      const {container} = render(() => <Card variant="filled">内容</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('bg-muted')
    })
  })

  describe('封面图片', () => {
    it('应该渲染封面图片', () => {
      render(() => (
        <Card
          cover="/test.jpg"
          coverAlt="测试图片"
        >
          内容
        </Card>
      ))
      const img = screen.getByAltText('测试图片')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/test.jpg')
    })

    it('应该支持底部封面位置', () => {
      const {container} = render(() => (
        <Card
          cover="/test.jpg"
          coverPosition="bottom"
        >
          内容
        </Card>
      ))
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
    })
  })

  describe('底部', () => {
    it('应该渲染底部内容', () => {
      render(() => <Card footer={<span>底部内容</span>}>内容</Card>)
      expect(screen.getByText('底部内容')).toBeInTheDocument()
    })

    it('应该渲染操作按钮', () => {
      render(() => (
        <Card actions={<button type="button">确定</button>}>内容</Card>
      ))
      expect(screen.getByText('确定')).toBeInTheDocument()
    })
  })

  describe('加载状态', () => {
    it('应该显示加载骨架', () => {
      const {container} = render(() => <Card loading>内容</Card>)
      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('加载状态下不应该显示内容', () => {
      render(() => <Card loading>卡片内容</Card>)
      expect(screen.queryByText('卡片内容')).not.toBeInTheDocument()
    })

    it('应该支持自定义加载配置', () => {
      const {container} = render(() => (
        <Card
          loading
          loadingConfig={{avatar: true, rows: 2}}
        >
          内容
        </Card>
      ))
      const skeletons = container.querySelectorAll('.bg-muted')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('hoverable', () => {
    it('应该支持 hover 效果', () => {
      const {container} = render(() => <Card hoverable>内容</Card>)
      const card = container.firstChild
      expect(card).toHaveClass('cursor-pointer')
      expect(card).toHaveClass('hover:shadow-lg')
    })
  })

  describe('交互', () => {
    it('应该支持点击事件', () => {
      const handleClick = vi.fn()
      render(() => <Card onClick={handleClick}>内容</Card>)
      fireEvent.click(screen.getByText('内容'))
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('尺寸', () => {
    it('应该支持 sm 尺寸', () => {
      const {container} = render(() => (
        <Card
          size="sm"
          title="标题"
        >
          内容
        </Card>
      ))
      const title = container.querySelector('.text-base')
      expect(title).toBeInTheDocument()
    })

    it('应该支持 lg 尺寸', () => {
      const {container} = render(() => (
        <Card
          size="lg"
          title="标题"
        >
          内容
        </Card>
      ))
      const title = container.querySelector('.text-xl')
      expect(title).toBeInTheDocument()
    })
  })
})
