/**
 * @beeve/ui - Skeleton Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@solidjs/testing-library'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  describe('基础渲染', () => {
    it('应该渲染基础骨架屏', () => {
      render(() => <Skeleton width={200} height={16} data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveStyle({ width: '200px', height: '16px' })
    })

    it('应该支持圆形骨架屏', () => {
      render(() => <Skeleton width={40} height={40} circle data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('rounded-full')
    })

    it('应该支持字符串宽高', () => {
      render(() => <Skeleton width="100%" height="2rem" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveStyle({ width: '100%', height: '2rem' })
    })
  })

  describe('动画', () => {
    it('默认应该有 pulse 动画', () => {
      render(() => <Skeleton width={100} height={16} data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('应该支持 wave 动画', () => {
      render(() => <Skeleton width={100} height={16} animation="wave" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('animate-shimmer')
    })

    it('应该支持禁用动画', () => {
      render(() => <Skeleton width={100} height={16} animation="none" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).not.toHaveClass('animate-pulse')
      expect(skeleton).not.toHaveClass('animate-shimmer')
    })
  })

  describe('Skeleton.Text', () => {
    it('应该渲染多行文本骨架', () => {
      const { container } = render(() => <Skeleton.Text rows={3} />)
      const skeletons = container.querySelectorAll('.bg-muted')
      expect(skeletons).toHaveLength(3)
    })

    it('默认应该渲染 3 行', () => {
      const { container } = render(() => <Skeleton.Text />)
      const skeletons = container.querySelectorAll('.bg-muted')
      expect(skeletons).toHaveLength(3)
    })
  })

  describe('Skeleton.Avatar', () => {
    it('应该渲染头像骨架', () => {
      render(() => <Skeleton.Avatar data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass('rounded-full')
    })

    it('应该支持方形头像', () => {
      render(() => <Skeleton.Avatar shape="square" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).not.toHaveClass('rounded-full')
    })

    it('应该支持不同尺寸', () => {
      render(() => <Skeleton.Avatar size="lg" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveStyle({ width: '56px', height: '56px' })
    })

    it('应该支持自定义数字尺寸', () => {
      render(() => <Skeleton.Avatar size={100} data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveStyle({ width: '100px', height: '100px' })
    })
  })

  describe('Skeleton.Button', () => {
    it('应该渲染按钮骨架', () => {
      render(() => <Skeleton.Button data-testid="button" />)
      const button = screen.getByTestId('button')
      expect(button).toBeInTheDocument()
    })

    it('应该支持不同尺寸', () => {
      render(() => <Skeleton.Button size="lg" data-testid="button" />)
      const button = screen.getByTestId('button')
      expect(button).toHaveStyle({ width: '96px', height: '36px' })
    })
  })

  describe('Skeleton.Image', () => {
    it('应该渲染图片骨架', () => {
      render(() => <Skeleton.Image data-testid="image" />)
      const image = screen.getByTestId('image')
      expect(image).toBeInTheDocument()
      expect(image).toHaveClass('aspect-video')
    })

    it('应该支持不同宽高比', () => {
      render(() => <Skeleton.Image aspectRatio="1:1" data-testid="image" />)
      const image = screen.getByTestId('image')
      expect(image).toHaveClass('aspect-square')
    })
  })

  describe('Skeleton.Paragraph', () => {
    it('应该渲染段落骨架（标题+正文）', () => {
      const { container } = render(() => <Skeleton.Paragraph title rows={2} />)
      const skeletons = container.querySelectorAll('.bg-muted')
      // 1 个标题 + 2 行文本 = 3 个骨架
      expect(skeletons).toHaveLength(3)
    })

    it('没有标题时只渲染正文', () => {
      const { container } = render(() => <Skeleton.Paragraph title={false} rows={2} />)
      const skeletons = container.querySelectorAll('.bg-muted')
      expect(skeletons).toHaveLength(2)
    })
  })
})
