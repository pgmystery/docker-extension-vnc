import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import Button from '@mui/material/Button'
import { DialogProps } from '@toolpad/core'


interface SessionDialogDeleteProps {
  sessionName: string
}


export default function SessionDialogDelete({ open, onClose, payload }: DialogProps<SessionDialogDeleteProps, boolean>) {
  const { sessionName } = payload

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
    >
      <DialogTitle>
        Do you really want to delete the selected session?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Do you really want to delete the season: "{sessionName}"?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} autoFocus>Cancel</Button>
        <Button onClick={() => onClose(true)} color="error">
          Delete Session
        </Button>
      </DialogActions>
    </Dialog>
  )
}
