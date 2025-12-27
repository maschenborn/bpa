import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Navigation from './Navigation';

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({ children, title }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation title={title} />
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          width: '100%',
          py: 3,
          flexGrow: 1,
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
