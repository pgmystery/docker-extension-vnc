import { DialogProps } from '@toolpad/core'
import { FormEvent, useEffect, useState } from 'react'
import { serializeSessionFormData } from '../session/forms/SessionDataForm'
import {
  Accordion, AccordionDetails, AccordionSummary,
  Checkbox,
  Dialog, DialogActions,
  DialogContent,
  DialogTitle,
  Divider, FormControlLabel,
  FormGroup,
  FormLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import SessionName from '../session/forms/components/SessionName'
import DockerImageOptions from '../session/sessionDialog/connections/dockerImage/DockerImageOptions'
import SessionDialogCredentials from '../session/sessionDialog/SessionDialogCredentials'
import Button from '@mui/material/Button'
import { VNCCredentials } from '../VNCView/VNCView'
import { SessionCreateData } from '../../types/session'


interface DockerCreateImageDialogProps {
  port: number
  credentials?: VNCCredentials
  runOptions: DockerImageRunOptions
}

interface DockerCreateImageDialogData {
  repositoryFull: string
  newSessionData?: SessionCreateData
}

interface DockerImageRunOptions {
  containerRunOptions?: string
  containerRunArgs?: string
}


export default function DockerCreateImageDialog({ open, onClose, payload }: DialogProps<DockerCreateImageDialogProps, null | DockerCreateImageDialogData>) {
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
