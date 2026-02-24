import React from 'react'
import { Box, Container, Divider, Paper, Skeleton, Stack } from '@mui/material'
import Grid from '@mui/material/Grid'

export const ProfilePageSkeleton: React.FC = () => (
  <Container maxWidth="lg" sx={{ pt: 12 }}>
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: 'center',
            bgcolor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width="40%" height={24} sx={{ mx: 'auto', mb: 3 }} />

          <Skeleton variant="rounded" width="100%" height={70} sx={{ mb: 4, borderRadius: 3 }} />
          <Skeleton variant="rounded" width="100%" height={45} sx={{ mb: 4, borderRadius: 3 }} />

          <Divider sx={{ my: 4 }} />
          <Box textAlign="left">
            <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Skeleton variant="rounded" width="100%" height={64} sx={{ mb: 3, borderRadius: 4 }} />
        <Stack spacing={3}>
          {[1, 2].map((i) => (
            <Box key={i} sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
              <Box sx={{ p: '16px 20px 12px', display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="circular" width={46} height={46} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="20%" height={20} />
                  <Skeleton variant="text" width="30%" height={16} />
                </Box>
              </Box>
              <Box sx={{ px: '20px', pb: '16px' }}>
                <Skeleton variant="text" width="50%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} />
                <Skeleton variant="rounded" width="100%" height={150} sx={{ mt: 2, borderRadius: 2 }} />
              </Box>
            </Box>
          ))}
        </Stack>
      </Grid>
    </Grid>
  </Container>
)