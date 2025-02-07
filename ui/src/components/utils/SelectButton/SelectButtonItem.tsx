import { MenuItem, MenuItemProps } from '@mui/material'
import React from 'react'


export interface SelectButtonItemProps extends MenuItemProps {
  index?: number
  onTrigger: (event: React.MouseEvent<HTMLElement, MouseEvent>)=>void
}


export default function SelectButtonItem(props: SelectButtonItemProps) {
  return (
    <MenuItem { ...props } >
      { props.children }
    </MenuItem>
  )
}
