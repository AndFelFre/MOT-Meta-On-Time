import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Assessment,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const StatCard = ({ title, value, subtitle, icon: Icon, color, index }) => (
  <MotionPaper
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 2,
      borderLeft: 4,
      borderLeftColor: `${color}.main`,
      backgroundColor: 'background.paper',
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} color={`${color}.main`}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          backgroundColor: `${color}.light`,
          color: `${color}.dark`,
        }}
      >
        <Icon />
      </Box>
    </Box>
  </MotionPaper>
);

export const StatsOverview = ({ stats, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const statsData = [
    {
      title: 'Total Vendedores',
      value: stats?.totalSellers || 0,
      subtitle: `${stats?.activeSellers || 0} ativos`,
      icon: PeopleIcon,
      color: 'primary',
    },
    {
      title: 'Atingimento Médio',
      value: `${(stats?.avgAtingimento || 0).toFixed(1)}%`,
      subtitle: stats?.avgAtingimento >= 80 ? 'Dentro da meta' : 'Abaixo da meta',
      icon: stats?.avgAtingimento >= 80 ? TrendingUp : TrendingDown,
      color: stats?.avgAtingimento >= 80 ? 'success' : 'warning',
    },
    {
      title: 'TPV Total',
      value: `R$ ${((stats?.totalTPV || 0) / 1000).toFixed(0)}k`,
      subtitle: 'Volume transacionado',
      icon: AttachMoney,
      color: 'info',
    },
    {
      title: 'Churn Médio',
      value: `${(stats?.avgChurn || 0).toFixed(1)}%`,
      subtitle: stats?.avgChurn <= 5 ? 'Saudável' : 'Atenção',
      icon: stats?.avgChurn <= 5 ? Assessment : Warning,
      color: stats?.avgChurn <= 5 ? 'success' : 'error',
    },
    {
      title: 'Vendedores Meta',
      value: stats?.sellersOnTarget || 0,
      subtitle: `${((stats?.sellersOnTarget / stats?.totalSellers) * 100 || 0).toFixed(0)}% do time`,
      icon: TrendingUp,
      color: 'success',
    },
    {
      title: 'Precisam Atenção',
      value: stats?.sellersNeedAttention || 0,
      subtitle: 'Atingimento < 80%',
      icon: Warning,
      color: 'error',
    },
  ];

  return (
    <Grid container spacing={2}>
      {statsData.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={stat.title}>
          <StatCard {...stat} index={index} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsOverview;
