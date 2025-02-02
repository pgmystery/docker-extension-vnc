import React, { ReactElement, ReactNode, useRef, useState } from 'react'
import { Box, ButtonGroup, ButtonGroupProps, ClickAwayListener, Grow, MenuList, Paper, Popper } from '@mui/material'
import Button from '@mui/material/Button'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { isFragment } from 'react-is'
import SelectButtonItem, { SelectButtonItemProps } from './SelectButtonItem'
import { SelectChangeEvent } from '@mui/material/Select/SelectInput'


interface SelectButtonProps extends Omit<ButtonGroupProps, 'onChange'> {
  children?: ReactElement<SelectButtonItemProps, typeof SelectButtonItem> | ReactElement<SelectButtonItemProps, typeof SelectButtonItem>[]
  onChange?: (event: SelectChangeEvent, child: React.ReactNode)=>void
  endIcon?: ReactNode
}

export default function SelectButton(props: SelectButtonProps) {
  const {children, onChange} = props
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState(0)
  const items = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return null
    }

    if (process.env.NODE_ENV !== 'production') {
      if (isFragment(child)) {
        console.error(
          [
            "The SelectButton component doesn't accept a Fragment as a child.",
            'Consider providing an array instead.',
          ].join('\n'),
        )

        return null
      }
    }

    function handleItemClick(event: React.MouseEvent<HTMLLIElement, MouseEvent>) {
      setOpen(false)
      child?.props.onClick?.(event)

      if (index === selected)
        return

      setSelected(index)

      if (onChange) {
        // Redefine target to allow name and value to be read.
        // This allows seamless integration with the most popular form libraries.
        // https://github.com/mui/material-ui/issues/13485#issuecomment-676048492
        // Clone the event to not override `target` of the original event.
        const nativeEvent = event.nativeEvent || event
        // @ts-ignore
        const clonedEvent = new nativeEvent.constructor(nativeEvent.type, nativeEvent)

        Object.defineProperty(clonedEvent, 'target', {
          writable: true,
          value: {
            index,
            value: child?.props.value,
          }
        })

        onChange(clonedEvent, child)
      }
    }

    return React.cloneElement(child, {
      'aria-selected': selected === index ? 'true' : 'false',
      onClick: handleItemClick,
      onKeyUp: event => {
        if (event.key === ' ') {
          // otherwise our MenuItems dispatches a click event
          // it's not behavior of the native <option> and causes
          // the select to close immediately since we open on space keydown
          event.preventDefault();
        }

        if (child.props.onKeyUp) {
          child.props.onKeyUp(event);
        }
      },
      role: 'option',
      selected: selected === index,
    })
  })

  function handleClick(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    if (!items)
      return

    const selectedItemComponent = items[selected]

    if (!selectedItemComponent)
      return

    if (selectedItemComponent.props.onTrigger)
      selectedItemComponent.props.onTrigger(event)
  }

  function toggleMenu() {
    setOpen((prevOpen) => !prevOpen)
  }

  function handleClose(event: (MouseEvent | TouchEvent)) {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement))
      return

    setOpen(false)
  }

  return (
    <>
      <ButtonGroup
        { ...props }
        onChange={ undefined }
        ref={ anchorRef }
      >
        <Button
          endIcon={ props.endIcon }
          onClick={ handleClick }
        >
          { !(items) || items[selected].props.children || <Box/> }
        </Button>
        <Button
          size="small"
          aria-controls={ open ? 'select-button-menu' : undefined }
          aria-expanded={ open ? 'true' : undefined }
          aria-haspopup="menu"
          onClick={ toggleMenu }
        >
          <ArrowDropDownIcon/>
        </Button>
      </ButtonGroup>

      <Popper
        sx={ {zIndex: 1} }
        open={ open }
        anchorEl={ anchorRef.current }
        role={ undefined }
        transition
        disablePortal
      >
        { ({TransitionProps, placement}) => (
          <Grow
            { ...TransitionProps }
            style={ {
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            } }
          >
            <Paper>
              <ClickAwayListener onClickAway={ handleClose }>
                <MenuList id="select-button-menu" autoFocusItem>
                  { items }
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        ) }
      </Popper>
    </>
  )
}
