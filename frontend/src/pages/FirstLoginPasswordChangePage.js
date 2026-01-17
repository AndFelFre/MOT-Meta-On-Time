import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import api from '@/utils/api';
import { toast } from 'sonner';

export default function FirstLoginPasswordChangePage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { text: 'Mínimo de 6 caracteres', met: newPassword.length >= 6 },
    { text: 'Senhas coincidem', met: newPassword === confirmPassword && newPassword.length > 0 },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allRequirementsMet) {
      toast.error('Por favor, atenda todos os requisitos da senha');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/first-login-password-change', { new_password: newPassword });
      toast.success('✅ Senha alterada com sucesso! Redirecionando...');
      
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao alterar senha');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 500,
          width: '100%',
          p: 4,
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Bem-vindo(a) ao MOT! 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Por segurança, você precisa alterar sua senha temporária antes de continuar.
          </Typography>
        </Box>

        {/* Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta é sua primeira vez no sistema. Crie uma senha segura que você possa lembrar.
        </Alert>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Nova Senha"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              data-testid="new-password-input"
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                ),
              }}
            />

            <TextField
              label="Confirmar Nova Senha"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              data-testid="confirm-password-input"
            />

            {/* Password Requirements */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Requisitos da Senha:
              </Typography>
              <List dense>
                {passwordRequirements.map((req, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckIcon
                        fontSize="small"
                        sx={{
                          color: req.met ? 'success.main' : 'text.disabled',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={req.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        color: req.met ? 'success.main' : 'text.secondary',
                        fontWeight: req.met ? 600 : 400,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {loading && <LinearProgress />}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!allRequirementsMet || loading}
              fullWidth
              data-testid="change-password-btn"
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                },
              }}
            >
              {loading ? 'Alterando...' : 'Alterar Senha e Continuar'}
            </Button>
          </Box>
        </form>

        {/* Footer */}
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={3}>
          Após alterar sua senha, você terá acesso completo ao sistema MOT
        </Typography>
      </Paper>
    </Box>
  );
}
