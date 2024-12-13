import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from 'react'
import { FormControl, IconButton, InputAdornment, OutlinedInput, Stack, Tooltip, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SendIcon from '@mui/icons-material/Send'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import TextStreamOutput from '../utils/TextStreamOutput'
import { Toast } from '@docker/extension-api-client-types/dist/v1'
import { isRawExecResult } from '../../libs/docker/cli/Exec'
import DockerCli from '../../libs/docker/DockerCli'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import useConfig from '../../hooks/useConfig'
import { Session } from '../../types/session'
import { SessionStore } from '../../stores/sessionStore'


interface DashboardProps {
  ddUIToast: Toast
  connect: (session: Session)=>void
  sessionStore: SessionStore
}

const UbuntuVNCDockerSessionName = 'example vnc container'
const UbuntuVNCDockerContainerName = 'ubuntu_vnc'
const UbuntuVNCDockerImage = 'pgmystery/ubuntu_vnc:latest'
const UbuntuVNCDockerImageLabel = 'pgmystery.vnc.extension.example'
const UbuntuVNCDockerImagePort = 5901


export default function Dashboard({ ddUIToast, connect, sessionStore }: DashboardProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const sessions = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot)
  const exampleRunInputRef = useRef<HTMLInputElement>(null)
  const [started, setStarted] = useState<boolean>(false)
  const [pullStdout, dispatch] = useReducer(addPullStdout, [])
  const [pullFinished, setPullFinished] = useState<boolean>(false)
  const [exampleContainer, setExampleContainer] = useState<ContainerExtended | null>(null)
  const [{ proxyContainerPassword }] = useConfig()

  useEffect(() => {
    checkIfExampleContainerExist()
  }, [])

  async function checkIfExampleContainerExist() {
    const dockerCli = new DockerCli()
    const exampleContainer = await getExampleContainer(dockerCli)
    setLoading(false)

    if (exampleContainer) {
      setExampleContainer(exampleContainer)

      return true
    }

    setExampleContainer(null)

    return false
  }

  async function handleRunCmdClick() {
    setStarted(true)

    const dockerCli = new DockerCli()

    if (!await dockerCli.imageExist(UbuntuVNCDockerImage)) {
      const onPullFinished = (exitCode: number) => {
        setPullFinished(true)

        if (exitCode === 0) {
          connectToExampleContainer(dockerCli)
        }
      }

      try {
        dockerCli.pull(UbuntuVNCDockerImage, dispatch, onPullFinished)
      }
      catch (e: any) {
        console.error(e)

        if (ddUIToast) {
          if (e instanceof Error)
            ddUIToast.error(e.message)
          else if (isRawExecResult(e))
            ddUIToast.error(e.stderr)
        }
      }
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
    const execResult = await dockerCli.run(UbuntuVNCDockerImage, {
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

    connect(exampleSession)
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
    setLoading(true)

    const dockerCli = new DockerCli()
    const execResult = await dockerCli.rm(exampleContainer.Id, {force: true})

    if (execResult.stderr)
      ddUIToast?.error(execResult.stderr)

    exampleContainerExist = await checkIfExampleContainerExist()
    if (exampleContainerExist) ddUIToast?.error(`An Unknown error appeared while tying to delete the example container`)

    setLoading(false)
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
            value={ `docker run --name ${UbuntuVNCDockerContainerName} ${UbuntuVNCDockerImage}` }
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
          <Typography sx={{
            textAlign: 'left',
            marginLeft: '14px',
            marginRight: '14px',
          }}>VNC connect Password = { proxyContainerPassword }</Typography>
          <Typography sx={{
            textAlign: 'left',
            marginLeft: '14px',
            marginRight: '14px',
          }}>Docker Container Name = ubuntu_vnc</Typography>
          <Typography sx={{
            textAlign: 'left',
            marginLeft: '14px',
            marginRight: '14px',
          }}>VNC Port = 5901</Typography>
        </FormControl>
        {
          exampleContainer
            ? <Button
                variant="outlined"
                sx={{height: '55px'}}
                endIcon={<DeleteIcon />}
                color="error"
                onClick={handleDeleteExampleContainerClick}
                disabled={started || loading}
              >Delete example container</Button>
            : <Button
                variant="outlined"
                sx={{height: '55px'}}
                endIcon={<SendIcon />}
                color="success"
                onClick={handleRunCmdClick}
                disabled={started || loading}
              >Try example container</Button>
        }
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
