import useBackdrop from './useBackdrops/useBackdrop'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { useMemo } from 'react'


interface DialogProperties {
  title?: string
  message?: string
  defaultPath?: string
  buttonLabel?: string
  securityScopedBookmarks?: boolean
  filters?: {
    name: string
    extensions: string[]
  }[]
  properties?: DialogPropertiesProperties[]
}

type DialogPropertiesProperties =
  'openFile' |
  'openDirectory' |
  'multiSelections' |
  'showHiddenFiles' |
  'createDirectory' |
  'promptToCreate' |
  'noResolveAliases' |
  'treatPackageAsDirectory' |
  'dontAddToRecent'

export default function useOpenDialog(dialogProperties: DialogProperties = {}) {
  const ddClient = createDockerDesktopClient()
  const { showBackdrop, isBackdropShowing } = useBackdrop({
    sx: { zIndex: 9999 },
  })

  function showOpenDialog(dialogProps: DialogProperties = {}) {
    return showBackdrop(async () => ddClient.desktopUI.dialog.showOpenDialog({
      ...dialogProperties,
      ...dialogProps,
    }))
  }

  return useMemo(() => ({
    showOpenDialog,
    isOpenDialogShowing: isBackdropShowing,
  }), [dialogProperties, isBackdropShowing])
}
