import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import LoadingButton from '@mui/lab/LoadingButton'
import SelectButton from '../utils/SelectButton/SelectButton'
import SelectButtonItem from '../utils/SelectButton/SelectButtonItem'
import { Box, SelectChangeEvent, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'


export type ExampleContainerImageTag =
    'xfce'
  | 'cinnamon'
  | 'mate'
  | 'kde-plasma'
  | 'lxqt'
  | 'lxde'
  | 'xterm'


interface ExampleContainerButtonProps {
  exampleContainer: ContainerExtended | null
  tryExampleClick: ()=>void
  deleteExampleClick: ()=>void
  startExampleClick: ()=>void
  disabled?: boolean
  loading: boolean
  onTagChange?: (tag: ExampleContainerImageTag)=>void
}


const tooltips: Record<ExampleContainerImageTag, { title: string, imageSrc: string }> = {
  xfce: {
    title: 'Try XFCE (lightweight)',
    imageSrc: "https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/xfce/docs/xfce_small.png",
  },
  cinnamon: {
    title: 'Try Cinnamon (modern GNOME-like)',
    imageSrc: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/cinnamon/docs/cinnamon_small.png',
  },
  mate: {
    title: 'Try Mate (GNOME 2 fork)',
    imageSrc: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/mate/docs/mate_small.png',
  },
  'kde-plasma': {
    title: 'Try KDE-Plasma (full-featured)',
    imageSrc: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/kde-plasma/docs/kde_plasma_small.png',
  },
  lxqt: {
    title: 'Try LXQT (light and fast)',
    imageSrc: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/lxqt/docs/lxqt_small.png',
  },
  lxde: {
    title: 'Try LXDE (legacy lightweight)',
    imageSrc: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/lxde/docs/lxde_small.png',
  },
  xterm: {
    title: 'Try XTerm (terminal only)',
    imageSrc: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/xterm/docs/xterm_small.png',
  },
}


export default function ExampleContainerButton({
  exampleContainer,
  tryExampleClick,
  deleteExampleClick,
  startExampleClick,
  disabled,
  loading,
  onTagChange,
}: ExampleContainerButtonProps) {
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const [tooltip, setTooltip] = useState<{ title: string, imageSrc: string }>(tooltips.xfce)

  useEffect(() => {
    if (!exampleContainer)
      return

    setSelectedTag(exampleContainer.Config.Image.split(':')[1])
  }, [exampleContainer])

  function handleSelectButtonChange(event: SelectChangeEvent) {
    const tag = event.target.value as ExampleContainerImageTag

    onTagChange?.(tag)
    setTooltip(tooltips[tag])
  }

  if (exampleContainer) {
    if (exampleContainer.State.Status === 'exited') {
      return (
        <LoadingButton
          variant="outlined"
          sx={{height: '55px'}}
          endIcon={<SendIcon />}
          color="warning"
          onClick={startExampleClick}
          disabled={disabled}
          loading={loading}
          loadingPosition="end"
        >Start example container</LoadingButton>
      )
    }
    else {
      return (
        <LoadingButton
          variant="outlined"
          sx={{height: '55px'}}
          endIcon={<DeleteIcon />}
          color="error"
          onClick={deleteExampleClick}
          disabled={disabled}
          loading={loading}
          loadingPosition="end"
        >Delete example container</LoadingButton>
      )
    }
  }

  return (
    <SelectButton
      variant="outlined"
      color="success"
      sx={{height: '55px'}}
      disabled={disabled || loading}
      onChange={handleSelectButtonChange}
      selectValue={selectedTag}
      tooltip={
        <Stack spacing={1}>
          <Typography>{ tooltip.title }</Typography>
          <Box
            component="img"
            alt={`Example Container (${tooltip.title})`}
            loading="lazy"
            src={tooltip.imageSrc}
            sx={{
              maxWidth: '14rem',
            }}
          />
        </Stack>
      }
    >
      <SelectButtonItem
        value="xfce"
        onTrigger={tryExampleClick}
      >Try example container (xfce)</SelectButtonItem>
      <SelectButtonItem
        value="cinnamon"
        onTrigger={tryExampleClick}
      >Try example container (cinnamon)</SelectButtonItem>
      <SelectButtonItem
        value="mate"
        onTrigger={tryExampleClick}
      >Try example container (mate)</SelectButtonItem>
      <SelectButtonItem
        value="kde-plasma"
        onTrigger={tryExampleClick}
      >Try example container (kde-plasma)</SelectButtonItem>
      <SelectButtonItem
        value="lxqt"
        onTrigger={tryExampleClick}
      >Try example container (lxqt)</SelectButtonItem>
      <SelectButtonItem
        value="lxde"
        onTrigger={tryExampleClick}
      >Try example container (lxde)</SelectButtonItem>
      <SelectButtonItem
        value="xterm"
        onTrigger={tryExampleClick}
      >Try example container (xterm)</SelectButtonItem>
    </SelectButton>
  )
}
