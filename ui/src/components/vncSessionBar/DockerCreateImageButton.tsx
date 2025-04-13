import {
  Accordion, AccordionDetails, AccordionSummary,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Divider, FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Stack, TextField,
  Tooltip, Typography
} from '@mui/material'
import DockerIcon from '../icons/DockerIcon'
import { DialogProps, useDialogs } from '@toolpad/core'
import Button from '@mui/material/Button'
import { FormEvent, useContext, useEffect, useMemo, useState } from 'react'
import SessionName from '../session/forms/components/SessionName'
import SessionDialogCredentials from '../session/sessionDialog/SessionDialogCredentials'
import DockerImageOptions from '../session/sessionDialog/connections/dockerImage/DockerImageOptions'
import { serializeSessionFormData } from '../session/forms/SessionDataForm'
import { VNCContext } from '../../contexts/VNCContext'
import { SessionCreateData } from '../../types/session'
import DockerCommitDialog from '../dialogs/DockerCommitDialog'
import { getSessionStore } from '../../stores/sessionStore'
import { isRawExecResult } from '../../libs/docker/cli/Exec'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { VNCCredentials } from '../VNCView/VNCView'


interface DockerCreateImageDialogData {
  repositoryFull: string
  newSessionData?: SessionCreateData
}

interface DockerCreateImageButtonProps {
  disabled?: boolean
}

interface DockerCreateImageDialogProps {
  port: number
  credentials?: VNCCredentials
  runOptions: DockerImageRunOptions
}

interface DockerImageRunOptions {
  containerRunOptions?: string
  containerRunArgs?: string
}


export default function DockerCreateImageButton({ disabled }: DockerCreateImageButtonProps) {
  const ddClient = useMemo(createDockerDesktopClient, [])
  const vnc = useContext(VNCContext)
  const dialogs = useDialogs()
  const sessionStore = getSessionStore()

  async function handleClick() {
    if (!sessionStore)
      return

    const connectionData = vnc?.vnc.connection?.data
    if (!connectionData || !connectionData.container)
      return

    const runOptions: {
      containerRunOptions?: string
      containerRunArgs?: string
    } = {}

    if (vnc?.connectedData?.sessionName) {
      const currentSession = await sessionStore.getSessionByName(vnc?.connectedData?.sessionName)

      if (currentSession?.connection.type === 'image') {
        runOptions.containerRunOptions = currentSession.connection.data.containerRunOptions
        runOptions.containerRunArgs = currentSession.connection.data.containerRunArgs
      }
    }

    const createImageData = await dialogs.open(DockerCreateImageDialog, {
      port: vnc?.connectedData?.connection.data.port,
      runOptions,
      credentials: vnc?.connectedData?.credentials,
    })
    if (!createImageData)
      return

    const commitResult = await dialogs.open(DockerCommitDialog, {
      containerId: connectionData.container,
      repository: createImageData.repositoryFull,
      dockerClient: ddClient.docker
    })

    if (commitResult.state === 0) {
      try {
        if (createImageData.newSessionData) {
          await sessionStore.add(createImageData.newSessionData)
        }
      }
      catch (e: any) {
        console.error(e)

        if (e instanceof Object && e.hasOwnProperty('message'))
          ddClient.desktopUI.toast.error(e.message)
        else if (isRawExecResult(e))
          ddClient.desktopUI.toast.error(e.stderr)
        else {
          ddClient.desktopUI.toast.error(e)
        }
      }
    }
    else {
      const e = commitResult.out
      console.error(e)

      if (e instanceof Object && e.hasOwnProperty('message'))
        ddClient.desktopUI.toast.error(e.message)
      else if (isRawExecResult(e))
        ddClient.desktopUI.toast.error(e.stderr)
      else {
        ddClient.desktopUI.toast.error(e)
      }
    }
  }

  return (
    <Tooltip title="Create a Docker Image from the Container" arrow>
      <IconButton disabled={disabled} onClick={handleClick} >
        <DockerIcon fill="currentColor" />
      </IconButton>
    </Tooltip>
  )
}


function DockerCreateImageDialog({ open, onClose, payload }: DialogProps<DockerCreateImageDialogProps, null | DockerCreateImageDialogData>) {
  const { port, credentials, runOptions } = payload
  const [repository, setRepository] = useState<string>('')
  const [tag, setTag] = useState<string>('latest')
  const [shouldCreateSession, setShouldCreateSession] = useState<boolean>(false)
  const [accordionExpanded, setAccordionExpanded] = useState<boolean>(false)
  const [sessionName, setSessionName] = useState<string>('')

  useEffect(() => {
    setAccordionExpanded(shouldCreateSession)
  }, [shouldCreateSession])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data: DockerCreateImageDialogData = {
      repositoryFull: `${repository}:${tag || 'latest'}`,
    }

    if (shouldCreateSession) {
      const formData = new FormData(event.currentTarget)
      formData.set('connection.type', 'image')

      data.newSessionData = serializeSessionFormData(formData)
    }

    onClose(data)
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose(null)}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
        }
      }}
    >
      <DialogTitle>Create Docker Image from the current Session</DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={1}>
          <FormGroup sx={{width: '100%'}}>
            <FormLabel>New Docker Image</FormLabel>
            <Stack spacing={1} direction="row">
              <TextField
                label="Repository"
                required
                autoFocus
                value={repository}
                onChange={e => setRepository(e.target.value)}
                name="connection.data.image"
                sx={{
                  width: '100%',
                }}
              />
              <Typography fontSize="2rem">:</Typography>
              <TextField
                label="Tag"
                value={tag}
                onChange={e => setTag(e.target.value)}
                name="connection.data.imageTag"
                sx={{
                  width: '100%',
                }}
              />
            </Stack>
          </FormGroup>
          <Divider />
          <FormGroup>
            <Stack spacing={1}>
              <FormControlLabel control={<Checkbox
                name="credentials"
                checked={shouldCreateSession}
                onChange={e => setShouldCreateSession(e.target.checked)}
                slotProps={{
                  input: { 'aria-label': 'controlled' },
                }}
              />} label="Create a new Session" />
              <Accordion disabled={!shouldCreateSession} expanded={accordionExpanded}>
                <AccordionSummary>
                  <Typography component="span">New Session for the Docker Image</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    <SessionName
                      name={sessionName}
                      setName={setSessionName}
                      required={shouldCreateSession}
                    />
                    <Divider />
                    <DockerImageOptions required={shouldCreateSession} connectionData={{
                      port,
                      containerRunOptions: runOptions.containerRunOptions || '',
                      containerRunArgs: runOptions.containerRunArgs || '',
                      deleteContainerAfterDisconnect: true,
                    }} />
                    <Divider />
                    <SessionDialogCredentials
                      credentials={
                        credentials && {
                          username: credentials?.username || '',
                          password: credentials?.password || '',
                        }
                      }
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </FormGroup>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button variant="outlined" onClick={() => onClose(null)} >Cancel</Button>
        <Button
          color="success"
          disabled={repository === '' || (shouldCreateSession && sessionName === '')}
          type="submit"
        >Create Docker Image</Button>
      </DialogActions>
    </Dialog>
  )
}
