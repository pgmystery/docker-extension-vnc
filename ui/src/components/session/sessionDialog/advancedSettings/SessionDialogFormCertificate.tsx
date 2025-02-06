import { FormControl, FormGroup, FormLabel, Stack } from '@mui/material'
import PathField from '../../../utils/PathField'


export default function SessionDialogFormCertificate() {
  return (
    <FormControl>
      <FormLabel>Certificate</FormLabel>
      <FormGroup>
        <Stack spacing={1}>
          <PathField
            type="file"
            label="Certificate file path"
            inputDisabled
            openDialogFilters={[{
              name: '*.pem',
              extensions: ['*.pem'],
            }]}
          />
          <PathField
            type="file"
            label="Certificate key file path"
            inputDisabled
          />
        </Stack>
      </FormGroup>
    </FormControl>
  )
}
