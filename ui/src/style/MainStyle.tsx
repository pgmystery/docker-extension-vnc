import { GlobalStyles } from '@mui/material'
import React from 'react'


export default function MainStyle() {
  return (
    <GlobalStyles styles={{
      html: {
        height: '100%',
      },
      body: {
        height: '100%',
        padding: 0,
      },
      '#root': {
        height: '100%',
      },
    }} />
  )
}
