import React, { ReactNode, useRef, useState } from 'react'
import { ButtonGroup, ClickAwayListener, Grow, MenuList, Paper, Popper } from '@mui/material'
import Button from '@mui/material/Button'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { isFragment } from 'react-is'
import { SplitButtonItemProps } from './SplitButtonItem'


interface SplitButtonProps {
  children?: ReactNode
}

export default function SplitButton({ children }: SplitButtonProps) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState(1)
  const childrenArray = React.Children.toArray(children)
  const items = childrenArray.map(child => {
    if (!React.isValidElement(child)) {
      return null
    }

    if (process.env.NODE_ENV !== 'production') {
      if (isFragment(child)) {
        console.error(
          [
            "MUI: The Select component doesn't accept a Fragment as a child.",
            'Consider providing an array instead.',
          ].join('\n'),
        );
      }
    }

    // https://github.com/mui/material-ui/blob/master/packages/mui-material/src/Select/SelectInput.js#L381C7-L381C73
    // https://github.com/mui/material-ui/tree/master/packages/mui-material/src/Select

    return React.cloneElement(child, {
      'aria-selected': selected ? 'true' : 'false',
      onClick: handleItemClick(child),
      onKeyUp: (event) => {
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
      selected,
      value: undefined, // The value is most likely not a valid HTML attribute.
      'data-value': child.props.value, // Instead, we provide it as a data attribute.
    })
  })

  function handleClick() {

  }

  function toggleMenu() {

  }

  function handleItemClick(child) {

  }

  return (
    <>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
      >
        <Button
          onClick={handleClick}
        >

        </Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="menu"
          onClick={toggleMenu}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      disabled={index === 2}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

// https://mui.com/material-ui/react-button-group/#split-button
// https://codesandbox.io/embed/jw2gvh?module=/src/Demo.tsx&fontsize=12
