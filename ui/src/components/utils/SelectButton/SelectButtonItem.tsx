import { MenuItem, MenuItemProps } from '@mui/material'
import React, { ReactNode } from 'react'
import { ButtonGroupOwnProps } from '@mui/material/ButtonGroup/ButtonGroup'


export interface SelectButtonItemProps extends MenuItemProps {
  index?: number
  onTrigger: (event: React.MouseEvent<HTMLElement, MouseEvent>)=>void
  color?: ButtonGroupOwnProps['color']
  endIcon?: ReactNode
}


export default function SelectButtonItem(props: SelectButtonItemProps) {
  return (
    <MenuItem { ...props } >
      { props.children }
    </MenuItem>
  )
}
