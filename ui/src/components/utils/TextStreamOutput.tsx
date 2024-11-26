import { Box, CircularProgress, Divider, Paper, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'


interface TextStreamOutputProps {
  title: string
  stdout: string[]
  isFinished: boolean
}


export default function TextStreamOutput({ title, isFinished, stdout }: TextStreamOutputProps) {
  const paragraphRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!paragraphRef || stdout.length === 0) return

    paragraphRef.current?.scrollTo(0, paragraphRef.current?.scrollHeight)
  }, [stdout])

  return (
    <Paper sx={{display: 'flex', flexDirection: 'column', overflow: 'auto', width: '100%'}}>
      <Typography variant="h2" sx={{padding: '10px'}}>{ title }</Typography>
      <Divider />
      <Box
        component="p"
        ref={paragraphRef}
        sx={{
          overflow: 'auto',
          width: '100%',
          textAlign: 'left',
          padding: '10px',
          marginTop: 0,
      }}
      >
        {stdout.map((stdout, index) =>
          <Typography sx={{display: 'block'}} component={'span'} key={index}>{ stdout }</Typography>
        )}
        {!isFinished && <CircularProgress size="30px" sx={{marginTop: '10px'}} />}
      </Box>
    </Paper>
  )
}
