import CheckboxSetting, { CheckboxSettingProps } from './base/CheckboxSetting'

export const ShowHiddenContainerWarningDefault = true

export default function ShowWarnings({ initValue, reset }: CheckboxSettingProps) {
  return (
    <CheckboxSetting initValue={initValue} reset={reset} name="showHiddenContainerWarning" resetValue={ShowHiddenContainerWarningDefault}>
      Show warning of hidden containers
    </CheckboxSetting>
  )
}
