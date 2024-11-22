import { ChangeEvent, useEffect, useState } from 'react'
import { Checkbox, FormControl, FormLabel } from '@mui/material'


export const ShowDotCursorDefault = false

interface ShowDotCursorProps {
  initValue: boolean
  reset: boolean
  onChange?: (showDotCursor: boolean)=>void
}


export default function ShowDotCursor({ initValue, reset, onChange }: ShowDotCursorProps) {
  const [showDotCursor, setShowDotCursor] = useState<boolean>(initValue === undefined ? ShowDotCursorDefault : initValue)

  useEffect(() => {
    if (!reset) return

    setShowDotCursor(ShowDotCursorDefault)
  }, [reset])

  useEffect(() => {
    if (onChange) onChange(showDotCursor)
  }, [showDotCursor])

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    setShowDotCursor(event.target.checked)
  }

  return (
    <FormControl>
      <FormLabel>Show Dot when No Cursor</FormLabel>
      <div>
        <Checkbox checked={showDotCursor} onChange={handleCheckboxChange} />
      </div>
    </FormControl>
  )
}
