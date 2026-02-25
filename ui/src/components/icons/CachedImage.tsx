import { useEffect, useState } from 'react'
import { Box, BoxProps } from '@mui/material'


const imageCache: { [key: string]: string } = {}

interface UseCachedImageResult {
  currentSrc: string
  isLoading: boolean
}

export interface CachedImageData {
  title: string
  skeleton: string
  src?: string
}


function useCachedImage(image: CachedImageData): UseCachedImageResult {
  const { title, src: imageSrc, skeleton: skeletonSrc } = image
  const [currentSrc, setCurrentSrc] = useState<string>(
    imageCache[title] || skeletonSrc
  )
  const [isLoading, setIsLoading] = useState<boolean>(!imageCache[title] && !!imageSrc)

  useEffect(() => {
    if (imageCache[title]) {
      setCurrentSrc(imageCache[title])
      setIsLoading(false)

      return
    }

    const loadImage = async (imageSrc: string) => {
      try {
        const response = await fetch(imageSrc)

        if (!response.ok)
          return

        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)

        imageCache[imageSrc] = objectUrl
        setCurrentSrc(objectUrl)
      }
      catch (error) {
        console.error('Error loading image:', error)
      }
      finally {
        setIsLoading(false)
      }
    }

    if (imageSrc)
      loadImage(imageSrc)

    return () => {
      if (imageCache[title] && imageCache[title].startsWith('blob:')) {
        URL.revokeObjectURL(imageCache[title])
        delete imageCache[title]
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
      { ...props }
      component="img"
      src={currentSrc}
      alt={image.title}
      sx={{
        ...props.sx,
        opacity: isLoading ? 0.5 : 1,
        borderRadius: '16px',
        userSelect: 'none',
        WebkitUserDrag: 'none',
        pointerEvents: 'none',
      }}
    />
  )
}
