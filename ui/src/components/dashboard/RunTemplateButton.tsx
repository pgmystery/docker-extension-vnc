import LoadingButton from '@mui/material/Button'
import SendIcon from '@mui/icons-material/Send'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import DockerCli from '../../libs/docker/DockerCli'
import SelectButton from '../utils/SelectButton/SelectButton'
import SelectButtonItem from '../utils/SelectButton/SelectButtonItem'
import useImagePullDialog from '../../hooks/useImagePullDialog'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'

interface RunTemplateButtonProps {
  children?: ReactNode
  onClickStart: ()=>void
  disabled: boolean
  loading: boolean
  isOfficialImage?: boolean
  image?: string
  digestSha?: string
}

export default function RunTemplateButton({
  disabled,
  loading,
  onClickStart,
  children,
  isOfficialImage,
  image,
  digestSha,
}: RunTemplateButtonProps) {
  const dockerCli = useMemo(() => new DockerCli(), [])
  const [localImagesUpdates, setLocalImagesUpdates] = useState<Record<string, boolean>>({})
  const imagePullDialog = useImagePullDialog()
  const [isUpdating, setUpdating] = useState<boolean>(false)

  useEffect(() => {
    if (!isOfficialImage)
      return

    if (!image || !digestSha)
      return

    if (image in localImagesUpdates)
      return

    const controller = new AbortController()

    checkForImageUpdate(image, controller.signal)

    return () => {
      controller.abort()
    }
  }, [isOfficialImage, image, digestSha])

  function checkForImageUpdate(image: string, abortSignal?: AbortSignal) {
    return new Promise<void>(resolve => {
      dockerCli.inspectStream(image, {
        abortSignal,
      })
      .then(imagesInfo => {
        setLocalImagesUpdates(prev => ({
          ...prev,
          [image]: !imagesInfo.some(
            imageInfo => imageInfo.RepoDigests.some(
              repoDigest => repoDigest.split('@')[1] === digestSha
            )
          )
        }))
        resolve()
      })
      .catch(_=>{})  // Ignoring error message if image is not found locally
    })
  }

  async function updateImage() {
    if (!image)
      return

    setUpdating(true)
    await imagePullDialog(image)
    await checkForImageUpdate(image)
    setUpdating(false)
  }

  if (image && image in localImagesUpdates && localImagesUpdates[image])
    return (
      <SelectButton
        variant="outlined"
        color="warning"
        disabled={disabled || loading || isUpdating}
        loading={loading || isUpdating}
      >
        <SelectButtonItem
          value="update"
          onTrigger={updateImage}
          color="warning"
          endIcon={<SystemUpdateAltIcon />}
        >
          Update Image { children }
        </SelectButtonItem>
        <SelectButtonItem
          value="run"
          onTrigger={onClickStart}
          color="success"
          endIcon={<SendIcon />}
        >
          Run Template { children }
        </SelectButtonItem>
      </SelectButton>
    )

  return (
    <LoadingButton
      variant="outlined"
      endIcon={<SendIcon />}
      color="success"
      onClick={onClickStart}
      disabled={disabled}
      loading={loading || isUpdating}
      loadingPosition="end"
    >Run Template { children }</LoadingButton>
  )
}
