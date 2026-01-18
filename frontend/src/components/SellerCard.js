import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const getStatusColor = (atingimento) => {
  if (atingimento >= 100) return 'success';
  if (atingimento >= 80) return 'warning';
  return 'error';
};

const getStatusLabel = (atingimento) => {
  if (atingimento >= 100) return 'Excelente';
  if (atingimento >= 80) return 'Bom';
  if (atingimento >= 60) return 'Regular';
  return 'Crítico';
};

export const SellerCard = ({ seller, onEdit, onView, index = 0 }) => {
  const atingimento = seller.atingimento || 0;
  const statusColor = getStatusColor(atingimento);
  const statusLabel = getStatusLabel(atingimento);

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderColor: `${statusColor}.main`,
        },
        transition: 'all 0.2s ease',
      }}
      data-testid={`seller-card-${seller.id}`}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              bgcolor: `${statusColor}.light`,
              color: `${statusColor}.dark`,
              fontWeight: 700,
              width: 44,
              height: 44,
            }}
          >
            {seller.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ maxWidth: 150 }}>
              {seller.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {seller.career_level || 'Recruta'}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={0.5}>
          <Tooltip title="Ver detalhes" arrow>
            <IconButton size="small" onClick={() => onView?.(seller)} data-testid={`view-seller-${seller.id}`}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar metas" arrow>
            <IconButton size="small" onClick={() => onEdit?.(seller)} data-testid={`edit-seller-${seller.id}`}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Atingimento */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Atingimento
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            {atingimento >= 80 ? (
              <TrendingUp fontSize="small" color="success" />
            ) : (
              <TrendingDown fontSize="small" color="error" />
            )}
            <Typography variant="body2" fontWeight={700} color={`${statusColor}.main`}>
              {atingimento.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(atingimento, 100)}
          color={statusColor}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'action.hover',
          }}
        />
      </Box>

      {/* KPIs Mini */}
      <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
        {seller.kpis?.novos_ativos !== undefined && (
          <Chip
            size="small"
            label={`Novos: ${seller.kpis.novos_ativos_realizado || 0}/${seller.kpis.novos_ativos || 0}`}
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        )}
        {seller.kpis?.churn !== undefined && (
          <Chip
            size="small"
            label={`Churn: ${seller.kpis.churn_realizado?.toFixed(1) || 0}%`}
            variant="outlined"
            color={seller.kpis.churn_realizado <= seller.kpis.churn ? 'success' : 'error'}
            sx={{ fontSize: '0.7rem' }}
          />
        )}
      </Box>

      {/* Footer */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Chip
          size="small"
          label={statusLabel}
          color={statusColor}
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
        <Typography variant="caption" color="text.secondary">
          {seller.email?.split('@')[0]}
        </Typography>
      </Box>
    </MotionPaper>
  );
};

export default SellerCard;
