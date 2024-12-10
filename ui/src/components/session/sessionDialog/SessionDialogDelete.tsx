import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import Button from '@mui/material/Button'


interface SessionDialogDeleteProps {
  sessionName: string
  open: boolean
  onClose: ()=>void
  onDelete: ()=>void
}


export default function SessionDialogDelete({ sessionName, open, onDelete, onClose }: SessionDialogDeleteProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Button onClick={onClose} autoFocus>Cancel</Button>
        <Button onClick={onDelete} color="error">
          Delete Session
        </Button>
      </DialogActions>
    </Dialog>
  )
}
