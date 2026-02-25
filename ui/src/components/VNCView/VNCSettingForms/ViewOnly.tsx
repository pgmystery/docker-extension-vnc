import CheckboxSetting, { CheckboxSettingProps } from './base/CheckboxSetting'

export const ViewOnlyDefault = false

export default function ViewOnly({ initValue, reset }: CheckboxSettingProps) {
  return (
    <CheckboxSetting initValue={initValue} reset={reset} name="viewOnly" resetValue={ViewOnlyDefault}>
      View only mode
    </CheckboxSetting>
  )
}
