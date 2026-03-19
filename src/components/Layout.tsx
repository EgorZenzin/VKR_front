import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Главная', path: '/' },
    { label: 'Сравнение', path: '/compare' },
    { label: 'История', path: '/history' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Комбинаторная оптимизация
          </Typography>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              onClick={() => navigate(item.path)}
              sx={{ ml: 1 }}
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
