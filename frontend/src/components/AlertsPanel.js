import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  TrendingDown,
  Person,
  ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export const AlertsPanel = ({ sellers, onViewSeller }) => {
  // Find sellers that need attention
  const criticalSellers = sellers
    .filter((s) => s.atingimento < 60)
    .sort((a, b) => a.atingimento - b.atingimento)
    .slice(0, 5);

  const highChurnSellers = sellers
    .filter((s) => s.kpis?.churn_realizado > 5)
    .sort((a, b) => (b.kpis?.churn_realizado || 0) - (a.kpis?.churn_realizado || 0))
    .slice(0, 3);

  const newRecruits = sellers
    .filter((s) => s.career_level === 'Recruta' && s.atingimento < 80)
    .slice(0, 3);

  if (criticalSellers.length === 0 && highChurnSellers.length === 0 && newRecruits.length === 0) {
    return (
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: 'success.light',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={700} color="success.dark" gutterBottom>
          🎉 Tudo em ordem!
        </Typography>
        <Typography variant="body2" color="success.dark">
          Nenhum vendedor precisa de atenção especial no momento.
        </Typography>
      </MotionPaper>
    );
  }

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      elevation={0}
      sx={{
        p: 0,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 2,
          backgroundColor: 'error.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          ⚠️ Alertas e Sugestões
        </Typography>
        <Typography variant="caption">
          Vendedores que precisam de atenção
        </Typography>
      </Box>

      {/* Critical Performance */}
      {criticalSellers.length > 0 && (
        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="error.main"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <WarningIcon fontSize="small" />
            Performance Crítica
          </Typography>
          <List dense disablePadding>
            {criticalSellers.map((seller) => (
              <ListItem
                key={seller.id}
                sx={{
                  px: 0,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                  borderRadius: 1,
                }}
                onClick={() => onViewSeller?.(seller)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Person fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={seller.name}
                  secondary={`Atingimento: ${seller.atingimento?.toFixed(1)}%`}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
                <Chip
                  size="small"
                  label="Crítico"
                  color="error"
                  sx={{ fontSize: '0.65rem' }}
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            💡 Sugestão: Agende reunião 1:1 para identificar obstáculos
          </Typography>
        </Box>
      )}

      {criticalSellers.length > 0 && highChurnSellers.length > 0 && <Divider />}

      {/* High Churn */}
      {highChurnSellers.length > 0 && (
        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="warning.main"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <TrendingDown fontSize="small" />
            Churn Elevado
          </Typography>
          <List dense disablePadding>
            {highChurnSellers.map((seller) => (
              <ListItem
                key={seller.id}
                sx={{
                  px: 0,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                  borderRadius: 1,
                }}
                onClick={() => onViewSeller?.(seller)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Person fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary={seller.name}
                  secondary={`Churn: ${seller.kpis?.churn_realizado?.toFixed(1)}%`}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
                <Chip
                  size="small"
                  label="Atenção"
                  color="warning"
                  sx={{ fontSize: '0.65rem' }}
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            💡 Sugestão: Revisar estratégia de retenção de clientes
          </Typography>
        </Box>
      )}

      {(criticalSellers.length > 0 || highChurnSellers.length > 0) && newRecruits.length > 0 && <Divider />}

      {/* New Recruits */}
      {newRecruits.length > 0 && (
        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="info.main"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Person fontSize="small" />
            Recrutas Precisam de Apoio
          </Typography>
          <List dense disablePadding>
            {newRecruits.map((seller) => (
              <ListItem
                key={seller.id}
                sx={{
                  px: 0,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                  borderRadius: 1,
                }}
                onClick={() => onViewSeller?.(seller)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Person fontSize="small" color="info" />
                </ListItemIcon>
                <ListItemText
                  primary={seller.name}
                  secondary={`Atingimento: ${seller.atingimento?.toFixed(1)}%`}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
                <Chip
                  size="small"
                  label="Recruta"
                  color="info"
                  sx={{ fontSize: '0.65rem' }}
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            💡 Sugestão: Intensificar treinamento e acompanhamento
          </Typography>
        </Box>
      )}
    </MotionPaper>
  );
};

export default AlertsPanel;
