import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const MotionTableRow = motion(TableRow);

const ColorPicker = ({ value, onChange }) => {
  const colors = ['#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4'];
  
  return (
    <Box display="flex" gap={0.5} flexWrap="wrap">
      {colors.map((color) => (
        <Box
          key={color}
          onClick={() => onChange(color)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: color,
            cursor: 'pointer',
            border: value === color ? '3px solid #000' : '2px solid transparent',
            transition: 'all 0.2s',
            '&:hover': { transform: 'scale(1.1)' },
          }}
        />
      ))}
    </Box>
  );
};

export default function CareerConfigPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const [editingLevel, setEditingLevel] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLevel, setNewLevel] = useState({
    level: '',
    requirements: '',
    tpv_min: 0,
    time_min: 0,
    bonus_percent: 0,
    benefits: '',
    color: '#6B7280',
  });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/career-levels');
      setLevels(response.data);
    } catch (error) {
      console.error('Error fetching career levels:', error);
      toast.error('Erro ao carregar níveis de carreira');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLevel = async (levelId, data) => {
    try {
      await api.put(`/career-levels/${levelId}`, data);
      toast.success('✅ Nível atualizado com sucesso!');
      setEditingLevel(null);
      fetchLevels();
    } catch (error) {
      toast.error('Erro ao atualizar nível');
    }
  };

  const handleCreateLevel = async () => {
    if (!newLevel.level) {
      toast.error('Nome do nível é obrigatório');
      return;
    }
    
    try {
      await api.post('/career-levels', newLevel);
      toast.success('✅ Nível criado com sucesso!');
      setShowAddDialog(false);
      setNewLevel({
        level: '',
        requirements: '',
        tpv_min: 0,
        time_min: 0,
        bonus_percent: 0,
        benefits: '',
        color: '#6B7280',
      });
      fetchLevels();
    } catch (error) {
      toast.error('Erro ao criar nível');
    }
  };

  const handleDeleteLevel = async (levelId) => {
    if (!window.confirm('Tem certeza que deseja excluir este nível?')) return;
    
    try {
      await api.delete(`/career-levels/${levelId}`);
      toast.success('✅ Nível excluído com sucesso!');
      fetchLevels();
    } catch (error) {
      toast.error('Erro ao excluir nível');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography color="text.secondary">Acesso negado</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ pb: 4 }} data-testid="career-config-page">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              ⚙️ Configurar Plano de Carreira
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Defina os níveis, requisitos e benefícios da progressão de carreira
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddDialog(true)}
            data-testid="add-level-btn"
          >
            Novo Nível
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Os níveis são ordenados automaticamente. Edite os requisitos de TPV e tempo para definir a progressão.
        </Alert>

        {/* Levels Table */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700, width: 60 }}>Ordem</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nível</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Requisitos</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>TPV Mínimo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tempo Mín.</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Bônus %</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Benefícios</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {levels.map((level, index) => (
                <MotionTableRow
                  key={level.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>
                    <Chip
                      label={level.order}
                      size="small"
                      sx={{ 
                        backgroundColor: level.color,
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {editingLevel === level.id ? (
                      <TextField
                        size="small"
                        value={level.level}
                        disabled
                        sx={{ width: 120 }}
                      />
                    ) : (
                      <Typography fontWeight={600}>{level.level}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLevel === level.id ? (
                      <TextField
                        size="small"
                        defaultValue={level.requirements}
                        onChange={(e) => level.requirements = e.target.value}
                        fullWidth
                        multiline
                        rows={2}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {level.requirements}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLevel === level.id ? (
                      <TextField
                        size="small"
                        type="number"
                        defaultValue={level.tpv_min}
                        onChange={(e) => level.tpv_min = parseInt(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        }}
                        sx={{ width: 140 }}
                      />
                    ) : (
                      <Typography variant="body2">
                        R$ {level.tpv_min?.toLocaleString('pt-BR')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLevel === level.id ? (
                      <TextField
                        size="small"
                        type="number"
                        defaultValue={level.time_min}
                        onChange={(e) => level.time_min = parseInt(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">meses</InputAdornment>,
                        }}
                        sx={{ width: 120 }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {level.time_min} meses
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLevel === level.id ? (
                      <TextField
                        size="small"
                        type="number"
                        defaultValue={level.bonus_percent}
                        onChange={(e) => level.bonus_percent = parseInt(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        sx={{ width: 100 }}
                      />
                    ) : (
                      <Chip
                        label={`${level.bonus_percent}%`}
                        size="small"
                        color={level.bonus_percent > 0 ? 'success' : 'default'}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLevel === level.id ? (
                      <TextField
                        size="small"
                        defaultValue={level.benefits}
                        onChange={(e) => level.benefits = e.target.value}
                        fullWidth
                        multiline
                        rows={2}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {level.benefits}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      {editingLevel === level.id ? (
                        <>
                          <Tooltip title="Salvar">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleSaveLevel(level.id, {
                                requirements: level.requirements,
                                tpv_min: level.tpv_min,
                                time_min: level.time_min,
                                bonus_percent: level.bonus_percent,
                                benefits: level.benefits,
                                color: level.color,
                              })}
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancelar">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingLevel(null);
                                fetchLevels();
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => setEditingLevel(level.id)}
                              data-testid={`edit-level-${level.id}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteLevel(level.id)}
                              data-testid={`delete-level-${level.id}`}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </MotionTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Visual Preview */}
        <Paper elevation={0} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={3}>
            📊 Visualização da Progressão
          </Typography>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {levels.map((level, index) => (
              <React.Fragment key={level.id}>
                <Chip
                  label={level.level}
                  sx={{
                    backgroundColor: level.color,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    py: 2,
                    px: 1,
                  }}
                />
                {index < levels.length - 1 && (
                  <ArrowDownward sx={{ color: 'text.secondary', transform: 'rotate(-90deg)' }} />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Paper>

        {/* Add Level Dialog */}
        <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Criar Novo Nível de Carreira</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <TextField
                label="Nome do Nível"
                value={newLevel.level}
                onChange={(e) => setNewLevel({ ...newLevel, level: e.target.value })}
                fullWidth
                required
                data-testid="new-level-name"
              />
              <TextField
                label="Requisitos"
                value={newLevel.requirements}
                onChange={(e) => setNewLevel({ ...newLevel, requirements: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="TPV Mínimo"
                    type="number"
                    value={newLevel.tpv_min}
                    onChange={(e) => setNewLevel({ ...newLevel, tpv_min: parseInt(e.target.value) || 0 })}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Tempo Mínimo"
                    type="number"
                    value={newLevel.time_min}
                    onChange={(e) => setNewLevel({ ...newLevel, time_min: parseInt(e.target.value) || 0 })}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">meses</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Bônus %"
                type="number"
                value={newLevel.bonus_percent}
                onChange={(e) => setNewLevel({ ...newLevel, bonus_percent: parseInt(e.target.value) || 0 })}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
              <TextField
                label="Benefícios"
                value={newLevel.benefits}
                onChange={(e) => setNewLevel({ ...newLevel, benefits: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
              <Box>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  Cor do Nível
                </Typography>
                <ColorPicker
                  value={newLevel.color}
                  onChange={(color) => setNewLevel({ ...newLevel, color })}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleCreateLevel}
              variant="contained"
              data-testid="confirm-create-level"
            >
              Criar Nível
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
