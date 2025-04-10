import DockerCli from '../../libs/docker/DockerCli'
import { useEffect, useState } from 'react'
import InfoText from './InfoText'
import { Link, TypographyProps } from '@mui/material'
import useImagePullDialog from '../../hooks/useImagePullDialog'


interface InfoTextUpdateAvailableProps extends TypographyProps {
  image?: string
  digestSha?: string
}


export default function InfoTextUpdateAvailable(props: InfoTextUpdateAvailableProps) {
  const { digestSha, image } = props
  const dockerCli = new DockerCli()
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false)
  const imagePullDialog = useImagePullDialog()
  const [checkForUpdate, setCheckForUpdate] = useState<boolean>(false)

  useEffect(() => {
    async function getLocalDigestSha() {
      if (!digestSha || !image)
        return

      try {
        const imagesInfo = await dockerCli.image.inspect(image)
        setUpdateAvailable(!imagesInfo.some(imageInfo => imageInfo.RepoDigests.some(repoDigest => repoDigest.split('@')[1] === digestSha)))
      }
      catch {}
    }

    if (!digestSha)
      return

    getLocalDigestSha()
  }, [digestSha, checkForUpdate])

  async function updateImage() {
    if (!image)
      return

    await imagePullDialog(image)
    setCheckForUpdate(!checkForUpdate)
  }

  return (digestSha && updateAvailable)
    ? (
        <InfoText variant="h2" sx={{textDecoration: 'underline'}}>
          <Link
            component="button"
            sx={{
              textAlign: 'left',
            }}
            onClick={updateImage}
          >Update Available for {image}</Link>
        </InfoText>
      )
    : <></>
}
