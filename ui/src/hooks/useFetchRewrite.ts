import { useEffect } from 'react'

type RequestMatcher = (url: string, input: RequestInfo | URL, init?: RequestInit) => boolean
type RequestRewriter = (url: string, input: RequestInfo | URL, init?: RequestInit) => RequestInfo | URL

export type FetchRewriteRule = {
  match: RequestMatcher
  rewrite: RequestRewriter
}

type FetchPatchState = {
  originalFetch: typeof window.fetch
  rules: Map<string, FetchRewriteRule>
}

const PATCH_KEY = '__app_fetch_rewrite_patch__'

function getState(): FetchPatchState | null {
  return (window as any)[PATCH_KEY] ?? null
}

function setState(state: FetchPatchState | null) {
  if (state) (window as any)[PATCH_KEY] = state
  else delete (window as any)[PATCH_KEY]
}

function ensurePatched() {
  const existing = getState()
  if (existing) return existing

  const state: FetchPatchState = {
    originalFetch: window.fetch.bind(window),
    rules: new Map(),
  }

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const current = getState()
    const original = current?.originalFetch ?? state.originalFetch

    const url =
      typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url

    if (current) {
      for (const rule of current.rules.values()) {
        try {
          if (rule.match(url, input, init)) {
            const rewritten = rule.rewrite(url, input, init)
            return original(rewritten as any, init)
          }
        } catch {
          // If a rule misbehaves, ignore it and fall through to original fetch.
        }
      }
    }

    return original(input as any, init)
  }) as any

  setState(state)
  return state
}

function maybeUnpatch() {
  const state = getState()
  if (!state) return
  if (state.rules.size > 0) return

  window.fetch = state.originalFetch
  setState(null)
}

type UseFetchRewriteOptions = { enabled?: boolean }

/**
 * Supports:
 *  - a single rule: useFetchRewrite(rule)
 *  - multiple rules: useFetchRewrite([rule1, rule2])
 *  - disable/enable: useFetchRewrite(rules, { enabled: false })
 */
export default function useFetchRewrite(
  rules: FetchRewriteRule | FetchRewriteRule[] | null,
  options?: UseFetchRewriteOptions,
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
