import { useDialogs } from '@toolpad/core'
import { useCallback } from 'react'
import ImagePullDialog from '../components/dialogs/ImagePullDialog'


export default function useImagePullDialog() {
  const dialogs = useDialogs()

  return useCallback((dockerImage: string) => dialogs.open(ImagePullDialog, {image: dockerImage}), [dialogs])
}
