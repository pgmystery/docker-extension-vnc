import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import LoadingButton from '@mui/lab/LoadingButton'
import SelectButton from '../utils/SelectButton/SelectButton'
import SelectButtonItem from '../utils/SelectButton/SelectButtonItem'
import { SelectChangeEvent, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import xfceSkeleton from '../../resources/images/vnc_ubuntu/xfce/xfce_small.png'
import cinnamonSkeleton from '../../resources/images/vnc_ubuntu/cinnamon/cinnamon_small.png'
import mateSkeleton from '../../resources/images/vnc_ubuntu/mate/mate_small.png'
import kdePlasmaSkeleton from '../../resources/images/vnc_ubuntu/kde-plasma/kde_plasma_small.png'
import lxqtSkeleton from '../../resources/images/vnc_ubuntu/lxqt/lxqt_small.png'
import lxdeSkeleton from '../../resources/images/vnc_ubuntu/lxde/lxde_small.png'
import xtermSkeleton from '../../resources/images/vnc_ubuntu/xterm/xterm_small.png'
import CachedImage, { CachedImageData } from '../icons/CachedImage'


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


const imageTooltips: Record<string, CachedImageData> = {
  xfce: {
    title: 'XFCE (lightweight)',
    skeleton: xfceSkeleton,
    src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/xfce/docs/xfce_small.png',
  },
  cinnamon: {
    title: 'Cinnamon (modern GNOME-like)',
    skeleton: cinnamonSkeleton,
    src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/cinnamon/docs/cinnamon_small.png',
  },
  mate: {
    title: 'Mate (GNOME 2 fork)',
    skeleton: mateSkeleton,
    src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/mate/docs/mate_small.png',
  },
  'kde-plasma': {
    title: 'KDE-Plasma (full-featured)',
    skeleton: kdePlasmaSkeleton,
    src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/kde-plasma/docs/kde_plasma_small.png',
  },
  lxqt: {
    title: 'LXQT (light and fast)',
    skeleton: lxqtSkeleton,
    src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/lxqt/docs/lxqt_small.png',
  },
  lxde: {
    title: 'LXDE (legacy lightweight)',
    skeleton: lxdeSkeleton,
    src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/lxde/docs/lxde_small.png',
  },
  xterm: {
    title: 'XTerm (terminal only)',
    skeleton: xtermSkeleton,
    src: 'https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker/vnc_ubuntu/xterm/docs/xterm_small.png',
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
  const [selectedTag, setSelectedTag] = useState<string>("xfce")
  const [imageTooltip, setImageTooltip] = useState<CachedImageData>(imageTooltips[selectedTag])

  useEffect(() => {
    if (!exampleContainer)
      return

    const tag = exampleContainer.Config.Image.split(':')[1]

    setSelectedTag(tag)
    setImageTooltip(imageTooltips[tag])
  }, [exampleContainer])

  function handleSelectButtonChange(event: SelectChangeEvent) {
    const tag = event.target.value as ExampleContainerImageTag
    setImageTooltip(imageTooltips[tag])

    onTagChange?.(tag)
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
          <Typography>{ imageTooltip.title }</Typography>
          <CachedImage
            image={imageTooltip}
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
