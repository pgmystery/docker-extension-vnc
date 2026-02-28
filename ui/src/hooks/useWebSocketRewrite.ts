import { useEffect } from 'react'

type WsMatcher = (url: string, input: string | URL, protocols?: string | string[]) => boolean
type WsRewriter = (url: string, input: string | URL, protocols?: string | string[]) => string | URL

export type WebSocketRewriteRule = {
  match: WsMatcher
  rewrite: WsRewriter
}

type WebSocketPatchState = {
  originalWebSocket: typeof window.WebSocket
  rules: Map<string, WebSocketRewriteRule>
}

const PATCH_KEY = '__app_websocket_rewrite_patch__'

function getState(): WebSocketPatchState | null {
  return (window as any)[PATCH_KEY] ?? null
}

function setState(state: WebSocketPatchState | null) {
  if (state) (window as any)[PATCH_KEY] = state
  else delete (window as any)[PATCH_KEY]
}

function ensurePatched(): WebSocketPatchState {
  const existing = getState()
  if (existing) return existing

  const originalWebSocket = window.WebSocket

  const state: WebSocketPatchState = {
    originalWebSocket,
    rules: new Map(),
  }

  class PatchedWebSocket extends originalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      const current = getState()
      const rules = current?.rules ?? state.rules

      const rawUrl = typeof url === 'string' ? url : url.toString()
      let finalUrl: string | URL = url

      for (const rule of rules.values()) {
        try {
          if (rule.match(rawUrl, url, protocols)) {
            finalUrl = rule.rewrite(rawUrl, url, protocols)
            break
          }
        } catch {
          // Ignore a misbehaving rule; fall back to original URL.
        }
      }

      const wsUrl = typeof finalUrl === 'string' ? finalUrl : finalUrl.toString()
      super(wsUrl, protocols)
    }
  }

  // Preserve constants like WebSocket.OPEN, etc. (without assigning to read-only props)
  for (const key of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'] as const) {
    const desc = Object.getOwnPropertyDescriptor(originalWebSocket, key)
    if (desc) {
      try {
        Object.defineProperty(PatchedWebSocket, key, desc)
      } catch {
        // If the environment forbids redefining, skip—most code won’t need these on the patched ctor.
      }
    }
  }

  window.WebSocket = PatchedWebSocket as any
  setState(state)
  return state
}

function maybeUnpatch() {
  const state = getState()
  if (!state) return
  if (state.rules.size > 0) return

  window.WebSocket = state.originalWebSocket
  setState(null)
}

type UseWebSocketRewriteOptions = { enabled?: boolean }

/**
 * Supports:
 *  - a single rule: useWebSocketRewrite(rule)
 *  - multiple rules: useWebSocketRewrite([rule1, rule2])
 *  - disable/enable: useWebSocketRewrite(rules, { enabled: false })
 */
export default function useWebSocketRewrite(
  rules: WebSocketRewriteRule | WebSocketRewriteRule[] | null,
  options?: UseWebSocketRewriteOptions,
) {
  useEffect(() => {
    const enabled = options?.enabled ?? true
    if (!enabled || !rules) return

    const list = Array.isArray(rules) ? rules : [rules]
    if (list.length === 0) return

    const state = ensurePatched()
    const ids: string[] = []

    for (const rule of list) {
      const id = crypto.randomUUID()
      state.rules.set(id, rule)
      ids.push(id)
    }

    return () => {
      const current = getState()
      if (current) {
        for (const id of ids) current.rules.delete(id)
      }
      maybeUnpatch()
    }
  }, [rules, options?.enabled])
}
