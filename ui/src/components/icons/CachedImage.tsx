import { useEffect, useState } from 'react'
import { Box, BoxProps } from '@mui/material'


const imageCache: { [key: string]: string } = {}

interface UseCachedImageResult {
  currentSrc: string
  isLoading: boolean
}

export interface CachedImageData {
  title: string
  src: string
  skeleton: string
}


function useCachedImage(image: CachedImageData): UseCachedImageResult {
  const { src: imageSrc, skeleton: skeletonSrc } = image
  const [currentSrc, setCurrentSrc] = useState<string>(
    imageCache[imageSrc] || skeletonSrc
  )
  const [isLoading, setIsLoading] = useState<boolean>(!imageCache[imageSrc])

  useEffect(() => {
    if (imageCache[imageSrc]) {
      setCurrentSrc(imageCache[imageSrc])
      setIsLoading(false)

      return
    }

    const loadImage = async () => {
      try {
        const response = await fetch(imageSrc)
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)

        imageCache[imageSrc] = objectUrl
        setCurrentSrc(objectUrl)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading image:', error)
        setIsLoading(false)
      }
    }

    loadImage()

    return () => {
      if (imageCache[imageSrc] && imageCache[imageSrc].startsWith('blob:')) {
        URL.revokeObjectURL(imageCache[imageSrc])
        delete imageCache[imageSrc]
      }
    }
  }, [imageSrc, skeletonSrc])

  return { currentSrc, isLoading }
}

interface CachedImageProps extends BoxProps {
  image: CachedImageData
}


export default function CachedImage({ image, ...props }: CachedImageProps) {
  const { currentSrc, isLoading } = useCachedImage(image)

  return (
    <Box
      component="img"
      src={currentSrc}
      alt={image.title}
      sx={{
        ...props.sx,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoading ? 0.5 : 1,
      }}
      { ...props }
    />
  )
}
