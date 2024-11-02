import { createTheme } from '@mui/material/styles';

const draculaColors = {
  background: '#282a36',
  currentLine: '#44475a',
  foreground: '#f8f8f2',
  comment: '#6272a4',
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c',
};

export const draculaTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: draculaColors.background,
      paper: draculaColors.background,
    },
    text: {
      primary: draculaColors.foreground,
      secondary: draculaColors.comment,
    },
    primary: {
      main: draculaColors.purple,
      contrastText: draculaColors.foreground,
    },
    secondary: {
      main: draculaColors.pink,
      contrastText: draculaColors.foreground,
    },
    error: {
      main: draculaColors.red,
    },
    warning: {
      main: draculaColors.orange,
    },
    info: {
      main: draculaColors.cyan,
    },
    success: {
      main: draculaColors.green,
    },
    divider: draculaColors.currentLine,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: draculaColors.currentLine,
          '&:hover': {
            backgroundColor: draculaColors.comment,
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(98, 114, 164, 0.1)',
          },
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
}); 