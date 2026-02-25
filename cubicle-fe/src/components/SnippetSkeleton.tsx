import React from 'react'
import { Box, Skeleton } from '@mui/material'

export const SnippetSkeleton: React.FC = () => (
  <Box sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', mb: 3, overflow: 'hidden' }}>
    <Box sx={{ p: '16px 20px 12px', display: 'flex', alignItems: 'center' }}>
      <Skeleton variant="circular" width={46} height={46} sx={{ mr: 2 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="20%" height={20} />
        <Skeleton variant="text" width="40%" height={16} />
      </Box>
    </Box>
    <Box sx={{ px: '20px', pb: '16px' }}>
      <Skeleton variant="text" width="50%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" height={20} />
      <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" width="100%" height={200} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, pt: 1, borderTop: '1px solid #e8e8e8' }}>
        <Skeleton variant="rounded" width={80} height={36} />
        <Skeleton variant="rounded" width={80} height={36} />
      </Box>
    </Box>
  </Box>
)