import React from 'react';
import { 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Box
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
    },
  },
});

export default function Compete() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: '#f0f0f0' 
      }}>
        <Card sx={{ maxWidth: 800, width: '100%', p: 4, boxShadow: 3 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            CORPORATE LINGO COMPETITION
          </Typography>
          <Box sx={{ width: 60, height: 4, backgroundColor: 'primary.main', margin: '0 auto', mb: 4 }} />
          
          <Typography variant="h5" align="left" gutterBottom sx={{ fontWeight: 'medium', color: '#34495e', mb: 2 }}>
            Competition Time!
          </Typography>
          
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: 50, 
              px: 3, 
              mb: 3, 
              backgroundColor: '#3498db',
              '&:hover': {
                backgroundColor: '#2980b9',
              },
            }}
          >
            Find an Opponent!
          </Button>
          
          <Typography variant="body1" paragraph sx={{ color: '#7f8c8d', mb: 3 }}>
            Welcome to our interactive two-player word matcher! Challenge a friend to a battle of speed and professionalism in
            this exciting game where players race against each other to match corporate lingo with their respective definition.
            Test your workplace vocabulary and quick thinking as you compete to see who can find the most word pairs the
            fastest.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              sx={{ 
                borderRadius: 50, 
                px: 3,
                backgroundColor: '#3498db',
                '&:hover': {
                  backgroundColor: '#2980b9',
                },
              }}
            >
              BACK TO PRACTICE
            </Button>
          </Box>
        </Card>
      </Box>
    </ThemeProvider>
  );
}