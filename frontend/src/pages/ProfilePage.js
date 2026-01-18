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
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  WorkOutline as WorkIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [careerLevels, setCareerLevels] = useState([]);
  const [nextLevel, setNextLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchCareerLevels();
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

  const fetchCareerLevels = async () => {
    try {
      const response = await api.get('/career-levels');
      setCareerLevels(response.data || []);
    } catch (error) {
      console.error('Error fetching career levels:', error);
    }
  };

  // Hook: Auto-check e sugere próximo nível de carreira
  useEffect(() => {
    if (userData && careerLevels.length > 0) {
      checkCareerProgression();
    }
  }, [userData, careerLevels]);

  const checkCareerProgression = () => {
    const currentLevelIndex = careerLevels.findIndex(
      (l) => l.level === userData?.career_level
    );
    
    if (currentLevelIndex === -1 || currentLevelIndex >= careerLevels.length - 1) {
      setNextLevel(null);
      return;
    }

    const next = careerLevels[currentLevelIndex + 1];
    const tpvProgress = userData.tpv_carteira 
      ? Math.min((userData.tpv_carteira / next.tpv_min) * 100, 100)
      : 0;
    const timeProgress = userData.time_in_company 
      ? Math.min((userData.time_in_company / next.time_min) * 100, 100)
      : 0;

    setNextLevel({
      ...next,
      tpvProgress,
      timeProgress,
      eligible: tpvProgress >= 100 && timeProgress >= 100,
    });

    // Auto-notifica se elegível
    if (tpvProgress >= 100 && timeProgress >= 100 && next.level !== userData?.career_level) {
      toast.success(`🎉 Parabéns! Você está elegível para ${next.level}!`, {
        duration: 5000,
      });
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

            {/* Próximo Nível de Carreira */}
            {nextLevel && userData.role !== 'admin' && (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TrophyIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Próximo Nível: {nextLevel.level}
                  </Typography>
                  {nextLevel.eligible && (
                    <Chip label="Elegível!" color="success" size="small" />
                  )}
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      TPV Carteira
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {nextLevel.tpvProgress.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={nextLevel.tpvProgress}
                    color={nextLevel.tpvProgress >= 100 ? 'success' : 'primary'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Meta: R$ {nextLevel.tpv_min?.toLocaleString('pt-BR')}
                  </Typography>
                </Box>

                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Tempo na Empresa
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {nextLevel.timeProgress.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={nextLevel.timeProgress}
                    color={nextLevel.timeProgress >= 100 ? 'success' : 'primary'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Meta: {nextLevel.time_min} meses
                  </Typography>
                </Box>

                {nextLevel.eligible && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    🎉 Você atingiu os requisitos! Solicite sua promoção ao gestor.
                  </Alert>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
