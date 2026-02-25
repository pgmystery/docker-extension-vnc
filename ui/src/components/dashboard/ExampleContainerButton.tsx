import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import SelectButton from '../utils/SelectButton/SelectButton'
import SelectButtonItem from '../utils/SelectButton/SelectButtonItem'


interface ExampleContainerButtonProps {
  deleteExampleClick: ()=>void
  startExampleClick: ()=>void
  disabled?: boolean
  loading?: boolean
}


export default function ExampleContainerButton({
  deleteExampleClick,
  startExampleClick,
  disabled,
  loading,
}: ExampleContainerButtonProps) {
  return (
    <SelectButton
      variant="outlined"
      color="success"
      sx={{height: '55px'}}
      disabled={disabled || loading}
      loading={loading}
    >
      <SelectButtonItem
        value="run"
        onTrigger={startExampleClick}
        color="success"
        endIcon={<SendIcon />}
      >Connect to template container</SelectButtonItem>
      <SelectButtonItem
        value="cinnamon"
        onTrigger={deleteExampleClick}
        color="error"
        endIcon={<DeleteIcon />}
      >Delete template container</SelectButtonItem>
    </SelectButton>
  )
}
