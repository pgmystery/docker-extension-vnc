import { useEffect, useMemo } from 'react'
import useFetchRewrite from '../../hooks/useFetchRewrite'
import useWebSocketRewrite from '../../hooks/useWebSocketRewrite'

export default function SelkiesView() {
  const turnConfigUrl =
    (import.meta as any).env?.VITE_SELKIES_TURN_URL ?? 'http://localhost:4433/turn'
  const selkiesWsUrl =
    (import.meta as any).env?.VITE_SELKIES_WS_URL ?? 'http://localhost:4433/websockets'
  const selkiesUrl =
    (import.meta as any).env?.VITE_SELKIES_URL ?? 'http://localhost:4433/selkies'

  const turnRewriteRule = useMemo(() => {
    return {
      match: (url: string) =>
        url === './turn' || url === 'turn' || url.endsWith('/turn'),
      rewrite: () => turnConfigUrl,
    }
  }, [turnConfigUrl])

  const websocketsRewriteRule = useMemo(() => {
    return {
      match: (url: string) =>
        url === './websockets' || url === 'websockets' || url.endsWith('/websockets'),
      rewrite: () => {
        console.log('websocketsRewriteRule', selkiesWsUrl)

        return selkiesWsUrl
      },
    }
  }, [selkiesWsUrl])

  const manifestRewriteRule = useMemo(() => {
    return {
      match: (url: string) =>
        url === './manifest.json' || url === 'manifest.json' || url.endsWith('/manifest.json'),
      rewrite: () => {
        console.log('manifestRewriteRule', selkiesUrl + '/manifest.json')

        return selkiesUrl + '/manifest.json'
      },
    }
  }, [selkiesUrl])

  const websocketsWsRewriteRule = useMemo(() => {
    const target = selkiesWsUrl.replace(/^http/i, 'ws')
    return {
      match: (url: string) => url.endsWith('/websockets') || url.includes('/websockets?'),
      rewrite: () => {
        console.log('websocketsWsRewriteRule', target)

        return target
      },
    }
  }, [selkiesWsUrl])

  useFetchRewrite([turnRewriteRule, manifestRewriteRule, websocketsRewriteRule])
  useWebSocketRewrite(websocketsWsRewriteRule)

  useEffect(() => {
    // @ts-ignore
    window.__SELKIES_STREAMING_MODE__ = 'websockets'
    // @ts-ignore
    void import('gst-web-core/selkies-core.js').then(() => document.dispatchEvent(new Event('DOMContentLoaded')));
  }, [])

  return <div id="app"></div>
}
