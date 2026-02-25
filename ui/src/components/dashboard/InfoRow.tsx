import { Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'


export default function InfoRow({ k, v }: { k: string; v: string | ReactNode }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography sx={{ fontWeight: 700, flex: '0 0 auto' }}>{k}</Typography>
      <Typography>=</Typography>
      <Typography sx={{
        fontFamily: "monospace",
        backgroundColor: "#314759",
        color: '#ffffff',
        padding: '2px 4px',
      }}>{v}</Typography>
    </Stack>
  );
}
