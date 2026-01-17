import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  WorkOutline as WorkIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/users/${user.id}`);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Carregando...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography color="text.secondary">Dados não disponíveis</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ pb: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Meu Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualize suas informações profissionais
          </Typography>
        </Box>

        {/* Profile Card */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1E293B 0%, #334155 100%)'
                    : 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                color: 'white',
              }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  mb: 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  fontSize: '3rem',
                  fontWeight: 700,
                }}
              >
                {userData.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {userData.name}
              </Typography>
              <Chip
                label={userData.role === 'admin' ? 'Administrador' : 'Agente Comercial'}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  mb: 2,
                }}
              />
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
              <Box display="flex" justifyContent="space-around" mt={3}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {userData.time_in_company}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Meses
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {userData.active_base}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Base Ativa
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={700} mb={3}>
                Informações Profissionais
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Nome Completo"
                    secondary={userData.name}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ fontSize: '1rem', color: 'text.primary' }}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={userData.email}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ fontSize: '1rem', color: 'text.primary' }}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <WorkIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Cargo"
                    secondary={
                      <Chip
                        label={userData.role === 'admin' ? 'Administrador' : 'Agente Comercial'}
                        size="small"
                        color={userData.role === 'admin' ? 'primary' : 'default'}
                        sx={{ mt: 0.5 }}
                      />
                    }
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Nível de Carreira"
                    secondary={
                      <Chip
                        label={userData.career_level}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ mt: 0.5, fontWeight: 600 }}
                      />
                    }
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <MoneyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Salário Base"
                    secondary={`R$ ${userData.base_salary.toFixed(2)}`}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ fontSize: '1rem', color: 'text.primary', fontWeight: 700 }}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <BadgeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Base Ativa"
                    secondary={`${userData.active_base} clientes`}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ fontSize: '1rem', color: 'text.primary' }}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tempo na Empresa"
                    secondary={`${userData.time_in_company} meses`}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                    secondaryTypographyProps={{ fontSize: '1rem', color: 'text.primary' }}
                  />
                </ListItem>
              </List>
            </Paper>

            {userData.role === 'agent' && (
              <Paper sx={{ p: 3, mt: 3, backgroundColor: 'info.main', color: 'white' }}>
                <Typography variant="body2" fontWeight={600}>
                  💡 Dica: Para editar suas informações, entre em contato com o administrador.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
