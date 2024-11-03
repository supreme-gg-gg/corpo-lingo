import React from 'react';
import { 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Box, 
  LinearProgress
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Compete from './Compete';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
    },
    success: {
      main: '#2ecc71',
    },
    error: {
      main: '#e74c3c',
    },
  },
});

const lingoCards = [
  { term: "Deep dive", definition: "have consistently shown results superior to those" },
  { term: "Strategic fit", definition: "between an organization's objectives, resources, and" },
  { term: "Going forward", definition: "In the future, from this point on" },
  { term: "Deep dive", definition: "In-depth analysis or examination" },
  { term: "Best practices", definition: "In-depth analysis or examination" },
];

export default function Main() {
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
            CORPORATE LINGO LEARNING GAME
          </Typography>
          <Box sx={{ width: 60, height: 4, backgroundColor: 'primary.main', margin: '0 auto', mb: 2 }} />
          
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'medium', color: '#34495e' }}>
            Master Your Corporate Lingo Today!
          </Typography>
          <Typography variant="body1" align="center" gutterBottom sx={{ color: '#7f8c8d', mb: 3 }}>
            Welcome to the ultimate game to enhance your corporate vocabulary skills!
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Button onClick={<Compete/>} variant="contained" sx={{ borderRadius: 50, px: 3 }}>
              COMPETE WITH OTHERS!
            </Button>
            <Button variant="contained" sx={{ borderRadius: 50, px: 3 }}>
              APPLIED SCENARIOS!
            </Button>
          </Box>
          
          <LinearProgress variant="determinate" value={20} sx={{ mb: 3, height: 10, borderRadius: 5 }} />
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {lingoCards.map((card, index) => (
              <Grid item xs={12/5} key={`term-${index}`}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: index === 2 ? 'success.main' : index === 3 ? 'error.main' : 'background.paper'
                  }}
                >
                  <CardContent>
                    <Typography variant="body2" align="center">
                      {card.term}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {lingoCards.map((card, index) => (
              <Grid item xs={12/5} key={`def-${index}`}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: index === 2 ? 'success.light' : index === 3 ? 'error.light' : 'background.paper'
                  }}
                >
                  <CardContent>
                    <Typography variant="body2" align="center">
                      {card.definition}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" sx={{ borderRadius: 50, px: 3 }}>
              RESET CARDS
            </Button>
          </Box>
        </Card>
      </Box>
    </ThemeProvider>
  );
}