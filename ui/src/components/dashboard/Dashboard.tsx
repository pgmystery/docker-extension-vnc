import { useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react'
import {
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment, Link,
  OutlinedInput,
  Stack,
  Tooltip,
  Typography,
  TypographyProps
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import TextStreamOutput from '../utils/TextStreamOutput'
import { Toast } from '@docker/extension-api-client-types/dist/v1'
import { isRawExecResult } from '../../libs/docker/cli/Exec'
import DockerCli from '../../libs/docker/DockerCli'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import useConfig from '../../hooks/useConfig'
import { Session } from '../../types/session'
import { SessionStore } from '../../stores/sessionStore'
import ExampleContainerButton, { ExampleContainerImageTag } from './ExampleContainerButton'
import {filesize} from "filesize"
import DockerHubApi from '../../libs/dockerHub/DockerHubApi'


interface DashboardProps {
  ddUIToast: Toast
  connect: (session: Session)=>Promise<void>
  sessionStore: SessionStore
  openUrl: (url: string)=>void
}

interface InfoTextImageSizeProps extends TypographyProps {
  image: string
}

const UbuntuVNCDockerSessionName = 'example vnc container'
const UbuntuVNCDockerContainerName = 'ubuntu_vnc'
const UbuntuVNCDockerImage = 'pgmystery/ubuntu_vnc'
const UbuntuVNCDockerImageDefaultTag = 'xfce'
const UbuntuVNCDockerImageLabel = 'pgmystery.vnc.extension.example'
const UbuntuVNCDockerImagePort = 5901


function InfoText(props: TypographyProps) {
  return <Typography
    sx={{
      textAlign: 'left',
      marginLeft: '14px',
      marginRight: '14px',
    }}
    { ...props }
  >{ props.children }</Typography>
}


function InfoTextImageSize(props: InfoTextImageSizeProps) {
  const dockerHubApi = new DockerHubApi()
  const [imageSize, setImageSize] = useState<string | undefined>()
  const { image: imageWithTag } = props

  useEffect(() => {
    setImageSize(undefined)

    if (imageWithTag === '') {
      setImageSize('ERROR')

      return
    }

    const [image, tag] = imageWithTag.split(':')
    const dockerRepo = dockerHubApi.repository(image)
    dockerRepo.getTag(tag)
              .then(imageInfo => setImageSize(filesize(imageInfo.full_size, {standard: 'jedec'})))
  }, [imageWithTag])

  return <InfoText>Image sizes = {
    imageSize === undefined
      ? <CircularProgress size={20} sx={{
          display: 'inline-block',
          maxWidth: '50px',
          width: '50px',
          verticalAlign: 'middle',
        }} />
      : <Typography component="span" sx={{display: 'inline-block', textDecoration: 'underline'}}>{ imageSize }</Typography>
  }</InfoText>
}


export default function Dashboard({ ddUIToast, openUrl, connect, sessionStore }: DashboardProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const sessions = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot)
  const exampleRunInputRef = useRef<HTMLInputElement>(null)
  const [started, setStarted] = useState<boolean>(false)
  const [pullStdout, dispatch] = useReducer(addPullStdout, [])
  const pullAbortController = useMemo(() => new AbortController(), [])
  const [pullFinished, setPullFinished] = useState<boolean>(false)
  const [exampleContainer, setExampleContainer] = useState<ContainerExtended | null>(null)
  const [{ proxyContainerPassword }] = useConfig()
  const [exampleContainerTag, setExampleContainerTag] = useState<ExampleContainerImageTag>(UbuntuVNCDockerImageDefaultTag)
  const ubuntuVNCDockerImage = useMemo(() => UbuntuVNCDockerImage + ':' + exampleContainerTag, [exampleContainerTag])

  useEffect(() => {
    checkIfExampleContainerExist().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    return () => {
      pullAbortController.abort(`Cancel pulling image "${ubuntuVNCDockerImage}"...`)
    }
  }, [])

  async function checkIfExampleContainerExist() {
    const dockerCli = new DockerCli()
    const exampleContainer = await getExampleContainer(dockerCli)

    if (exampleContainer) {
      const exampleContainerImageTag = exampleContainer.Config.Image.split(':')[1] as ExampleContainerImageTag

      setExampleContainerTag(exampleContainerImageTag)
      setExampleContainer(exampleContainer)

      return true
    }

    setExampleContainer(null)

    return false
  }

  async function handleRunCmdClick() {
    setLoading(true)
    setStarted(true)

    const dockerCli = new DockerCli()

    if (!await dockerCli.imageExist(ubuntuVNCDockerImage)) {
      try {
        await dockerCli.pull(ubuntuVNCDockerImage, dispatch, {
          abortSignal: pullAbortController.signal,
        })
        setPullFinished(true)
        await connectToExampleContainer(dockerCli)
      }
      catch (e: any) {
        console.error(e)

        if (ddUIToast) {
          if (e instanceof Error)
            ddUIToast.error(e.message)
          else if (isRawExecResult(e))
            ddUIToast.error(e.stderr)
          else {
            ddUIToast.error(e)
          }
        }
      }

      setLoading(false)
      setStarted(false)
    }
    else {
      await connectToExampleContainer(dockerCli)
    }
  }

  function addPullStdout(stdout: string[], data: string) {
    return [
      ...stdout,
      data,
    ]
  }

  async function runExampleContainer(dockerCli: DockerCli) {
    const execResult = await dockerCli.run(ubuntuVNCDockerImage, {
      '--detach': null,
      '--name': UbuntuVNCDockerContainerName,
      '--label': [
        `${UbuntuVNCDockerImageLabel}=""`,
      ],
    })

    if (execResult.stderr) {
      ddUIToast.error(execResult.stderr)

      return
    }

    return await getExampleContainer(dockerCli)
  }

  async function connectToExampleContainer(dockerCli: DockerCli) {
    let exampleContainer = await getExampleContainer(dockerCli)

    if (!exampleContainer) {
      exampleContainer = await runExampleContainer(dockerCli)

      if (!exampleContainer)
        return ddUIToast.error('Can\'t find the example docker container...')
    }

    setExampleContainer(exampleContainer)
    setLoading(false)

    if (exampleContainer.State.Status !== 'running')
      return ddUIToast.error('The example container is not running...')

    const exampleSessionItem = sessions.find(session => session.name === UbuntuVNCDockerSessionName)
    let exampleSession = await exampleSessionItem?.getInfo()

    if (!exampleSession) {
      exampleSession = {
        id: '',
        name: UbuntuVNCDockerSessionName,
        connection: {
          type: 'container',
          data: {
            container: exampleContainer.Name,
            port: UbuntuVNCDockerImagePort,
          },
        },
        credentials: {
          username: '',
          password: proxyContainerPassword,
        },
      }

      await sessionStore.add(exampleSession)
    }

    await connect(exampleSession)
  }

  function getExampleContainer(dockerCli: DockerCli) {
    return dockerCli.getContainerFromInspect(UbuntuVNCDockerContainerName, {throwError: false})
  }

  async function handleDeleteExampleContainerClick() {
    if (!exampleContainer) return

    setLoading(true)

    // Delete example session
    const exampleSession = await sessionStore.getSessionByName(UbuntuVNCDockerSessionName)
    if (exampleSession) {
      await sessionStore.delete(exampleSession.id)
    }

    let exampleContainerExist = await checkIfExampleContainerExist()
    if (!exampleContainerExist) return

    const dockerCli = new DockerCli()
    const execResult = await dockerCli.rm(exampleContainer.Id, {force: true})

    if (execResult.stderr)
      ddUIToast?.error(execResult.stderr)

    exampleContainerExist = await checkIfExampleContainerExist()
    if (exampleContainerExist) ddUIToast?.error(`An Unknown error appeared while tying to delete the example container`)

    setLoading(false)
  }

  async function handleStartExampleContainerClick() {
    if (!exampleContainer || exampleContainer.State.Status !== 'exited') return

    setLoading(true)

    const exampleContainerExist = await checkIfExampleContainerExist()
    if (!exampleContainerExist) return

    try {
      const dockerCli = new DockerCli()
      const execResult = await dockerCli.start(exampleContainer.Id)

      if (execResult.stderr)
        return ddUIToast?.error(execResult.stderr)

      await handleRunCmdClick()
    }
    catch (e: any) {
      console.error(e)

      if (e instanceof Error)
        ddUIToast.error(e.message)
      else if (isRawExecResult(e))
        ddUIToast.error(e.stderr)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Stack direction="column" spacing={2} alignItems="center" sx={{
      textAlign: 'center',
      height: '100%',
      overflow: 'auto',
      overflowX: 'hidden',
    }}>
      <Typography variant="h2">Start with an example docker image:</Typography>
      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{width: '100%'}}>
        <FormControl
          sx={{
            width: '100%',
            maxWidth: '600px',
          }}
        >
          <OutlinedInput
            inputRef={exampleRunInputRef}
            disabled
            value={ `docker run --name ${UbuntuVNCDockerContainerName} ${ubuntuVNCDockerImage}` }
            endAdornment={
              <InputAdornment position="end">
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    onClick={() => exampleRunInputRef.current && navigator.clipboard.writeText(exampleRunInputRef.current.value)}
                    edge="end"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            }
            sx={{
              width: '100%',
              maxWidth: '600px',
            }}
          />
          <InfoText>VNC connect Password = { proxyContainerPassword }</InfoText>
          <InfoText>Docker Container Name = ubuntu_vnc</InfoText>
          <InfoText>VNC Port = 5901</InfoText>
          <InfoTextImageSize image={ubuntuVNCDockerImage} />
          <InfoText>
            GitHub ={" "}
            <Link
              component="button"
              onClick={() => openUrl(`https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/${exampleContainerTag}`)}
            >{ubuntuVNCDockerImage}</Link>
          </InfoText>
        </FormControl>

        <ExampleContainerButton
          exampleContainer={exampleContainer}
          disabled={started || loading}
          loading={loading}
          tryExampleClick={handleRunCmdClick}
          deleteExampleClick={handleDeleteExampleContainerClick}
          startExampleClick={handleStartExampleContainerClick}
          onTagChange={tag => setExampleContainerTag(tag)}
        />

      </Stack>

      {
        started &&
        <TextStreamOutput
          title="Starting example docker container... (Please Wait)"
          isFinished={pullFinished}
          stdout={pullStdout}
        />
      }
    </Stack>
  )
}
