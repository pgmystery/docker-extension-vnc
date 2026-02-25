import { Divider } from '@mui/material'
import SettingTab, { SettingTabPanelProps } from './SettingTab'
import AudioOutput, { AudioOutputSettings } from '../VNCSettingForms/AudioOutput'
import AudioInput, { AudioInputSettings } from '../VNCSettingForms/AudioInput'
import PlayBellSound from '../VNCSettingForms/PlayBellSound'

interface AudioSettingPayload {
    audio: {
        output: AudioOutputSettings
        input: AudioInputSettings
    }
    playBell: boolean
}

type AudioSettingTabProps = SettingTabPanelProps<AudioSettingPayload>

export default function AudioSettingTab({ payload, reset, value }: AudioSettingTabProps) {
    return (
        <SettingTab value={value}>
            <AudioOutput
                initValue={payload.audio.output}
                reset={reset}
            />
            <Divider />
            <AudioInput
                initValue={payload.audio.input}
                reset={reset}
            />
            <Divider />
            <PlayBellSound
                initValue={payload.playBell}
                reset={reset}
            />
        </SettingTab>
    )
}
