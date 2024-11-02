import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, CssBaseline, Paper } from '@mui/material';
import LabelMaker from './components/LabelMaker';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <LabelMaker />
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
