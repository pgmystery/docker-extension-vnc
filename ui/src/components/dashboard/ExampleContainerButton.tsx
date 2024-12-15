import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import { ContainerExtended } from '../../types/docker/cli/inspect'


interface ExampleContainerButtonProps {
  exampleContainer: ContainerExtended | null
  tryExampleClick: ()=>void
  deleteExampleClick: ()=>void
  startExampleClick: ()=>void
  disabled?: boolean
}


export default function ExampleContainerButton({
  exampleContainer,
  tryExampleClick,
  deleteExampleClick,
  startExampleClick,
  disabled,
}: ExampleContainerButtonProps) {
  if (exampleContainer) {
    if (exampleContainer.State.Status === 'exited') {
      return (
        <Button
          variant="outlined"
          sx={{height: '55px'}}
          endIcon={<SendIcon />}
          color="warning"
          onClick={startExampleClick}
          disabled={disabled}
        >Start example container</Button>
      )
    }
    else {
      return (
        <Button
          variant="outlined"
          sx={{height: '55px'}}
          endIcon={<DeleteIcon />}
          color="error"
          onClick={deleteExampleClick}
          disabled={disabled}
        >Delete example container</Button>
      )
    }
  }

  return (
    <Button
      variant="outlined"
      sx={{height: '55px'}}
      endIcon={<SendIcon />}
      color="success"
      onClick={tryExampleClick}
      disabled={disabled}
    >Try example container</Button>
  )
}
