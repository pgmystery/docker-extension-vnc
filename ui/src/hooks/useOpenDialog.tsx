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
  const backdrop = useBackdrop({
    sx: { zIndex: 9999 },
  })

  function showOpenDialog(dialogProps: DialogProperties = {}) {
    return backdrop.open(() => ddClient.desktopUI.dialog.showOpenDialog({
      ...dialogProperties,
      ...dialogProps,
    }))
  }

  return useMemo(() => ({
    showOpenDialog,
    isOpenDialogShowing: backdrop.isOpen,
  }), [dialogProperties, backdrop.isOpen])
}
