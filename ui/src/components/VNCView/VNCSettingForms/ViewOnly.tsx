import { ChangeEvent, useEffect, useState } from 'react'
import { Checkbox, FormControl, FormLabel } from '@mui/material'


export const ViewOnlyDefault = false

interface ViewOnlyProps {
  initValue?: boolean
  reset: boolean
}


export default function ViewOnly({ initValue, reset }: ViewOnlyProps) {
  const [viewOnly, setViewOnly] = useState<boolean>(initValue === undefined ? ViewOnlyDefault : initValue)

  useEffect(() => {
    if (!reset) return

    setViewOnly(ViewOnlyDefault)
  }, [reset])

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    setViewOnly(event.target.checked)
  }

  return (
    <FormControl>
      <FormLabel>View only mode</FormLabel>
      <div>
        <Checkbox name="viewOnly" checked={viewOnly} onChange={handleCheckboxChange} />
      </div>
    </FormControl>
  )
}
