import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { toast } from 'sonner';
import {
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';

const careerLevels = ['Recruta', 'Aspirante', 'Consultor', 'Senior', 'Master'];
const roles = ['admin', 'agent'];

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent',
    career_level: 'Recruta',
    base_salary: 1570.0,
    active_base: 159,
    time_in_company: 0,
    send_welcome_email: false,
    generate_temp_password: false,
  });

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
      fetchArchivedUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users?include_archived=false');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedUsers = async () => {
    try {
      const response = await api.get('/users/archived/list');
      setArchivedUsers(response.data);
    } catch (error) {
      console.error('Error fetching archived users:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/users', formData);
      toast.success('✅ Usuário criado com sucesso!');
      setOpenCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar usuário');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const updateData = { ...formData };
      // Remover password se estiver vazio (não alterar)
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await api.put(`/users/${selectedUser.id}`, updateData);
      toast.success('✅ Usuário atualizado com sucesso!');
      setOpenEditModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar usuário');
    }
  };

  const handleArchiveUser = async () => {
    try {
      if (selectedUser.archived) {
        await api.patch(`/users/${selectedUser.id}/unarchive`);
        toast.success('✅ Usuário desarquivado com sucesso!');
      } else {
        await api.patch(`/users/${selectedUser.id}/archive`);
        toast.success('✅ Usuário arquivado com sucesso!');
      }
      setOpenArchiveDialog(false);
      setSelectedUser(null);
      fetchUsers();
      fetchArchivedUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao arquivar/desarquivar usuário');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/users/${selectedUser.id}`);
      toast.success('✅ Usuário excluído permanentemente!');
      setOpenDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
      fetchArchivedUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao excluir usuário');
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Não preencher por segurança
      role: user.role,
      career_level: user.career_level,
      base_salary: user.base_salary,
      active_base: user.active_base,
      time_in_company: user.time_in_company,
    });
    setOpenEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'agent',
      career_level: 'Recruta',
      base_salary: 1570.0,
      active_base: 159,
      time_in_company: 0,
    });
    setSelectedUser(null);
  };

  const filteredUsers = (showArchived ? archivedUsers : users).filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (currentUser?.role !== 'admin') {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography color="text.secondary">Acesso negado</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ pb: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Gerenciamento de Usuários
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Criar, editar, arquivar e excluir cadastros de agentes
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
            data-testid="create-user-btn"
            sx={{ height: 48 }}
          >
            Novo Usuário
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 300 }}
              data-testid="search-users-input"
            />
            <Button
              variant={showArchived ? 'contained' : 'outlined'}
              startIcon={showArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
              onClick={() => setShowArchived(!showArchived)}
              data-testid="toggle-archived-btn"
            >
              {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
            </Button>
            <Chip
              label={`${filteredUsers.length} usuário(s)`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </Paper>

        {/* Users Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cargo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nível</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Salário Base</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow
                    key={u.id}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      opacity: u.archived ? 0.6 : 1,
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography fontWeight={600}>{u.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        color={u.role === 'admin' ? 'primary' : 'default'}
                        sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                      />
                    </TableCell>
                    <TableCell>{u.career_level}</TableCell>
                    <TableCell>R$ {u.base_salary.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.archived ? 'Arquivado' : 'Ativo'}
                        size="small"
                        color={u.archived ? 'error' : 'success'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Tooltip title="Editar" arrow>
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(u)}
                            data-testid={`edit-user-btn-${u.id}`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={u.archived ? 'Desarquivar' : 'Arquivar'} arrow>
                          <IconButton
                            size="small"
                            color={u.archived ? 'success' : 'warning'}
                            onClick={() => {
                              setSelectedUser(u);
                              setOpenArchiveDialog(true);
                            }}
                            data-testid={`archive-user-btn-${u.id}`}
                          >
                            {u.archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir permanentemente" arrow>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedUser(u);
                              setOpenDeleteDialog(true);
                            }}
                            data-testid={`delete-user-btn-${u.id}`}
                            disabled={u.id === currentUser.id}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create User Modal */}
        <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <TextField
                label="Nome Completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                data-testid="create-name-input"
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
                data-testid="create-email-input"
              />
              <TextField
                label="Senha"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                fullWidth
                data-testid="create-password-input"
              />
              <FormControl fullWidth>
                <InputLabel>Cargo</InputLabel>
                <Select
                  value={formData.role}
                  label="Cargo"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  data-testid="create-role-select"
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role === 'admin' ? 'Administrador' : 'Agente'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Nível de Carreira</InputLabel>
                <Select
                  value={formData.career_level}
                  label="Nível de Carreira"
                  onChange={(e) => setFormData({ ...formData, career_level: e.target.value })}
                  data-testid="create-career-select"
                >
                  {careerLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Salário Base (R$)"
                type="number"
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) })}
                fullWidth
                data-testid="create-salary-input"
              />
              <TextField
                label="Base Ativa"
                type="number"
                value={formData.active_base}
                onChange={(e) => setFormData({ ...formData, active_base: parseInt(e.target.value) })}
                fullWidth
                data-testid="create-base-input"
              />
              <TextField
                label="Tempo na Empresa (meses)"
                type="number"
                value={formData.time_in_company}
                onChange={(e) => setFormData({ ...formData, time_in_company: parseInt(e.target.value) })}
                fullWidth
                data-testid="create-time-input"
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                🎉 Sistema de Onboarding
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.generate_temp_password}
                    onChange={(e) => setFormData({ ...formData, generate_temp_password: e.target.checked, password: '' })}
                    data-testid="generate-temp-password-checkbox"
                  />
                }
                label="Gerar senha temporária automaticamente"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.send_welcome_email}
                    onChange={(e) => setFormData({ ...formData, send_welcome_email: e.target.checked })}
                    data-testid="send-welcome-email-checkbox"
                  />
                }
                label="Enviar email de boas-vindas com credenciais"
              />
              
              {formData.generate_temp_password && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Uma senha temporária será gerada e enviada ao usuário. Ele deverá alterá-la no primeiro acesso.
                </Alert>
              )}
              
              {formData.send_welcome_email && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Um email de boas-vindas será enviado para {formData.email || 'o novo usuário'} com as credenciais de acesso.
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenCreateModal(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              variant="contained"
              data-testid="confirm-create-btn"
            >
              Criar Usuário
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <TextField
                label="Nome Completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                data-testid="edit-name-input"
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                data-testid="edit-email-input"
              />
              <TextField
                label="Nova Senha (deixe vazio para não alterar)"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                helperText="Preencha apenas se quiser alterar a senha"
                data-testid="edit-password-input"
              />
              <FormControl fullWidth>
                <InputLabel>Cargo</InputLabel>
                <Select
                  value={formData.role}
                  label="Cargo"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  data-testid="edit-role-select"
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role === 'admin' ? 'Administrador' : 'Agente'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Nível de Carreira</InputLabel>
                <Select
                  value={formData.career_level}
                  label="Nível de Carreira"
                  onChange={(e) => setFormData({ ...formData, career_level: e.target.value })}
                  data-testid="edit-career-select"
                >
                  {careerLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Salário Base (R$)"
                type="number"
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) })}
                fullWidth
                data-testid="edit-salary-input"
              />
              <TextField
                label="Base Ativa"
                type="number"
                value={formData.active_base}
                onChange={(e) => setFormData({ ...formData, active_base: parseInt(e.target.value) })}
                fullWidth
                data-testid="edit-base-input"
              />
              <TextField
                label="Tempo na Empresa (meses)"
                type="number"
                value={formData.time_in_company}
                onChange={(e) => setFormData({ ...formData, time_in_company: parseInt(e.target.value) })}
                fullWidth
                data-testid="edit-time-input"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenEditModal(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateUser}
              variant="contained"
              data-testid="confirm-edit-btn"
            >
              Salvar Alterações
            </Button>
          </DialogActions>
        </Dialog>

        {/* Archive/Unarchive Dialog */}
        <Dialog open={openArchiveDialog} onClose={() => setOpenArchiveDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>
            {selectedUser?.archived ? 'Desarquivar' : 'Arquivar'} Usuário
          </DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja {selectedUser?.archived ? 'desarquivar' : 'arquivar'} o usuário{' '}
              <strong>{selectedUser?.name}</strong>?
            </Typography>
            {!selectedUser?.archived && (
              <Alert severity="info" sx={{ mt: 2 }}>
                O usuário será ocultado das listas ativas mas seus dados serão mantidos para relatórios.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenArchiveDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleArchiveUser}
              variant="contained"
              color={selectedUser?.archived ? 'success' : 'warning'}
              data-testid="confirm-archive-btn"
            >
              {selectedUser?.archived ? 'Desarquivar' : 'Arquivar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Excluir Usuário Permanentemente</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Tem certeza que deseja excluir <strong>{selectedUser?.name}</strong>?
            </Typography>
            <Alert severity="error" sx={{ mt: 2 }}>
              <strong>ATENÇÃO:</strong> Esta ação é irreversível! Todos os dados do usuário (KPIs, bônus,
              forecast, competências) serão excluídos permanentemente.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleDeleteUser}
              variant="contained"
              color="error"
              data-testid="confirm-delete-btn"
            >
              Excluir Permanentemente
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
