import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import LoadingButton from '@mui/lab/LoadingButton'
import SelectButton from '../utils/SelectButton/SelectButton'
import SelectButtonItem from '../utils/SelectButton/SelectButtonItem'
import { SelectChangeEvent } from '@mui/material'


interface ExampleContainerButtonProps {
  exampleContainer: ContainerExtended | null
  tryExampleClick: ()=>void
  deleteExampleClick: ()=>void
  startExampleClick: ()=>void
  disabled?: boolean
  loading: boolean
  onTagChange?: (tag: string)=>void
}


export default function ExampleContainerButton({
  exampleContainer,
  tryExampleClick,
  deleteExampleClick,
  startExampleClick,
  disabled,
  loading,
  onTagChange,
}: ExampleContainerButtonProps) {

  function handleSelectButtonChange(event: SelectChangeEvent) {
    onTagChange?.(event.target.value)
  }

  if (exampleContainer) {
    if (exampleContainer.State.Status === 'exited') {
      return (
        <LoadingButton
          variant="outlined"
          sx={{height: '55px'}}
          endIcon={<SendIcon />}
          color="warning"
          onClick={startExampleClick}
          disabled={disabled}
          loading={loading}
          loadingPosition="end"
        >Start example container</LoadingButton>
      )
    }
    else {
      return (
        <LoadingButton
          variant="outlined"
          sx={{height: '55px'}}
          endIcon={<DeleteIcon />}
          color="error"
          onClick={deleteExampleClick}
          disabled={disabled}
          loading={loading}
          loadingPosition="end"
        >Delete example container</LoadingButton>
      )
    }
  }

  return (
    <SelectButton
      variant="outlined"
      color="success"
      sx={{height: '55px'}}
      disabled={disabled || loading}
      onChange={handleSelectButtonChange}
    >
      <SelectButtonItem
        value="xfce"
        onTrigger={tryExampleClick}
      >Try example container (xfce)</SelectButtonItem>
      <SelectButtonItem
        value="cinnamon"
        onTrigger={tryExampleClick}
      >Try example container (cinnamon)</SelectButtonItem>
      <SelectButtonItem
        value="mate"
        onTrigger={tryExampleClick}
      >Try example container (mate)</SelectButtonItem>
      <SelectButtonItem
        value="kde-plasma"
        onTrigger={tryExampleClick}
      >Try example container (kde-plasma)</SelectButtonItem>
      <SelectButtonItem
        value="xterm"
        onTrigger={tryExampleClick}
      >Try example container (xterm)</SelectButtonItem>
    </SelectButton>
  )
}
