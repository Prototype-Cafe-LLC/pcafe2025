import { AppBar, AppBarProps } from 'react-admin'
import { Box, Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'

export const CustomAppBar = (props: AppBarProps) => {
  return (
    <AppBar {...props}>
      <Box flex="1" />
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