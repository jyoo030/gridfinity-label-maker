import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Container, CssBaseline, Paper, IconButton, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { draculaTheme, lightTheme } from './theme';
import LabelMaker from './components/LabelMaker';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? draculaTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: 4,
      }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'flex-end',
        }}>
          <IconButton 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            color="inherit"
            sx={{ ml: 1 }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 3 }}>
            <LabelMaker />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
