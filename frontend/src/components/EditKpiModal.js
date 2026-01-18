import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Slider,
  Chip,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import api from '@/utils/api';

const KPI_CONFIG = [
  { key: 'novos_ativos', label: 'Novos Ativos', type: 'number', peso: 0.3 },
  { key: 'churn', label: 'Churn %', type: 'percent', peso: 0.2, inverse: true },
  { key: 'tpv_m1', label: 'TPV M1', type: 'currency', peso: 0.2 },
  { key: 'ativos_m1', label: 'Ativos M1', type: 'number', peso: 0.15 },
  { key: 'migracao_hunter', label: 'Migração Hunter %', type: 'percent', peso: 0.15 },
];

export const EditKpiModal = ({ open, onClose, seller, onSave }) => {
  const [formData, setFormData] = useState({});
  const [loading, setSaving] = useState(false);
  const [editMode, setEditMode] = useState('realizado'); // 'realizado' | 'meta' | 'peso'

  useEffect(() => {
    if (seller?.kpis) {
      setFormData({
        novos_ativos: seller.kpis.novos_ativos || 12,
        novos_ativos_realizado: seller.kpis.novos_ativos_realizado || 0,
        churn: seller.kpis.churn || 5,
        churn_realizado: seller.kpis.churn_realizado || 0,
        tpv_m1: seller.kpis.tpv_m1 || 100000,
        tpv_m1_realizado: seller.kpis.tpv_m1_realizado || 0,
        ativos_m1: seller.kpis.ativos_m1 || 10,
        ativos_m1_realizado: seller.kpis.ativos_m1_realizado || 0,
        migracao_hunter: seller.kpis.migracao_hunter || 70,
        migracao_hunter_realizado: seller.kpis.migracao_hunter_realizado || 0,
        peso_novos_ativos: seller.kpis.peso_novos_ativos || 0.3,
        peso_churn: seller.kpis.peso_churn || 0.2,
        peso_tpv_m1: seller.kpis.peso_tpv_m1 || 0.2,
        peso_ativos_m1: seller.kpis.peso_ativos_m1 || 0.15,
        peso_migracao_hunter: seller.kpis.peso_migracao_hunter || 0.15,
      });
    }
  }, [seller]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calcula soma total dos pesos
  const totalPesos = (
    (formData.peso_novos_ativos || 0) +
    (formData.peso_churn || 0) +
    (formData.peso_tpv_m1 || 0) +
    (formData.peso_ativos_m1 || 0) +
    (formData.peso_migracao_hunter || 0)
  );
  const pesosValidos = Math.abs(totalPesos - 1) < 0.01; // Tolerância de 1%

  const handleSave = async () => {
    // Validar soma dos pesos = 1 antes de salvar
    if (editMode === 'peso' && !pesosValidos) {
      toast.error(`⚠️ A soma dos pesos deve ser 100%! Atual: ${(totalPesos * 100).toFixed(0)}%`);
      return;
    }
    
    try {
      setSaving(true);
      const currentMonth = new Date().toISOString().slice(0, 7);
      await api.put(`/kpis/${seller.id}/${currentMonth}`, formData);
      toast.success('✅ KPIs atualizados com sucesso!');
      onSave?.();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar KPIs');
    } finally {
      setSaving(false);
    }
  };

  const formatValue = (value, type) => {
    if (type === 'currency') return `R$ ${(value / 1000).toFixed(0)}k`;
    if (type === 'percent') return `${value}%`;
    return value;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Editar KPIs - {seller?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {seller?.email}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Mode Selector */}
        <Box display="flex" gap={1} mb={3}>
          <Chip
            label="Realizado"
            color={editMode === 'realizado' ? 'primary' : 'default'}
            onClick={() => setEditMode('realizado')}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label="Metas"
            color={editMode === 'meta' ? 'primary' : 'default'}
            onClick={() => setEditMode('meta')}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label="Pesos"
            color={editMode === 'peso' ? 'primary' : 'default'}
            onClick={() => setEditMode('peso')}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {editMode === 'realizado' && (
          <Grid container spacing={3}>
            {KPI_CONFIG.map((kpi) => (
              <Grid item xs={12} sm={6} key={kpi.key}>
                <TextField
                  fullWidth
                  label={`${kpi.label} (Realizado)`}
                  type="number"
                  value={formData[`${kpi.key}_realizado`] || 0}
                  onChange={(e) =>
                    handleChange(`${kpi.key}_realizado`, parseFloat(e.target.value) || 0)
                  }
                  InputProps={{
                    endAdornment: kpi.type === 'percent' ? '%' : kpi.type === 'currency' ? 'R$' : null,
                  }}
                  data-testid={`kpi-${kpi.key}-realizado`}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Meta: {formatValue(formData[kpi.key], kpi.type)}
                </Typography>
              </Grid>
            ))}
          </Grid>
        )}

        {editMode === 'meta' && (
          <Grid container spacing={3}>
            {KPI_CONFIG.map((kpi) => (
              <Grid item xs={12} sm={6} key={kpi.key}>
                <TextField
                  fullWidth
                  label={`${kpi.label} (Meta)`}
                  type="number"
                  value={formData[kpi.key] || 0}
                  onChange={(e) => handleChange(kpi.key, parseFloat(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: kpi.type === 'percent' ? '%' : kpi.type === 'currency' ? 'R$' : null,
                  }}
                  data-testid={`kpi-${kpi.key}-meta`}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {editMode === 'peso' && (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              A soma dos pesos deve ser igual a 100% (1.0)
            </Alert>
            <Grid container spacing={3}>
              {KPI_CONFIG.map((kpi) => (
                <Grid item xs={12} key={kpi.key}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      {kpi.label}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Slider
                        value={formData[`peso_${kpi.key}`] * 100 || 0}
                        onChange={(e, value) => handleChange(`peso_${kpi.key}`, value / 100)}
                        min={0}
                        max={50}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => `${v}%`}
                        sx={{ flex: 1 }}
                        data-testid={`peso-${kpi.key}-slider`}
                      />
                      <Typography variant="body2" fontWeight={700} sx={{ minWidth: 50 }}>
                        {((formData[`peso_${kpi.key}`] || 0) * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" fontWeight={700}>
              Total:{' '}
              {(
                (formData.peso_novos_ativos || 0) +
                (formData.peso_churn || 0) +
                (formData.peso_tpv_m1 || 0) +
                (formData.peso_ativos_m1 || 0) +
                (formData.peso_migracao_hunter || 0)
              ).toFixed(2) * 100}
              %
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
          data-testid="save-kpi-modal-btn"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditKpiModal;
