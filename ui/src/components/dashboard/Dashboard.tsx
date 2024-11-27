import { useEffect, useReducer, useRef, useState } from 'react'
import { FormControl, IconButton, InputAdornment, OutlinedInput, Stack, Tooltip, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SendIcon from '@mui/icons-material/Send'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import TextStreamOutput from '../utils/TextStreamOutput'
import { Toast } from '@docker/extension-api-client-types/dist/v1'
import { isRawExecResult } from '../../libs/docker/cli/Exec'
import DockerCli from '../../libs/docker/DockerCli'
import { Container } from '../../types/docker/extension'


interface DashboardProps {
  ddUIToast?: Toast
  connect: (containerId: string, targetPort: number)=>void
}

const UbuntuVNCDockerImage = 'pgmystery/ubuntu_vnc:latest'
const UbuntuVNCDockerImageLabel = 'pgmystery.vnc.extension.example'
const UbuntuVNCDockerImagePort = 5901


export default function Dashboard({ ddUIToast, connect }: DashboardProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const exampleRunInputRef = useRef<HTMLInputElement>(null)
  const [started, setStarted] = useState<boolean>(false)
  const [pullStdout, dispatch] = useReducer(addPullStdout, [])
  const [pullFinished, setPullFinished] = useState<boolean>(false)
  const [exampleContainer, setExampleContainer] = useState<Container | null>(null)

  useEffect(() => {
    checkIfExampleContainerExist()
  }, [])

  async function checkIfExampleContainerExist() {
    const dockerCli = new DockerCli()
    const exampleContainer = await getExampleContainer(dockerCli)
    setLoading(false)

    if (exampleContainer)
      return setExampleContainer(exampleContainer)

    setExampleContainer(null)
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
      '--name': 'ubuntu_vnc',
      '--label': `${UbuntuVNCDockerImageLabel}=""`
    })

    if (execResult.stderr) {
      ddUIToast?.error(execResult.stderr)

      return
    }

    return await getExampleContainer(dockerCli)
  }

  async function connectToExampleContainer(dockerCli: DockerCli) {
    let exampleContainer = await getExampleContainer(dockerCli)

    if (!exampleContainer) {
      exampleContainer = await runExampleContainer(dockerCli)

      if (!exampleContainer)
        return ddUIToast?.error('Can\'t find the example docker container...')
    }

    setExampleContainer(exampleContainer)

    if (exampleContainer.State !== 'running')
      return ddUIToast?.error('The example container is not running...')

    connect(exampleContainer.Id, UbuntuVNCDockerImagePort)
  }

  function getExampleContainer(dockerCli: DockerCli) {
    return dockerCli.getContainer({
      label: [UbuntuVNCDockerImageLabel],
    })
  }

  async function handleDeleteExampleContainerClick() {
    if (!exampleContainer) return

    setLoading(true)

    const dockerCli = new DockerCli()
    const execResult = await dockerCli.rm(exampleContainer.Id, {force: true})

    if (execResult.stderr)
      return ddUIToast?.error(execResult.stderr)

    await checkIfExampleContainerExist()
  }

  return (
    <Stack direction="column" spacing={2} alignItems="center" sx={{textAlign: 'center', height: '100%', overflow: 'auto'}}>
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
            value={ `docker run --name ubuntu_vnc ${UbuntuVNCDockerImage}` }
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
          }}>vnc connect password = foobar</Typography>
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
