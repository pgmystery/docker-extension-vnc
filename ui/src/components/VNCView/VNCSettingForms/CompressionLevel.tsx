import { ChangeEvent, useEffect, useState } from 'react'
import { FormControl, FormLabel, Input, Slider, Stack } from '@mui/material'


export const CompressionLevelRange = {
  default: 2,
  min: 0,
  max: 9
}

interface CompressionLevelProps {
  initValue: number
  reset: boolean
}


export default function CompressionLevel({ initValue, reset }: CompressionLevelProps) {
  const [compressionLevel, setCompressionLevel] = useState<number>(initValue === undefined ? CompressionLevelRange.default : initValue)

  useEffect(() => {
    if (!reset) return

    setCompressionLevel(CompressionLevelRange.default)
  }, [reset])

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setCompressionLevel(newValue as number)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCompressionLevel(event.target.value === '' ? 0 : Number(event.target.value))
  }

  const handleBlur = () => {
    if (compressionLevel < CompressionLevelRange.min) {
      setCompressionLevel(CompressionLevelRange.min)
    } else if (compressionLevel > CompressionLevelRange.max) {
      setCompressionLevel(CompressionLevelRange.max)
    }
  }

  return (
    <FormControl>
      <FormLabel>Compression Level</FormLabel>
      <Stack direction="row" spacing={2}>
        <Slider
          min={CompressionLevelRange.min}
          max={CompressionLevelRange.max}
          value={compressionLevel}
          onChange={handleSliderChange}
        />
        <Input
          name="compressionLevel"
          value={compressionLevel}
          size="small"
          onChange={handleInputChange}
          onBlur={handleBlur}
          inputProps={{
            step: 1,
            min: CompressionLevelRange.min,
            max: CompressionLevelRange.max,
            type: 'number',
          }}
        />
      </Stack>
    </FormControl>
  )
}
