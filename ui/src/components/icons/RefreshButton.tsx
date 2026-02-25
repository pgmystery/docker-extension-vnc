import { CircularProgress, IconButton, Tooltip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import React from 'react'
import { IconButtonProps } from '@mui/material/IconButton/IconButton'


interface RefreshButtonProps extends IconButtonProps {
  tooltip: string
  onClick: ()=>void
  loading: boolean
}


export default function RefreshButton({ tooltip, loading, onClick, ...props }: RefreshButtonProps) {
  return (
    <Tooltip title={tooltip} arrow>
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          alignSelf: 'start',
          marginTop: '2px',
        }}
        disabled={loading}
        { ...props }
      >
        { loading ? <CircularProgress size={24} /> : <RefreshIcon /> }
      </IconButton>
    </Tooltip>
  )
}
