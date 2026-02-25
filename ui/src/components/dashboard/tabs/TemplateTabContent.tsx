import Grid from '@mui/material/Grid2'
import {
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import MicIcon from '@mui/icons-material/Mic'
import CachedImage from '../../icons/CachedImage'
import KvmAlert from '../utils/KvmAlert'
import eventBus from '../../../libs/EventBus'
import useExampleContainer from '../../../hooks/useExampleContainer'
import React, { useContext, useEffect, useState } from 'react'
import { Template, TemplateCategory, TemplateData } from '../templates/template'
import { VNCContext } from '../../../contexts/VNCContext'
import { ContainerExtended } from '../../../types/docker/cli/inspect'
import TemplateInfoPanel, { TemplateRunData } from '../utils/TemplateInfoPanel'


interface TemplateTabContentProps {
  category: TemplateCategory
  checkExampleContainerExist: ()=>Promise<ContainerExtended | undefined>
}


export default function TemplateTabContent({ category, checkExampleContainerExist }: TemplateTabContentProps) {
  const vncHandler = useContext(VNCContext)
  const [loading, setLoading] = useState<boolean>(false)
  const { runExampleContainer, connectToExampleContainer } = useExampleContainer(vncHandler)

  const [selected, setSelected] = useState<TemplateData>(() => {
    const first = category.templates.entries().next().value as [string, Template] | undefined
    if (!first) {
      throw new Error(`Category "${category.id}" has no templates`)
    }
    const [templateId, firstTemplate] = first
    return { ...firstTemplate, id: templateId }
  })

  useEffect(() => {
    const first = category.templates.entries().next().value as [string, Template] | undefined
    if (!first) return

    const [templateId, firstTemplate] = first
    setSelected({
      ...firstTemplate,
      id: templateId,
    })
  }, [category])

  function handleCardChange(id: string, t: Template) {
    setSelected({ ...t, id })
  }

  async function handleClickStart(templateRunData: TemplateRunData) {
    const { credentials, tag, extraFlags, containerRunArgs, vncHostPort } = templateRunData

    setLoading(true)

    try {
      await runExampleContainer({
        templateId: selected.id,
        image: selected.image,
        tag: tag || selected.defaultTag || "latest",
        options: extraFlags,
        args: containerRunArgs,
        port: vncHostPort,
      })
      await connectToExampleContainer({
        port: vncHostPort,
        credentials,
      })
      await checkExampleContainerExist()
    }
    catch (e: any) {
      if ('message' in e)
        await eventBus.emit('showError', e.message)

      setLoading(false)
    }
  }

  return (
    <>
      {/* Template Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[...category.templates].map(([id, t]) => (
          <Grid key={id} size={{ xs: 12, md: 3, sm: 6 }}>
            <Card
              variant={selected.id === id ? "elevation" : "outlined"}
              sx={{
                height: "100%",
                boxShadow: selected.id === id ? theme => theme.palette.mode === 'dark' ? "0 0 10px rgba(25, 198, 181, 0.5)" : "0 0 10px rgb(3 62 56 / 50%)" : "none",
                backgroundColor: selected.id === id ? (theme) => alpha("#19c6b5", theme.palette.mode === 'dark' ? 0.08 : 0.04) : "inherit",
                transition: "all 0.2s ease-in-out",
                '&:hover': {
                  borderColor: selected.id === id ? "#19c6b5" : "#19c6b588",
                  boxShadow: selected.id === id ? "0 0 12px rgba(25, 198, 181, 0.6)" : "0 0 8px rgba(25, 198, 181, 0.2)",
                }
              }}
            >
              <CardActionArea sx={{height: '100%'}} onClick={() => handleCardChange(id, t)}>
                <CardContent sx={{height: '100%'}}>
                  <Stack spacing={1} alignItems="flex-start">
                    <Stack direction="row" spacing={1} alignItems="center" width="100%">
                      <t.IconComponent />
                      <Typography variant="subtitle1" fontWeight={700}>{t.title}</Typography>
                      <Box flex={1} />
                      {t.hasAudioOutput && <Tooltip title="This image has audio over vnc-viewer extension"><VolumeUpIcon /></Tooltip>}
                      {t.hasAudioInput && <Tooltip title="This image support audio inputs like microphones over vnc-viewer extension"><MicIcon /></Tooltip>}
                    </Stack>
                    <Typography variant="body2">{t.description}</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {t.chips?.map((c) => (<Chip key={c} label={c} />))}
                    </Stack>
                    {t.skeleton &&
                      <CachedImage
                        image={t.skeleton}
                        sx={{
                          maxWidth: '14rem',
                        }}
                      />
                    }
                    <KvmAlert show={t.requireKvm} />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Command + Info Panel */}
      <TemplateInfoPanel
        selected={selected}
        loading={loading}
        onRun={handleClickStart}
      />
    </>
  )
}
