import { FormControl, FormLabel, Input, Slider, Stack } from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'


export const QualityLevelRange = {
  default: 6,
  min: 0,
  max: 9
}

interface QualityLevelProps {
  initValue: number
  reset: boolean
}


export default function QualityLevel({ reset, initValue }: QualityLevelProps) {
  const [qualityLevel, setQualityLevel] = useState<number>(initValue === undefined ? QualityLevelRange.default : initValue)

  useEffect(() => {
    if (!reset) return

    setQualityLevel(QualityLevelRange.default)
  }, [reset])

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setQualityLevel(newValue as number)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQualityLevel(event.target.value === '' ? 0 : Number(event.target.value))
  }

  const handleBlur = () => {
    if (qualityLevel < QualityLevelRange.min) {
      setQualityLevel(QualityLevelRange.min)
    } else if (qualityLevel > QualityLevelRange.max) {
      setQualityLevel(QualityLevelRange.max)
    }
  }

  return (
    <FormControl>
      <FormLabel>Quality Level</FormLabel>
      <Stack direction="row" spacing={2}>
        <Slider
          min={QualityLevelRange.min}
          max={QualityLevelRange.max}
          value={qualityLevel}
          onChange={handleSliderChange}
        />
        <Input
          name="qualityLevel"
          value={qualityLevel}
          size="small"
          onChange={handleInputChange}
          onBlur={handleBlur}
          slotProps={{
            input: {
              step: 1,
              min: QualityLevelRange.min,
              max: QualityLevelRange.max,
              type: 'number',
            },
          }}
        />
      </Stack>
    </FormControl>
  )
}
