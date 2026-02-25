import RefreshButton from '../../../../icons/RefreshButton'
import React, { useEffect, useState } from 'react'
import useInputDevices from '../../../../../hooks/useInputDevices'
import { FormControl, InputLabel, ListItemText, MenuItem, Select, Stack } from '@mui/material'
import truncate from '../../../../../utils/truncate'

interface InputDevicesSelectProps {
  setCurrentInputDevice: (deviceId?: string) => void
  currentInputDevice?: string
  disabled?: boolean
}

export default function InputDevicesSelect({ setCurrentInputDevice, currentInputDevice, disabled }: InputDevicesSelectProps) {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([])
  const [isRefreshing, setIsRefreshing] = useState<boolean>(true)
  const { getInputDevices } = useInputDevices()

  useEffect(() => {
    handleRefreshButtonClick()
  }, [])

  function handleRefreshButtonClick() {
    setIsRefreshing(true)
    getInputDevices().then(devices => {
      setInputDevices(devices)
      setCurrentInputDevice(
        devices.find(d => d.deviceId === currentInputDevice)?.deviceId ?? devices[0].deviceId ?? null
      )
      setIsRefreshing(false)
    })
  }

  return (
    <Stack direction="row" spacing={1}>

      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel id="audio-input-device-label">Input Device</InputLabel>
        <Select
          name="audio.input.device"
          labelId="audio-input-device-label"
          value={currentInputDevice || ''}
          label="Input Device"
          onChange={(e) => {
            const v = e.target.value
            setCurrentInputDevice(inputDevices.find(d => d.deviceId === v)?.deviceId)
          }}
          disabled={isRefreshing || disabled}
        >
          {
            inputDevices.map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                <ListItemText
                  primary={device.label || `Microphone (${truncate(device.deviceId, 50)})`}
                  secondary={device.label ? `ID: ${truncate(device.deviceId, 50)}` : 'Device'}
                />
              </MenuItem>
            ))
          }
        </Select>
      </FormControl>

      <RefreshButton
        disabled={isRefreshing || disabled}
        tooltip="Refresh Input Devices"
        onClick={ handleRefreshButtonClick }
        loading={ isRefreshing }
        sx={{
          margin: 'auto',
        }}
      />
    </Stack>
  )
}
