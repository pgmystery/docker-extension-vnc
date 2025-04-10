import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  InputAdornment,
  TextField,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import * as React from 'react'
import { ChipTypeMap } from '@mui/material/Chip'
import { useState } from 'react'
import { BaseTextFieldProps } from '@mui/material/TextField/TextField'


interface AutocompleteSearchProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
> extends Omit<AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>, 'renderInput'> {
  isSearching: boolean
  label: string
  name: string
  color?: BaseTextFieldProps['color']
}


export default function AutocompleteSearch<
  Value,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
>(props: AutocompleteSearchProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) {
  const { inputValue, isSearching, label, name, color } = props
  const [focus, setFocus] = useState<boolean>(false)

  return (
    <Autocomplete
      { ...props }
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      renderInput={
        params => <TextField
          {...params}
          label={label}
          name={name}
          color={color}
          slotProps={{
            htmlInput: params.inputProps,
            inputLabel: {
              ...params.InputLabelProps,
              shrink: !!inputValue || focus,
              sx: {
                paddingLeft: '20px',

                '&.MuiInputLabel-shrink': {
                  paddingLeft: 0,
                },
              },
            },
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  {
                    isSearching
                    ? <CircularProgress size={20.5} color="inherit" />
                    : <SearchIcon />
                  }
                </InputAdornment>
              ),
            },
          }}
        />}
    />
  )
}
