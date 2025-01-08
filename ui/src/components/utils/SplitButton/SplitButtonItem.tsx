import { MenuItem, MenuItemProps } from '@mui/material'


export interface SplitButtonItemProps extends MenuItemProps {

}


export default function SplitButtonItem(props: SplitButtonItemProps) {


  return (
    <MenuItem
      { ...props }
    >
      { props.children }
    </MenuItem>
  )
}
