import QualityLevel from '../VNCSettingForms/QualityLevel'
import { Divider } from '@mui/material'
import CompressionLevel from '../VNCSettingForms/CompressionLevel'
import SettingTab, { SettingTabPanelProps } from './SettingTab'


interface VncSettingPayload {
  qualityLevel: number,
  compressionLevel: number,
}

type VncSettingTabProps = SettingTabPanelProps<VncSettingPayload>


export default function VncSettingTab({ payload, reset, value }: VncSettingTabProps) {
  return (
    <SettingTab value={value}>
      <QualityLevel
        initValue={payload.qualityLevel}
        reset={reset}
      />
      <Divider />
      <CompressionLevel
        initValue={payload.compressionLevel}
        reset={reset}
      />
    </SettingTab>
  )
}
