import { ChangeEvent, useEffect, useState } from 'react'
import { Checkbox, FormControl, FormLabel } from '@mui/material'


export const ShowDotCursorDefault = false

interface ShowDotCursorProps {
  initValue: boolean
  reset: boolean
}


export default function ShowDotCursor({ initValue, reset }: ShowDotCursorProps) {
  const [showDotCursor, setShowDotCursor] = useState<boolean>(initValue === undefined ? ShowDotCursorDefault : initValue)

  useEffect(() => {
    if (!reset) return

    setShowDotCursor(ShowDotCursorDefault)
  }, [reset])

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    setShowDotCursor(event.target.checked)
  }

  return (
    <FormControl>
      <FormLabel>Show Dot when No Cursor</FormLabel>
      <div>
        <Checkbox name="showDotCursor" checked={showDotCursor} onChange={handleCheckboxChange} />
      </div>
    </FormControl>
  )
}
