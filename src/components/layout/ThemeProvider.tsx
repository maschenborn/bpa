import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import theme from '../../theme/theme';

interface Props {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: Props) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
