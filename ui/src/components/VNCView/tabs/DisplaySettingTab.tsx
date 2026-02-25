import { Divider } from '@mui/material'
import SettingTab, { SettingTabPanelProps } from './SettingTab'
import Scaling, { ScalingResize } from '../VNCSettingForms/Scaling'
import ShowDotCursor from '../VNCSettingForms/ShowDotCursor'
import ViewOnly from '../VNCSettingForms/ViewOnly'
import ShowWarnings from '../VNCSettingForms/ShowWarnings'

interface DisplaySettingPayload {
    scaling: {
        clipToWindow: boolean
        resize: ScalingResize
    }
    showDotCursor: boolean
    viewOnly: boolean
    showHiddenContainerWarning: boolean
}

type DisplaySettingTabProps = SettingTabPanelProps<DisplaySettingPayload>

export default function DisplaySettingTab({ payload, reset, value }: DisplaySettingTabProps) {
    return (
        <SettingTab value={value}>
            <Scaling
                initValue={payload.scaling}
                reset={reset}
            />
            <Divider />
            <ShowDotCursor
                initValue={payload.showDotCursor}
                reset={reset}
            />
            <Divider />
            <ViewOnly
                initValue={payload.viewOnly}
                reset={reset}
            />
            <Divider />
            <ShowWarnings
                initValue={payload.showHiddenContainerWarning}
                reset={reset}
            />
        </SettingTab>
    )
}
