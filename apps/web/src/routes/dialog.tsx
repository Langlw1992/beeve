/**
 * Dialog Component Showcase Page
 */

import { createSignal } from 'solid-js'
import { createFileRoute } from '@tanstack/solid-router'
import { Dialog, Button, Input } from '@beeve/ui'
import { ShowcaseSection } from '../components/ShowcaseGrid'

function DialogPage() {
  const [basicOpen, setBasicOpen] = createSignal(false)
  const [widthOpen, setWidthOpen] = createSignal<false | 'sm' | 'md' | 'lg' | 'xl'>(false)
  const [confirmOpen, setConfirmOpen] = createSignal(false)
  const [asyncOpen, setAsyncOpen] = createSignal(false)
  const [customOpen, setCustomOpen] = createSignal(false)

  const simulateAsync = () =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, 2000)
    })

  return (
    <div class="space-y-12">
      <div>
        <h1 class="text-3xl font-bold">Dialog</h1>
        <p class="text-muted-foreground mt-2">
          对话框组件，支持确认、取消、自定义内容和异步操作。
        </p>
      </div>

      {/* Basic */}
      <ShowcaseSection title="Basic" description="基本对话框">
        <div class="flex gap-4">
          <Button onClick={() => setBasicOpen(true)}>Open Basic Dialog</Button>
          <Dialog
            open={basicOpen()}
            onOpenChange={setBasicOpen}
            title="Basic Dialog"
            description="This is a basic dialog with default footer."
          >
            <p>Dialog content goes here.</p>
          </Dialog>
        </div>
      </ShowcaseSection>

      {/* Width Variants */}
      <ShowcaseSection title="Width Variants" description="不同宽度">
        <div class="flex flex-wrap gap-4">
          <Button variant="outline" onClick={() => setWidthOpen('sm')}>
            Small
          </Button>
          <Button variant="outline" onClick={() => setWidthOpen('md')}>
            Medium
          </Button>
          <Button variant="outline" onClick={() => setWidthOpen('lg')}>
            Large
          </Button>
          <Button variant="outline" onClick={() => setWidthOpen('xl')}>
            Extra Large
          </Button>
          <Dialog
            open={widthOpen() !== false}
            onOpenChange={(open) => !open && setWidthOpen(false)}
            width={widthOpen() || 'md'}
            title={`${widthOpen() || 'md'} Width Dialog`}
            description="Different dialog widths for different use cases."
          >
            <p>This dialog uses the "{widthOpen()}" width variant.</p>
          </Dialog>
        </div>
      </ShowcaseSection>

      {/* Confirm Dialog */}
      <ShowcaseSection title="Confirm Dialog" description="确认对话框">
        <div class="flex gap-4">
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete Item
          </Button>
          <Dialog
            open={confirmOpen()}
            onOpenChange={setConfirmOpen}
            title="Confirm Delete"
            description="Are you sure you want to delete this item? This action cannot be undone."
            okText="Delete"
            okType="destructive"
            onOk={() => {
              setConfirmOpen(false)
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </div>
      </ShowcaseSection>

      {/* Async Dialog */}
      <ShowcaseSection title="Async Operations" description="异步操作自动显示 loading">
        <div class="flex gap-4">
          <Button onClick={() => setAsyncOpen(true)}>Open Async Dialog</Button>
          <Dialog
            open={asyncOpen()}
            onOpenChange={setAsyncOpen}
            title="Async Operation"
            description="Click OK to simulate a 2 second async operation."
            onOk={simulateAsync}
          >
            <p>The dialog will close automatically when the operation completes.</p>
          </Dialog>
        </div>
      </ShowcaseSection>

      {/* Custom Footer */}
      <ShowcaseSection title="Custom Content" description="自定义内容">
        <div class="flex gap-4">
          <Button onClick={() => setCustomOpen(true)}>Open Form Dialog</Button>
          <Dialog
            open={customOpen()}
            onOpenChange={setCustomOpen}
            title="Edit Profile"
            footer={null}
          >
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <span class="text-sm font-medium">Name</span>
                <Input placeholder="Your name" />
              </div>
              <div class="flex flex-col gap-2">
                <span class="text-sm font-medium">Email</span>
                <Input type="email" placeholder="your@email.com" />
              </div>
              <div class="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCustomOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setCustomOpen(false)}>Save Changes</Button>
              </div>
            </div>
          </Dialog>
        </div>
      </ShowcaseSection>
    </div>
  )
}

export const Route = createFileRoute('/dialog')({
  component: DialogPage,
})

