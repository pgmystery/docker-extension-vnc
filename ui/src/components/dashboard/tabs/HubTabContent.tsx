import Grid from '@mui/material/Grid2'
import {
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import MicIcon from '@mui/icons-material/Mic'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import StarIcon from '@mui/icons-material/Star'
import UpdateIcon from '@mui/icons-material/Update'
import React, { useEffect, useMemo, useState } from 'react'
import TemplateInfoPanel, { TemplateRunData } from '../utils/TemplateInfoPanel'
import DockerIcon from '../../icons/DockerIcon'
import CachedImage, { CachedImageData } from '../../icons/CachedImage'
import { TemplateData } from '../templates/template'

export interface HubImage {
  id: string
  title: string
  image: string
  description: string
  vncPort: number
  defaultTag?: string
  credentials?: {
    username: string
    password: string
  }
  chips?: string[]
  isOfficial?: boolean
  hasAudioOutput?: boolean
  hasAudioInput?: boolean
  requireKvm?: boolean
  extraPorts?: Array<{ host: number; container: number; label?: string }>
  env?: Array<{ key: string; value: string }>
  extraFlags?: string[]
  skeleton?: CachedImageData
  pulls?: number
  stars?: number
  lastUpdated?: string
  installed?: boolean
}

export interface HubSortOption {
  value: string
  label: string
}

interface HubTabContentProps {
  images?: HubImage[]
  loading?: boolean
  sortValue?: string
  sortOptions?: HubSortOption[]
  onSortChange?: (value: string) => void
  page?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  onRun?: (image: HubImage, templateRunData: TemplateRunData) => void
}

const numberFormatter = new Intl.NumberFormat()

export default function HubTabContent({
  images = [],
  loading = false,
  sortValue,
  sortOptions = [],
  onSortChange,
  page = 1,
  pageCount = 1,
  onPageChange,
  onRun,
}: HubTabContentProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(() => images[0]?.id)

  useEffect(() => {
    if (!images.length) {
      setSelectedId(undefined)
      return
    }

    if (selectedId && images.some(image => image.id === selectedId)) return

    setSelectedId(images[0].id)
  }, [images, selectedId])

  const selectedImage = useMemo(
    () => images.find(image => image.id === selectedId),
    [images, selectedId]
  )

  const templateData = useMemo<TemplateData | undefined>(() => {
    if (!selectedImage) return

    return {
      id: selectedImage.id,
      title: selectedImage.title,
      categoryId: 'hub',
      image: selectedImage.image,
      defaultTag: selectedImage.defaultTag,
      description: selectedImage.description,
      vncPort: selectedImage.vncPort,
      credentials: selectedImage.credentials,
      chips: selectedImage.chips,
      IconComponent: DockerIcon,
      extraPorts: selectedImage.extraPorts,
      env: selectedImage.env,
      skeleton: selectedImage.skeleton,
      isOfficial: selectedImage.isOfficial,
      hasAudioOutput: selectedImage.hasAudioOutput,
      hasAudioInput: selectedImage.hasAudioInput,
      requireKvm: selectedImage.requireKvm,
      extraFlags: selectedImage.extraFlags,
    }
  }, [selectedImage])

  const installedImages = images.filter(image => image.installed)
  const marketplaceImages = images.filter(image => !image.installed)

  const formatUpdated = (value?: string) => {
    if (!value) return undefined
    const date = new Date(value)
    if (Number.isNaN(date.valueOf())) return value
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const renderCard = (image: HubImage) => (
    <Grid key={image.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
      <Card
        variant={selectedId === image.id ? 'elevation' : 'outlined'}
        sx={{
          height: '100%',
          boxShadow: selectedId === image.id
            ? theme => theme.palette.mode === 'dark'
              ? '0 0 10px rgba(25, 198, 181, 0.5)'
              : '0 0 10px rgb(3 62 56 / 50%)'
            : 'none',
          backgroundColor: selectedId === image.id
            ? theme => alpha('#19c6b5', theme.palette.mode === 'dark' ? 0.08 : 0.04)
            : 'inherit',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: selectedId === image.id ? '#19c6b5' : '#19c6b588',
            boxShadow: selectedId === image.id
              ? '0 0 12px rgba(25, 198, 181, 0.6)'
              : '0 0 8px rgba(25, 198, 181, 0.2)',
          },
        }}
      >
        <CardActionArea sx={{ height: '100%' }} onClick={() => setSelectedId(image.id)}>
          <CardContent sx={{ height: '100%' }}>
            <Stack spacing={1} alignItems="flex-start">
              <Stack direction="row" spacing={1} alignItems="center" width="100%">
                <DockerIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight={700}>
                  {image.title}
                </Typography>
                <Box flex={1} />
                {image.hasAudioOutput && (
                  <Tooltip title="Audio output supported">
                    <VolumeUpIcon />
                  </Tooltip>
                )}
                {image.hasAudioInput && (
                  <Tooltip title="Audio input supported">
                    <MicIcon />
                  </Tooltip>
                )}
              </Stack>

              <Typography variant="body2">{image.description}</Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {image.installed && <Chip size="small" color="success" label="Installed" />}
                {image.isOfficial && <Chip size="small" label="Official" />}
                {image.chips?.map(c => (
                  <Chip key={c} size="small" label={c} />
                ))}
              </Stack>

              {image.skeleton && (
                <CachedImage
                  image={image.skeleton}
                  sx={{
                    maxWidth: '14rem',
                  }}
                />
              )}

              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                {typeof image.pulls === 'number' && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CloudDownloadIcon fontSize="small" />
                    <Typography variant="caption">
                      {numberFormatter.format(image.pulls)}
                    </Typography>
                  </Stack>
                )}
                {typeof image.stars === 'number' && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <StarIcon fontSize="small" />
                    <Typography variant="caption">
                      {numberFormatter.format(image.stars)}
                    </Typography>
                  </Stack>
                )}
                {image.lastUpdated && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <UpdateIcon fontSize="small" />
                    <Typography variant="caption">{formatUpdated(image.lastUpdated)}</Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Docker Hub Marketplace</Typography>
        <Box flex={1} />
        {sortOptions.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="hub-sort-label">Sort</InputLabel>
            <Select
              labelId="hub-sort-label"
              value={sortValue ?? sortOptions[0]?.value ?? ''}
              label="Sort"
              onChange={(event) => onSortChange?.(event.target.value)}
            >
              {sortOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      {!images.length && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          No Docker Hub images available.
        </Typography>
      )}

      {installedImages.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Installed Images
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {installedImages.map(renderCard)}
          </Grid>
        </>
      )}

      {marketplaceImages.length > 0 && (
        <>
          {installedImages.length > 0 && (
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Marketplace
            </Typography>
          )}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {marketplaceImages.map(renderCard)}
          </Grid>
        </>
      )}

      {pageCount > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mb: 3 }}>
          <Pagination
            page={page}
            count={pageCount}
            onChange={(_, value) => onPageChange?.(value)}
          />
        </Stack>
      )}

      {templateData && (
        <TemplateInfoPanel
          selected={templateData}
          loading={loading}
          onRun={(runData) => {
            if (selectedImage) onRun?.(selectedImage, runData)
          }}
        />
      )}
    </>
  )
}
