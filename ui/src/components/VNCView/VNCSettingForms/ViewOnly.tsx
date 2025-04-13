import CheckboxSetting from './base/CheckboxSetting'


export const ViewOnlyDefault = false

interface ViewOnlyProps {
  initValue?: boolean
  reset: boolean
}


export default function ViewOnly({ initValue, reset }: ViewOnlyProps) {
  return (
    <CheckboxSetting initValue={initValue} reset={reset} name="viewOnly" resetValue={ViewOnlyDefault}>
      View only mode
    </CheckboxSetting>
  )
}
