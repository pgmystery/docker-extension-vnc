import {
  Accordion, AccordionDetails, AccordionSummary,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import eventBus from '../../../libs/EventBus'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import DockerIcon from '../../icons/DockerIcon'
import RunTemplateButton from '../RunTemplateButton'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Grid from '@mui/material/Grid2'
import DockerImageSearchTagInput from '../../inputs/docker/DockerImageSearchTagInput'
import InfoIcon from '@mui/icons-material/Info'
import InputPassword from '../../inputs/InputPassword'
import InfoRow from '../InfoRow'
import useExampleContainer, { VNCExampleContainerName } from '../../../hooks/useExampleContainer'
import InfoTextImageSize from '../InfoTextImageSize'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Template, TemplateData } from '../templates/template'
import { filesize } from 'filesize'
import { VNCContext } from '../../../contexts/VNCContext'
import DockerHubApi from '../../../libs/dockerHub/DockerHubApi'

interface ImageMetadata {
  size: string;
  digest: string;
}


export interface TemplateRunData {
  tag: string;
  vncHostPort: number;
  extraFlags: string;
  containerRunArgs: string;
  credentials: { username: string; password: string };
}


interface DockerImageInfoProps {
  onRun: (templateRunData: TemplateRunData) => void
  selected: TemplateData
  loading: boolean
}


function buildDockerRunCommand(t: Template, opts: {
  tag: string;
  containerName: string;
  extraFlags: string;
  containerRunArgs: string;
}) {
  const tag = opts.tag || t.defaultTag || "latest";
  const parts: string[] = [
    "docker run",
    `--name ${opts.containerName}`,
  ].filter(Boolean);

  // Extra ports
  if (t.extraPorts) {
    for (const p of t.extraPorts) parts.push(`-p ${p.host}:${p.container}`);
  }

  // Env vars
  if (t.env) {
    for (const e of t.env) parts.push(`-e ${e.key}=${e.value}`);
  }

  if (opts.extraFlags) parts.push(opts.extraFlags);

  parts.push(`${t.image}:${tag}`);

  if (opts.containerRunArgs) parts.push(opts.containerRunArgs)

  return parts.join(" ");
}


export default function TemplateInfoPanel({ selected, loading, onRun }: DockerImageInfoProps) {
  const vncHandler = useContext(VNCContext)
  const { removeExampleSession } = useExampleContainer(vncHandler)
  const dockerHubApi = useMemo(() => new DockerHubApi(), [])
  const pullAbortController = useMemo(() => new AbortController(), [])

  // advanced options
  const [tag, setTag] = useState(selected.defaultTag || "latest");
  const [vncHostPort, setVncHostPort] = useState(selected.vncPort)
  const [extraFlags, setExtraFlags] = useState<string>(selected.extraFlags?.join(" ") || "")
  const [containerRunArgs, setContainerRunArgs] = useState<string>("")
  const [username, setUsername] = useState<string>(selected.credentials?.username || "")
  const [password, setPassword] = useState<string>(selected.credentials?.password || "")

  const [isImageTagValid, setIsImageTagValid] = useState<boolean>(false)

  const [imageMetadata, setImageMetadata] = useState<Record<string, ImageMetadata>>({})

  useEffect(() => {
    removeExampleSession()

    return () => {
      pullAbortController.abort(`Cancel pulling image "${selected.image}:${tag || selected.defaultTag || "latest"}"...`)
    }
  }, [])

  useEffect(() => {
    const image = selected.image
    if (!image) return

    const fullImageName = `${image}:${tag || selected.defaultTag || "latest"}`
    if (fullImageName in imageMetadata) return

    const dockerRepo = dockerHubApi.repository(image)
    dockerRepo.getTag(tag)
      .then(imageInfo => {
        setImageMetadata(prev => ({
          ...prev,
          [fullImageName]: {
            size: filesize(imageInfo.full_size, { standard: 'jedec' }),
            digest: imageInfo.digest,
          }
        }))
      })
      .catch(_ => {})
  }, [dockerHubApi, selected.image, selected.defaultTag, tag, imageMetadata])

  useEffect(() => {
    setTag(selected.defaultTag || "latest");
    setVncHostPort(selected.vncPort);
    setExtraFlags("");
    setContainerRunArgs("");
    setUsername(selected.credentials?.username || "");
    setPassword(selected.credentials?.password || "");
  }, [selected])

  const cmd = useMemo(
    () => buildDockerRunCommand(selected, {
      tag,
      containerName: VNCExampleContainerName,
      extraFlags,
      containerRunArgs,
    }),
    [selected, tag, extraFlags, containerRunArgs]
  )

  useEffect(() => {
    setExtraFlags(selected.extraFlags?.join(" ") || "")
  }, [selected])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch { }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" flex="0 0 auto">docker run command</Typography>
          <Chip size="small" label={selected.image + ":" + (tag || selected.defaultTag || "latest")} />

          <Box flex={1} />

          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" justifyContent="end">
            {selected.github && (
              <Button
                startIcon={<GitHubIcon />}
                variant="outlined"
                color="inherit"
                onClick={() => eventBus.emit('openUrl', selected.github as string)}
                endIcon={<OpenInNewIcon />}
              >
                GitHub
              </Button>
            )}
            <Button
              startIcon={<DockerIcon fill="currentColor" />}
              variant="outlined"
              color="inherit"
              onClick={() => eventBus.emit('openUrl', `https://hub.docker.com/r/${selected.image}`)}
              endIcon={<OpenInNewIcon />}
            >
              DockerHub
            </Button>
            <RunTemplateButton
              onClickStart={() => onRun({
                tag,
                vncHostPort,
                extraFlags,
                containerRunArgs,
                credentials: { username, password },
              })}
              disabled={!isImageTagValid}
              loading={loading}
              isOfficialImage={selected.isOfficial}
              image={`${selected.image}:${selected.defaultTag}`}
              digestSha={imageMetadata[`${selected.image}:${selected.defaultTag}`]?.digest}
            >
              {selected.title}
            </RunTemplateButton>
          </Stack>
        </Stack>
        <TextField
          value={cmd}
          fullWidth
          variant="filled"
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                fontFamily: "monospace",
                '& input': {
                  paddingBottom: '13px',
                  paddingTop: '13px',
                },
              },
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      sx={{
                        marginRight: 0,
                      }}
                      onClick={() => copy(cmd)}
                      edge="end"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            },
          }}
        />

        {/* Advanced Options */}
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography component="span">Advanced options</Typography>
          </AccordionSummary>
          <AccordionDetails>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <DockerImageSearchTagInput
                  repository={selected.image}
                  tag={tag}
                  setTag={setTag}
                  onTagIsValidChange={setIsImageTagValid}
                  readonly={selected.isOfficial}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField label="Host VNC port" type="number" value={vncHostPort} onChange={(e) => setVncHostPort(parseInt(e.target.value || "0", 10))} fullWidth />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">Extra Docker Run Options</Typography>
                <TextField
                  label="Extra Docker Container Run [OPTIONS]"
                  name="connection.data.containerRunOptions"
                  placeholder="e.g. -e VNC_NO_PASSWORD=1 -v $(pwd):/workspace"
                  value={extraFlags}
                  onChange={e => setExtraFlags(e.target.value)}
                  sx={{
                    width: '100%',
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Docker Run Options" arrow>
                            <IconButton
                              size="small"
                              onClick={() => eventBus.emit('openUrl', 'https://docs.docker.com/reference/cli/docker/container/run/#options')}
                              sx={{
                                marginLeft: 'auto',
                              }}
                            >
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="Docker Container Run [COMMAND] [ARG...]"
                  name="connection.data.containerRunArgs"
                  placeholder="e.g. bash"
                  value={containerRunArgs}
                  onChange={e => setContainerRunArgs(e.target.value)}
                  sx={{
                    width: '100%',
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Docker Run command with Args" arrow>
                            <IconButton
                              size="small"
                              onClick={() => eventBus.emit('openUrl', 'https://docs.docker.com/engine/containers/run/#commands-and-arguments')}
                              sx={{
                                marginLeft: 'auto',
                              }}
                            >
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">Credentials</Typography>
                <TextField
                  name="credentials.username"
                  label="Username"
                  fullWidth
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
                <InputPassword
                  name="credentials.password"
                  label="Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </Grid>
            </Grid>

          </AccordionDetails>
        </Accordion>

        {/* Info Row */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <InfoRow k="Docker Container Name" v={VNCExampleContainerName} />
                <InfoRow k="VNC Port" v={`${selected.vncPort}`} />
                {
                  selected.credentials?.username
                  && <InfoRow k="VNC connect Username" v={selected.credentials.username} />
                }
                {
                  selected.credentials?.password
                  && <InfoRow k="VNC connect Password" v={selected.credentials.password} />
                }
                <InfoTextImageSize
                  imageSize={imageMetadata[`${selected.image}:${tag || selected.defaultTag || "latest"}`]?.size}
                />
              </Stack>
            </Grid>
          </Grid>

          <Box flex={1} />

        </Stack>

      </Stack>
    </Paper>
  )
}
