import CheckboxSetting from './base/CheckboxSetting'


export const ShowDotCursorDefault = false

interface ShowDotCursorProps {
  initValue?: boolean
  reset: boolean
}


export default function ShowDotCursor({ initValue, reset }: ShowDotCursorProps) {
  return (
    <CheckboxSetting initValue={initValue} reset={reset} name="showDotCursor" resetValue={ShowDotCursorDefault}>
      Show Dot when No Cursor
    </CheckboxSetting>
  )
}
