import { AppBar, AppBarProps, useGetIdentity } from 'react-admin'
import { Box, Button, Typography } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'

export const CustomAppBar = (props: AppBarProps) => {
  const { data: identity, isLoading } = useGetIdentity()

  return (
    <AppBar {...props}>
      <Box flex="1" />

      {/* User Info */}
      {!isLoading && identity && (
        <Box display="flex" alignItems="center" marginRight={2}>
          <Typography variant="body2" color="inherit" sx={{ marginRight: 1 }}>
            Welcome, {identity.fullName || identity.username || 'Admin'}
          </Typography>
        </Box>
      )}

      <Button
        color="inherit"
        href="/"
        startIcon={<HomeIcon />}
        sx={{
          marginRight: 2,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        Back to Main Site
      </Button>
    </AppBar>
  )
}