import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCardMUI } from '@/components/MetricCardMUI';
import { KPIRadarChart } from '@/components/KPIRadarChart';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  TrendingUp,
  AttachMoney,
  EmojiEvents,
  Refresh,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  ShowChart as ChartIcon,
  AccountBalance as AccountIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import api from '@/utils/api';
import { calculateKPIMetrics, formatCurrency } from '@/utils/helpers';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export default function DashboardPageV2() {
  const { user } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const response = await api.get(`/dashboard/${user.id}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  if (!dashboardData?.kpi) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography color="text.secondary">Dados não disponíveis</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const { metrics, totalAtingimento } = calculateKPIMetrics(dashboardData.kpi);

  const getStatusConfig = () => {
    if (totalAtingimento >= 100) {
      return {
        label: 'Meta Atingida!',
        color: 'success',
        icon: <EmojiEvents />,
        message: 'Parabéns! Você superou as expectativas.',
      };
    } else if (totalAtingimento >= 80) {
      return {
        label: 'Quase lá!',
        color: 'warning',
        icon: <TrendingUp />,
        message: 'Falta pouco para atingir a meta.',
      };
    } else {
      return {
        label: 'Precisa Melhorar',
        color: 'error',
        icon: <TrendingUp />,
        message: 'Continue trabalhando para melhorar os resultados.',
      };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <DashboardLayout>
      <Box sx={{ pb: 4 }}>
        {/* Header com Toggle de Tema */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Olá, {user?.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Acompanhe seu desempenho e metas em tempo real
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Atualizar dados" arrow>
              <IconButton onClick={fetchDashboard} disabled={refreshing} color="primary">
                <Refresh className={refreshing ? 'animate-spin' : ''} />
              </IconButton>
            </Tooltip>
            <Tooltip title={`Modo ${mode === 'dark' ? 'claro' : 'escuro'}`} arrow>
              <IconButton onClick={toggleTheme} color="primary">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Fade in timeout={300}>
              <MotionPaper
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                elevation={0}
                sx={{
                  p: 3,
                  borderLeft: 4,
                  borderLeftColor: statusConfig.color + '.main',
                  backgroundColor: 'background.paper',
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
                      Atingimento Total
                    </Typography>
                    <Typography variant="h3" fontWeight={800} color={statusConfig.color + '.main'}>
                      {totalAtingimento.toFixed(1)}%
                    </Typography>
                    <Chip
                      label={statusConfig.label}
                      color={statusConfig.color}
                      size="small"
                      sx={{ mt: 1, fontWeight: 600 }}
                    />
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: statusConfig.color + '.main',
                      color: 'white',
                    }}
                  >
                    {statusConfig.icon}
                  </Box>
                </Box>
              </MotionPaper>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in timeout={400}>
              <MotionPaper
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                elevation={0}
                sx={{
                  p: 3,
                  borderLeft: 4,
                  borderLeftColor: 'info.main',
                  backgroundColor: 'background.paper',
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
                      Nível de Carreira
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {user?.career_level}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Continue crescendo!
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'info.main',
                      color: 'white',
                    }}
                  >
                    <TrendingUp />
                  </Box>
                </Box>
              </MotionPaper>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in timeout={500}>
              <MotionPaper
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                elevation={0}
                sx={{
                  p: 3,
                  borderLeft: 4,
                  borderLeftColor: 'warning.main',
                  backgroundColor: 'background.paper',
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
                      Bônus Estimado
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {dashboardData.bonus
                        ? formatCurrency(dashboardData.bonus.bonus_final)
                        : 'R$ 0,00'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Baseado no atingimento
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'warning.main',
                      color: 'white',
                    }}
                  >
                    <AttachMoney />
                  </Box>
                </Box>
              </MotionPaper>
            </Fade>
          </Grid>
        </Grid>

        {/* Metas do Mês */}
        <Box mb={4}>
          <Typography variant="h5" fontWeight={700} mb={3}>
            Metas do Mês
          </Typography>
          <Grid container spacing={3}>
            {metrics.map((metric, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <MetricCardMUI metric={metric} index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Radar Chart */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <KPIRadarChart metrics={metrics} />
          </Grid>

          {/* Mensagem Motivacional */}
          <Grid item xs={12} lg={6}>
            <MotionPaper
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                backgroundColor: statusConfig.color + '.main',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Box sx={{ fontSize: 64, mb: 2 }}>{statusConfig.icon}</Box>
              <Typography variant="h4" fontWeight={700} mb={2}>
                {statusConfig.label}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {statusConfig.message}
              </Typography>
              <Typography variant="h2" fontWeight={800} mt={3}>
                {totalAtingimento.toFixed(1)}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 1 }}>
                Atingimento Total
              </Typography>
            </MotionPaper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
