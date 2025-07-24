import { CircularProgress, IconButton, Tooltip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import React from 'react'


interface RefreshButtonProps {
  tooltip: string
  onClick: ()=>void
  loading: boolean
}


export default function RefreshButton({ tooltip, loading, onClick }: RefreshButtonProps) {
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
      >
        { loading ? <CircularProgress /> : <RefreshIcon /> }
      </IconButton>
    </Tooltip>
  )
}
