import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsOverview } from '@/components/StatsOverview';
import { SellerCard } from '@/components/SellerCard';
import { EditKpiModal } from '@/components/EditKpiModal';
import { AlertsPanel } from '@/components/AlertsPanel';
import { PerformanceChart, KPIComparisonChart, TPVChart } from '@/components/AdminCharts';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import api from '@/utils/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { mode, toggleTheme } = useTheme();
  
  // States
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterPerformance, setFilterPerformance] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeTab, setActiveTab] = useState(0);
  
  // Modal states
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch data
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSellersWithKPIs();
    }
  }, [user]);

  const fetchSellersWithKPIs = async () => {
    try {
      setRefreshing(true);
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Fetch users
      const usersResponse = await api.get('/users');
      const users = usersResponse.data || [];
      
      // Fetch KPIs for each user
      const sellersWithKPIs = await Promise.all(
        users.map(async (u) => {
          try {
            const kpiResponse = await api.get(`/kpis/${u.id}/${currentMonth}`);
            const kpis = kpiResponse.data;
            
            // Calculate atingimento
            const atingimento = calculateAtingimento(kpis);
            
            return {
              ...u,
              kpis,
              atingimento,
            };
          } catch {
            return {
              ...u,
              kpis: null,
              atingimento: 0,
            };
          }
        })
      );
      
      setSellers(sellersWithKPIs.filter((s) => s.role !== 'admin'));
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('Erro ao carregar vendedores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateAtingimento = (kpis) => {
    if (!kpis) return 0;
    
    const weights = {
      novos_ativos: 0.3,
      churn: 0.2,
      tpv_m1: 0.2,
      ativos_m1: 0.15,
      migracao_hunter: 0.15,
    };
    
    let total = 0;
    
    // Novos Ativos
    if (kpis.novos_ativos > 0) {
      total += (kpis.novos_ativos_realizado / kpis.novos_ativos) * 100 * weights.novos_ativos;
    }
    
    // Churn (inverse - lower is better)
    if (kpis.churn > 0) {
      const churnAtingimento = Math.max(0, ((kpis.churn - kpis.churn_realizado) / kpis.churn + 1)) * 100;
      total += Math.min(churnAtingimento, 200) * weights.churn;
    }
    
    // TPV M1
    if (kpis.tpv_m1 > 0) {
      total += (kpis.tpv_m1_realizado / kpis.tpv_m1) * 100 * weights.tpv_m1;
    }
    
    // Ativos M1
    if (kpis.ativos_m1 > 0) {
      total += (kpis.ativos_m1_realizado / kpis.ativos_m1) * 100 * weights.ativos_m1;
    }
    
    // Migração Hunter
    if (kpis.migracao_hunter > 0) {
      total += (kpis.migracao_hunter_realizado / kpis.migracao_hunter) * 100 * weights.migracao_hunter;
    }
    
    return total;
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!sellers.length) return null;
    
    const activeSellers = sellers.filter((s) => !s.archived);
    const totalTPV = sellers.reduce((acc, s) => acc + (s.kpis?.tpv_m1_realizado || 0), 0);
    const avgAtingimento = sellers.reduce((acc, s) => acc + (s.atingimento || 0), 0) / sellers.length;
    const avgChurn = sellers.reduce((acc, s) => acc + (s.kpis?.churn_realizado || 0), 0) / sellers.length;
    const sellersOnTarget = sellers.filter((s) => s.atingimento >= 100).length;
    const sellersNeedAttention = sellers.filter((s) => s.atingimento < 80).length;
    
    return {
      totalSellers: sellers.length,
      activeSellers: activeSellers.length,
      totalTPV,
      avgAtingimento,
      avgChurn,
      sellersOnTarget,
      sellersNeedAttention,
    };
  }, [sellers]);

  // Filter sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter((seller) => {
      // Search filter
      const matchesSearch =
        seller.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Level filter
      const matchesLevel =
        filterLevel === 'all' || seller.career_level === filterLevel;

      // Performance filter
      let matchesPerformance = true;
      if (filterPerformance === 'excellent') matchesPerformance = seller.atingimento >= 100;
      else if (filterPerformance === 'good') matchesPerformance = seller.atingimento >= 80 && seller.atingimento < 100;
      else if (filterPerformance === 'regular') matchesPerformance = seller.atingimento >= 60 && seller.atingimento < 80;
      else if (filterPerformance === 'critical') matchesPerformance = seller.atingimento < 60;

      return matchesSearch && matchesLevel && matchesPerformance;
    });
  }, [sellers, searchQuery, filterLevel, filterPerformance]);

  // Handlers
  const handleEditSeller = (seller) => {
    setSelectedSeller(seller);
    setShowEditModal(true);
  };

  const handleViewSeller = (seller) => {
    setSelectedSeller(seller);
    // Could open a detail modal or navigate to seller page
    toast.info(`Visualizando: ${seller.name}`);
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Email', 'Nível', 'Atingimento', 'Novos Ativos', 'Churn', 'TPV'];
    const rows = filteredSellers.map((s) => [
      s.name,
      s.email,
      s.career_level,
      `${s.atingimento?.toFixed(1)}%`,
      s.kpis?.novos_ativos_realizado || 0,
      `${s.kpis?.churn_realizado?.toFixed(1) || 0}%`,
      s.kpis?.tpv_m1_realizado || 0,
    ]);
    
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendedores_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    
    toast.success('CSV exportado com sucesso!');
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
      <Box sx={{ pb: 4 }} data-testid="admin-dashboard">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Dashboard Administrativo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visão geral da equipe comercial
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Atualizar dados" arrow>
              <IconButton onClick={fetchSellersWithKPIs} disabled={refreshing} color="primary">
                <RefreshIcon className={refreshing ? 'animate-spin' : ''} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar CSV" arrow>
              <IconButton onClick={handleExportCSV} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Overview */}
        <Box mb={4}>
          <StatsOverview stats={stats} loading={loading} />
        </Box>

        {/* Tabs */}
        <Paper elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Visão Geral" />
            <Tab label="Vendedores" />
            <Tab label="Alertas" />
          </Tabs>
        </Paper>

        {/* Tab 0: Overview with Charts */}
        {activeTab === 0 && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={4}>
                <PerformanceChart sellers={filteredSellers} />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <KPIComparisonChart sellers={filteredSellers} />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <TPVChart sellers={filteredSellers} />
              </Grid>
              <Grid item xs={12} lg={8}>
                {/* Quick seller cards */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    Top Performers
                  </Typography>
                  <Grid container spacing={2}>
                    {filteredSellers
                      .sort((a, b) => b.atingimento - a.atingimento)
                      .slice(0, 4)
                      .map((seller, index) => (
                        <Grid item xs={12} sm={6} key={seller.id}>
                          <SellerCard
                            seller={seller}
                            onEdit={handleEditSeller}
                            onView={handleViewSeller}
                            index={index}
                          />
                        </Grid>
                      ))}
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={4}>
                <AlertsPanel sellers={filteredSellers} onViewSeller={handleViewSeller} />
              </Grid>
            </Grid>
          </MotionBox>
        )}

        {/* Tab 1: All Sellers */}
        {activeTab === 1 && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filters */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                <TextField
                  placeholder="Buscar vendedor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                  sx={{ minWidth: 250 }}
                  data-testid="search-sellers"
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Nível</InputLabel>
                  <Select
                    value={filterLevel}
                    label="Nível"
                    onChange={(e) => setFilterLevel(e.target.value)}
                    data-testid="filter-level"
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="Recruta">Recruta</MenuItem>
                    <MenuItem value="Aspirante">Aspirante</MenuItem>
                    <MenuItem value="Consultor">Consultor</MenuItem>
                    <MenuItem value="Senior">Senior</MenuItem>
                    <MenuItem value="Master">Master</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Performance</InputLabel>
                  <Select
                    value={filterPerformance}
                    label="Performance"
                    onChange={(e) => setFilterPerformance(e.target.value)}
                    data-testid="filter-performance"
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="excellent">Excelente (≥100%)</MenuItem>
                    <MenuItem value="good">Bom (80-99%)</MenuItem>
                    <MenuItem value="regular">Regular (60-79%)</MenuItem>
                    <MenuItem value="critical">Crítico (&lt;60%)</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${filteredSellers.length} vendedores`}
                    color="primary"
                    variant="outlined"
                  />
                  <IconButton
                    size="small"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
                  </IconButton>
                </Box>
              </Box>
            </Paper>

            {/* Sellers Grid */}
            <Grid container spacing={2}>
              <AnimatePresence>
                {filteredSellers.map((seller, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={viewMode === 'grid' ? 6 : 12}
                    md={viewMode === 'grid' ? 4 : 12}
                    lg={viewMode === 'grid' ? 3 : 12}
                    key={seller.id}
                  >
                    <SellerCard
                      seller={seller}
                      onEdit={handleEditSeller}
                      onView={handleViewSeller}
                      index={index}
                    />
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>

            {filteredSellers.length === 0 && (
              <Box textAlign="center" py={8}>
                <Typography color="text.secondary">
                  Nenhum vendedor encontrado com os filtros aplicados
                </Typography>
              </Box>
            )}
          </MotionBox>
        )}

        {/* Tab 2: Alerts */}
        {activeTab === 2 && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <AlertsPanel sellers={filteredSellers} onViewSeller={handleViewSeller} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    Vendedores que Precisam de Atenção
                  </Typography>
                  <Grid container spacing={2}>
                    {filteredSellers
                      .filter((s) => s.atingimento < 80)
                      .sort((a, b) => a.atingimento - b.atingimento)
                      .slice(0, 6)
                      .map((seller, index) => (
                        <Grid item xs={12} sm={6} key={seller.id}>
                          <SellerCard
                            seller={seller}
                            onEdit={handleEditSeller}
                            onView={handleViewSeller}
                            index={index}
                          />
                        </Grid>
                      ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </MotionBox>
        )}

        {/* Edit KPI Modal */}
        <EditKpiModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          seller={selectedSeller}
          onSave={fetchSellersWithKPIs}
        />
      </Box>
    </DashboardLayout>
  );
}
