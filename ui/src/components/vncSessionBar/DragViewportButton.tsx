import { IconButton, styled, Tooltip } from '@mui/material'
import PanToolIcon from '@mui/icons-material/PanTool'
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined'
import { useEffect, useState } from 'react'


interface DragViewportButtonProps {
  onChange: (selected: boolean)=>void
  disabled?: boolean
}


const ToggleIconButton = styled(IconButton)(({ theme }) => {
  const muiIconButtonStyleRoot = theme.components?.MuiIconButton?.styleOverrides?.root

  if (muiIconButtonStyleRoot && typeof muiIconButtonStyleRoot === 'object') {
    return {
      // @ts-ignore
      '&.drag-viewport-button-selected': muiIconButtonStyleRoot['&:active'] || {},
    }
  }
})


export default function DragViewportButton({ onChange, disabled }: DragViewportButtonProps) {
  const [selected, setSelected] = useState<boolean>(false)

  useEffect(() => {
    if (disabled)
      onChange(false)
      setSelected(false)
  }, [disabled])

  function handleChange() {
    onChange(!selected)
    setSelected(!selected)
  }

  return (
    <Tooltip title="Move/Drag Viewport" arrow>
      <ToggleIconButton
        onClick={handleChange}
        disabled={disabled}
        className={selected ? 'drag-viewport-button-selected' : ''}
      >
        { selected ? <PanToolIcon color="warning"/> : <PanToolOutlinedIcon/> }
      </ToggleIconButton>
    </Tooltip>
  )
}
