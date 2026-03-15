import { useTabContext } from '@mui/lab'
import React, { ReactNode } from 'react'
import { Box, Stack } from '@mui/material'

interface SettingTabProps {
  value: string
  children?: ReactNode
}

export interface SettingTabPanelProps<TPayload> extends SettingTabProps {
  reset: boolean
  payload: TPayload
}


export default function SettingTab({ children, value }: SettingTabProps) {
  const context = useTabContext()

  if (context === null) {
    throw new TypeError('No TabContext provided')
  }

  const hidden = context.value !== value

  return (
    <Box
      role="tabpanel"
      hidden={hidden}
      id={`simple-tabpanel-${value}`}
      aria-labelledby={`simple-tab-${value}`}
      sx={{ display: hidden ? 'none' : 'block' }}
    >
      <Stack spacing={1} sx={{ p: 3 }}>
        {children}
      </Stack>
    </Box>
  )
}
