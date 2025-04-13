import { ChangeEvent, ReactNode, useEffect, useState } from 'react'
import { Checkbox, CheckboxProps, FormControl, FormLabel } from '@mui/material'


interface CheckBoxSettingProps extends CheckboxProps {
  initValue?: boolean
  reset: boolean
  name: string
  resetValue: boolean
  children: ReactNode
}

export default function CheckboxSetting({ initValue, reset, resetValue, children, name, ...props }: CheckBoxSettingProps) {
  const [checked, setChecked] = useState<boolean>(initValue === undefined ? resetValue : initValue)

  useEffect(() => {
    if (!reset)
      return

    setChecked(resetValue)
  }, [reset])

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    setChecked(event.target.checked)
  }

  return (
    <FormControl>
      <FormLabel>{ children }</FormLabel>
      <div>
        <Checkbox { ...props } name={name} checked={checked} onChange={handleCheckboxChange} />
      </div>
    </FormControl>
  )
}
