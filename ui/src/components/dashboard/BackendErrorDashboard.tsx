import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

export default function BackendErrorDashboard() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      textAlign="center"
      padding={3}
    >
      <Stack spacing={3} alignItems="center">
        <WarningIcon sx={{ fontSize: 80, color: 'error.main' }} />

        <Box>
          <Typography variant="h2" gutterBottom fontWeight="bold">
            Backend Required
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This application needs the backend service to be running.
            Please ensure the backend is started and try again.
          </Typography>
        </Box>

        <Button
          color="primary"
          size="large"
          onClick={handleRefresh}
        >
          Refresh Page
        </Button>
      </Stack>
    </Box>
  );
}
