import React, { useContext, useRef, useState, useSyncExternalStore } from 'react'
import {
  Container,
  Paper,
  Box,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Tooltip,
  Typography,
  Chip,
  Button
} from '@mui/material'
import Grid from '@mui/material/Grid2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DockerCli from '../../libs/docker/DockerCli'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import { SessionStore } from '../../stores/sessionStore'
import ExampleContainerButton from './ExampleContainerButton'
import InfoRow from './InfoRow'
import useExampleContainer, { VNCExampleSessionName } from '../../hooks/useExampleContainer'
import { VNCContext } from '../../contexts/VNCContext'
import GitHubIcon from '@mui/icons-material/GitHub'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import DockerIcon from '../icons/DockerIcon'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import MicIcon from '@mui/icons-material/Mic'
import eventBus from '../../libs/EventBus'


interface ExampleContainerDashboardProps {
  exampleContainer: ContainerExtended
  checkExampleContainerExist: () => Promise<ContainerExtended | undefined>
  sessionStore: SessionStore
}


export default function ExampleContainerDashboard({
  exampleContainer,
  checkExampleContainerExist,
  sessionStore,
}: ExampleContainerDashboardProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const exampleRunInputRef = useRef<HTMLInputElement>(null)
  const sessions = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot)
  const vncHandler = useContext(VNCContext)
  const { connectToExampleContainer, removeExampleSession, exampleContainerTemplate } = useExampleContainer(vncHandler)

  async function handleDeleteExampleContainerClick() {
    setLoading(true)

    let exampleContainer = await checkExampleContainerExist()

    if (!exampleContainer)
      return

    await removeExampleSession()

    const dockerCli = new DockerCli()
    const execResult = await dockerCli.rm(exampleContainer.Id, { force: true })

    if (execResult.stderr)
      eventBus.emit('showError', execResult.stderr)

    exampleContainer = await checkExampleContainerExist()
    if (exampleContainer) {
      eventBus.emit('showError', `Failed to delete the example container. Please delete it manually.`)
      setLoading(false)
    }
  }

  async function handleStartExampleContainerClick() {
    setLoading(true)

    const exampleContainer = await checkExampleContainerExist()

    if (!exampleContainer)
      return

    const exampleSessionItem = sessions.find(session => session.name === VNCExampleSessionName)

    if (exampleSessionItem) {
      if (!vncHandler) {
        setLoading(false)

        return eventBus.emit('showError', 'VNCHandler is not initialized')
      }

      const exampleSession = await exampleSessionItem.getInfo()
      return vncHandler?.connect(exampleSession)
    }

    if (!exampleContainerTemplate) {
      setLoading(false)

      return eventBus.emit('showError', 'Example container template is not initialized')
    }

    return await connectToExampleContainer({
      port: exampleContainerTemplate.vncPort,
      credentials: exampleContainerTemplate.credentials,
    })
  }

  return (
    <Container fixed maxWidth={false} sx={{ paddingBottom: '10px' }}>
      <Typography variant="h1" sx={{ marginBottom: '20px' }}>Current active Template</Typography>

      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{width: '100%', marginBottom: '20px'}}>
        <FormControl sx={{flexGrow: 1, margin: 0}}>
          <Typography variant="subtitle2" gutterBottom>Docker Inspect Command</Typography>
          <OutlinedInput
            inputRef={exampleRunInputRef}
            disabled
            value={`docker inspect ${exampleContainer.Id}`}
            endAdornment={
              <InputAdornment position="end">
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    onClick={() =>
                      exampleRunInputRef.current &&
                      navigator.clipboard.writeText(`docker inspect ${exampleContainer.Id}`)
                    }
                    edge="end"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            }
            sx={{ fontFamily: 'monospace', fontSize: '0.875rem', height: '55px' }}
          />
        </FormControl>

        <Box sx={{ marginTop: 'auto' }}>
          <ExampleContainerButton
            disabled={loading}
            loading={loading}
            deleteExampleClick={handleDeleteExampleContainerClick}
            startExampleClick={handleStartExampleContainerClick}
          />
        </Box>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header Section with Icon and Title */}
          <Stack direction="row">
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {exampleContainerTemplate?.IconComponent && (
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'action.selected' }}>
                  <exampleContainerTemplate.IconComponent sx={{ fontSize: 40 }} />
                </Box>
              )}
              <Stack spacing={1}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h4">
                    {exampleContainerTemplate?.title || exampleContainer.Name.replace('/', '')}
                  </Typography>
                  <Chip
                    label={exampleContainer.State.Status.toUpperCase()}
                    color={exampleContainer.State.Status === 'running' ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body1" color="text.secondary">
                  {exampleContainerTemplate?.description || "Container running from docker-extension-vnc"}
                </Typography>
                {exampleContainerTemplate?.chips && (
                  <Stack direction="row" spacing={1}>
                    {exampleContainerTemplate.chips.map((c) => (<Chip key={c} label={c} size="small" />))}
                  </Stack>
                )}
                <Stack direction="row" spacing={1} alignItems="center">
                  {exampleContainerTemplate?.hasAudioOutput && <Tooltip title="This image has audio over vnc-viewer extension"><VolumeUpIcon /></Tooltip>}
                  {exampleContainerTemplate?.hasAudioInput && <Tooltip title="This image support audio inputs like microphones over vnc-viewer extension"><MicIcon /></Tooltip>}
                </Stack>
              </Stack>
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" alignItems="center" spacing={1} sx={{ marginBottom: 'auto' }}>
              {exampleContainerTemplate?.github && (
                <Button
                  startIcon={<GitHubIcon />}
                  variant="outlined"
                  color="inherit"
                  onClick={() => eventBus.emit('openUrl', exampleContainerTemplate.github as string)}
                  endIcon={<OpenInNewIcon />}
                >
                  GitHub
                </Button>
              )}
              {exampleContainerTemplate?.image && (
                <Button
                  startIcon={<DockerIcon fill="currentColor" />}
                  variant="outlined"
                  color="inherit"
                  onClick={() => eventBus.emit('openUrl', `https://hub.docker.com/r/${exampleContainerTemplate.image}`)}
                  endIcon={<OpenInNewIcon />}
                >
                  DockerHub
                </Button>
              )}
            </Stack>
          </Stack>

          <Divider />

          {/* Connection Information */}
          <Box>
            <Typography variant="h3" gutterBottom>Connection Details</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={1}>
                  <InfoRow k="VNC Port" v={exampleContainerTemplate?.vncPort?.toString() || "5901"} />
                  <InfoRow k="Container Name" v={exampleContainer.Name.replace('/', '')} />
                  {exampleContainerTemplate?.credentials?.username && (
                    <InfoRow k="Username" v={exampleContainerTemplate.credentials.username} />
                  )}
                  <InfoRow k="Password" v={exampleContainerTemplate?.credentials?.password || "PASSWORD"} />
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Docker Information */}
          <Box>
            <Typography variant="h3" gutterBottom>Container Details</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={1}>
                  <InfoRow k="Image" v={exampleContainer.Config.Image} />
                  <InfoRow k="Platform" v={exampleContainer.Platform} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={1}>
                  <InfoRow k="Container ID" v={exampleContainer.Id.substring(0, 12)} />
                  <InfoRow k="Created" v={new Date(exampleContainer.Created).toLocaleString()} />
          </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Paper>
    </Container>
  )
}
