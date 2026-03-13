import { json } from '@tanstack/solid-start'
import { createAPIFileRoute } from '@tanstack/solid-start/api'

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL ?? 'http://localhost:8000'

export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: async ({ request, params }) => {
    const url = new URL(request.url)
    const path = params._ ?? ''
    const targetUrl = `${AUTH_SERVER_URL}/api/auth/${path}${url.search}`

    console.log(`[Proxy GET] ${url.pathname} -> ${targetUrl}`)

    const headers = new Headers(request.headers)
    headers.delete('host')

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    })

    const data = await response.text()
    return json(JSON.parse(data || 'null'), {
      status: response.status,
    })
  },
  POST: async ({ request, params }) => {
    const url = new URL(request.url)
    const path = params._ ?? ''
    const targetUrl = `${AUTH_SERVER_URL}/api/auth/${path}${url.search}`

    console.log(`[Proxy POST] ${url.pathname} -> ${targetUrl}`)

    const headers = new Headers(request.headers)
    headers.delete('host')

    const body = await request.text()
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
    })

    const data = await response.text()
    return json(JSON.parse(data || 'null'), {
      status: response.status,
    })
  },
})
