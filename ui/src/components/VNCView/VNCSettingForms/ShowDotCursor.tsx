import CheckboxSetting, { CheckboxSettingProps } from './base/CheckboxSetting'

export const ShowDotCursorDefault = false

export default function ShowDotCursor({ initValue, reset }: CheckboxSettingProps) {
  return (
    <CheckboxSetting initValue={initValue} reset={reset} name="showDotCursor" resetValue={ShowDotCursorDefault}>
      Show Dot when No Cursor
    </CheckboxSetting>
  )
}
