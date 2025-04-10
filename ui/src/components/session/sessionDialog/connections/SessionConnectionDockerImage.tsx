import { FormGroup, Stack, Typography } from '@mui/material'
import DockerImageSearchInput from '../../../inputs/docker/DockerImageSearchInput'
import DockerImageSearchTagInput from '../../../inputs/docker/DockerImageSearchTagInput'
import React, { useEffect, useState } from 'react'
import { serializeConnectionData } from '../../forms/SessionDataForm'
import { ConnectionDataDockerImage } from '../../../../libs/vnc/connectionTypes/VNCDockerImage'
import DockerImageOptions, { serializeConnectionDataDockerImageOptions } from './dockerImage/DockerImageOptions'


interface DockerImageProps {
  connectionData?: ConnectionDataDockerImage
  setSubmitReady: (state: boolean)=>void
}

interface ConnectionDataDockerImageImage {
  image: string
  imageTag: string
}


export function serializeConnectionDataDockerImage(formData: FormData): ConnectionDataDockerImage {
  function setData(connectionData: Partial<ConnectionDataDockerImageImage>, key: string, value: FormDataEntryValue) {
    switch (key) {
      case 'image':
        connectionData.image = value as string

        if (!('imageTag' in connectionData))
          connectionData.imageTag = 'latest'

        break
      case 'imageTag':
        value === ''
          ? connectionData.imageTag = 'latest'
          : connectionData.imageTag = value as string

        break
    }

    return connectionData
  }

  return {
    ...serializeConnectionData(formData, setData),
    ...serializeConnectionDataDockerImageOptions(formData),
  }
}


export default function SessionConnectionDockerImage({ connectionData, setSubmitReady }: DockerImageProps) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(connectionData?.image || undefined)
  const [imageTag, setImageTag] = useState<string>(connectionData?.imageTag || '')
  const [isImageTagValid, setIsImageTagValid] = useState<boolean>(connectionData?.imageTag !== '')

  useEffect(() => {
    setSubmitReady(selectedImage != '' && isImageTagValid)
  }, [selectedImage, isImageTagValid])

  return (
    <FormGroup>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          <DockerImageSearchInput
            setSelectedImage={setSelectedImage}
            initSelectedImage={selectedImage}
          />
          <Typography fontSize="2rem">:</Typography>
          <DockerImageSearchTagInput
            repository={selectedImage}
            tag={imageTag}
            setTag={setImageTag}
            onTagIsValidChange={setIsImageTagValid}
          />
        </Stack>
        <DockerImageOptions connectionData={connectionData} />
      </Stack>
    </FormGroup>
  )
}
