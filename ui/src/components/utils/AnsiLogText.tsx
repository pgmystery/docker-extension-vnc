import React, { useMemo } from 'react'
import { Box, BoxProps } from '@mui/material'
import { AnsiUp } from 'ansi_up'
import DOMPurify from 'dompurify'

export interface AnsiLogTextProps extends Omit<BoxProps, 'children'> {
  /** Raw text which may contain ANSI escape sequences like \u001b[0;32m */
  text: string
}

/**
 * Renders ANSI-colored terminal output in the browser safely.
 * - ansi_up converts ANSI SGR codes to HTML <span style="...">
 * - DOMPurify sanitizes the HTML before injecting it
 */
export default function AnsiLogText({ text, sx, ...rest }: AnsiLogTextProps) {
  const safeHtml = useMemo(() => {
    const ansiUp = new AnsiUp()

    // Convert ANSI -> HTML
    const html = ansiUp.ansi_to_html(text ?? '')

    // Sanitize HTML (defense-in-depth)
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
    })
  }, [text])

  return (
    <Box
      component="pre"
      {...rest}
      sx={{
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '0.85rem',
        lineHeight: 1.35,
        ...sx,
      }}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
