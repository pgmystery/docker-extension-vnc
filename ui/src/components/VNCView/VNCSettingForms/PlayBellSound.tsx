import CheckboxSetting from './base/CheckboxSetting'


export const PlayBellSoundDefault = true

interface PlayBellSoundProps {
  initValue?: boolean
  reset: boolean
}


export default function PlayBellSound({ initValue, reset }: PlayBellSoundProps) {
  return (
    <CheckboxSetting initValue={initValue} reset={reset} name="playBell" resetValue={PlayBellSoundDefault} >
      Play Bell-Sound when a audible bell request is received from the server
    </CheckboxSetting>
  )
}
