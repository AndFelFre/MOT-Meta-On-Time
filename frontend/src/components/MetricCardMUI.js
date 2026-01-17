import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export const MetricCardMUI = ({ metric, index }) => {
  const getFarolConfig = (farol) => {
    switch (farol) {
      case 'green':
        return {
          icon: <CheckCircleIcon />,
          color: 'success',
          label: 'Excelente!',
          description: 'Meta atingida com sucesso',
        };
      case 'yellow':
        return {
          icon: <WarningIcon />,
          color: 'warning',
          label: 'Atenção',
          description: 'Próximo da meta, continue o esforço',
        };
      case 'red':
        return {
          icon: <ErrorIcon />,
          color: 'error',
          label: 'Abaixo da Meta',
          description: 'Precisa de atenção urgente',
        };
      default:
        return {
          icon: <ErrorIcon />,
          color: 'error',
          label: 'Sem dados',
          description: 'Dados não disponíveis',
        };
    }
  };

  const farolConfig = getFarolConfig(metric.farol);
  const progressValue = Math.min(metric.atingimento, 200);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      data-testid={`metric-card-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        borderLeft: 4,
        borderLeftColor: `${farolConfig.color}.main`,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box flex={1}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1.5, fontSize: '0.65rem', fontWeight: 600 }}
            >
              KPI
            </Typography>
            <Typography variant="h6" fontWeight={700} mt={0.5}>
              {metric.name}
            </Typography>
          </Box>
          <Tooltip
            title={
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {farolConfig.label}
                </Typography>
                <Typography variant="body2">{farolConfig.description}</Typography>
              </Box>
            }
            arrow
            placement="top"
          >
            <IconButton size="small" color={farolConfig.color} data-testid={`farol-${metric.farol}`}>
              {farolConfig.icon}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Meta e Realizado */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Meta
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {metric.meta}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Realizado
            </Typography>
            <Typography variant="body2" fontWeight={700} color="primary">
              {metric.realizado}
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box mb={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Atingimento
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              {metric.atingimento >= 100 ? (
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography variant="h6" fontWeight={700}>
                {metric.atingimento.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
          <Tooltip
            title={`${progressValue.toFixed(1)}% de ${metric.meta}`}
            placement="top"
            arrow
          >
            <LinearProgress
              variant="determinate"
              value={Math.min(progressValue, 100)}
              color={farolConfig.color}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  transition: 'transform 0.6s ease-in-out',
                },
              }}
            />
          </Tooltip>
        </Box>

        {/* Footer com Peso e Final */}
        <Box
          pt={2}
          borderTop={1}
          borderColor="divider"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Chip
            label={`Peso: ${(metric.peso * 100).toFixed(0)}%`}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" display="block">
              Final
            </Typography>
            <Typography variant="body2" fontWeight={700} color="secondary">
              {(metric.atingimentoFinal * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        {/* Badge especial para Churn */}
        {metric.isInverse && (
          <Tooltip title="Cálculo inverso: quanto menor, melhor" placement="bottom" arrow>
            <Chip
              label="Inverso"
              size="small"
              color="info"
              sx={{
                position: 'absolute',
                top: 8,
                right: 48,
                fontSize: '0.65rem',
                height: 20,
              }}
            />
          </Tooltip>
        )}
      </CardContent>
    </MotionCard>
  );
};
