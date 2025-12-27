import { createTheme } from '@mui/material/styles';

// MUI default blue
const primaryBlue = '#1976d2';
const primaryBlueLight = '#42a5f5';
const primaryBlueDark = '#1565c0';

const theme = createTheme({
  palette: {
    primary: {
      main: primaryBlue,
      light: primaryBlueLight,
      dark: primaryBlueDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2c3e50',
      light: '#4a6278',
      dark: '#1a252f',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    success: {
      main: '#2e7d32',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // No uppercase
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          width: '100%',
        },
      },
    },
  },
});

export default theme;
