/**
 * 授权同意页 - 占位
 */
import {createFileRoute} from '@tanstack/solid-router'

function ConsentPage() {
  return (
    <div class="flex items-center justify-center min-h-screen">
      <h1 class="text-2xl font-bold">授权同意</h1>
    </div>
  )
}

export const Route = createFileRoute('/consent')({
  component: ConsentPage,
})
