import { Fab } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download';
import useImagePullDialog from '../../hooks/useImagePullDialog'
import useConfig from '../../hooks/useConfig'
import { useEffect, useReducer, useState } from 'react'
import DockerHubApi from '../../libs/dockerHub/DockerHubApi'
import DockerCli from '../../libs/docker/DockerCli'


export default function DockerImageProxyUpdateButton() {
  const [{ proxyDockerImage }] = useConfig()
  const dockerPullImageDialog = useImagePullDialog()
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false)
  const [checkForUpdate, setCheckForUpdate] = useState<boolean>(false)

  useEffect(() => {
    const [repository, tag] = proxyDockerImage.split(':')
    const dockerHubApi = new DockerHubApi()

    dockerHubApi.repository(repository).getTag(tag).then(async proxyImageInfo => {
      const dockerCli = new DockerCli()

      try {
        const imagesInfo = await dockerCli.image.inspect(proxyDockerImage)

        setUpdateAvailable(!imagesInfo.some(imageInfo =>
          imageInfo.RepoDigests.some(repoDigest => repoDigest.split('@')[1] === proxyImageInfo.digest))
        )
      }
      catch {}
    })
  }, [checkForUpdate])

  async function pullProxyImage() {
    await dockerPullImageDialog(proxyDockerImage)

    setCheckForUpdate(!checkForUpdate)
  }

  return updateAvailable
      ? (
           <Fab
             variant="extended"
             color="warning"
             sx={{
               position: 'absolute',
               bottom: 0,
               right: 0,
             }}
             onClick={pullProxyImage}
           >
             Update for the Proxy is available!
             <DownloadIcon sx={{paddingLeft: '5px'}} />
           </Fab>
        )
      : <></>
}
