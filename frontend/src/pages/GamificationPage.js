import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Whatshot as FireIcon,
  WorkspacePremium as BadgeIcon,
  Leaderboard as RankingIcon,
  CardGiftcard as RewardIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

const BADGE_ICONS = {
  "🎯": "🎯", "🏆": "🏆", "🔥": "🔥", "⚡": "⚡", 
  "💎": "💎", "👑": "👑", "⭐": "⭐", "🤝": "🤝", 
  "💯": "💯", "🎖️": "🎖️"
};

const getRankColor = (position) => {
  if (position === 1) return { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', text: '#000' };
  if (position === 2) return { bg: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)', text: '#000' };
  if (position === 3) return { bg: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)', text: '#fff' };
  return { bg: '#f1f5f9', text: '#334155' };
};

const BadgeCard = ({ badge, earned = false, onClick }) => (
  <MotionCard
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      opacity: earned ? 1 : 0.5,
      filter: earned ? 'none' : 'grayscale(80%)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: earned ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
      },
    }}
  >
    <CardContent sx={{ textAlign: 'center', py: 3 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        {badge.icon}
      </Typography>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {badge.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        {badge.description}
      </Typography>
      <Chip
        size="small"
        label={`+${badge.points} pts`}
        color={earned ? 'success' : 'default'}
        sx={{ fontWeight: 600 }}
      />
    </CardContent>
  </MotionCard>
);

const RankingRow = ({ item, index, isCurrentUser }) => {
  const rankColor = getRankColor(item.position);
  
  return (
    <MotionPaper
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      elevation={isCurrentUser ? 3 : 0}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        border: isCurrentUser ? '2px solid' : '1px solid',
        borderColor: isCurrentUser ? 'primary.main' : 'divider',
        backgroundColor: isCurrentUser ? 'primary.light' : 'background.paper',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Position Badge */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: rankColor.bg,
          color: rankColor.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: item.position <= 3 ? '1.2rem' : '1rem',
          boxShadow: item.position <= 3 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        {item.position <= 3 ? ['🥇', '🥈', '🥉'][item.position - 1] : item.position}
      </Box>

      {/* User Info */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {item.name}
          {isCurrentUser && (
            <Chip size="small" label="Você" color="primary" sx={{ ml: 1, fontSize: '0.65rem' }} />
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.career_level} • {item.badges_count} badges
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="h6" fontWeight={700} color="primary.main">
          {item.atingimento}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.total_points} pts
        </Typography>
      </Box>

      {/* Streak */}
      {item.streak_months > 0 && (
        <Tooltip title={`${item.streak_months} meses consecutivos`}>
          <Chip
            icon={<FireIcon sx={{ color: '#f97316' }} />}
            label={item.streak_months}
            size="small"
            sx={{ 
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              fontWeight: 700,
            }}
          />
        </Tooltip>
      )}
    </MotionPaper>
  );
};

export default function GamificationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allBadges, setAllBadges] = useState({});
  const [userGamification, setUserGamification] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [awardDialogOpen, setAwardDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [badgesRes, gamificationRes, rankingRes] = await Promise.all([
        api.get('/gamification/badges'),
        api.get(`/gamification/user/${user.id}`),
        api.get('/gamification/ranking'),
      ]);
      
      setAllBadges(badgesRes.data);
      setUserGamification(gamificationRes.data);
      setRanking(rankingRes.data);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      toast.error('Erro ao carregar dados de gamificação');
    } finally {
      setLoading(false);
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedBadge || !selectedUser) return;
    
    try {
      await api.post(`/gamification/award-badge/${selectedUser.user_id}?badge_id=${selectedBadge}`);
      toast.success('🏆 Badge concedida com sucesso!');
      setAwardDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao conceder badge');
    }
  };

  const earnedBadgeIds = userGamification?.badges?.map(b => b.badge_id) || [];
  const myRanking = ranking.find(r => r.user_id === user.id);

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
      <Box sx={{ pb: 4 }} data-testid="gamification-page">
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            🎮 Gamificação
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Conquiste badges, acumule pontos e suba no ranking!
          </Typography>
        </Box>

        {/* My Stats Summary */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.9 }}>
                    Minha Posição
                  </Typography>
                  <Typography variant="h3" fontWeight={800}>
                    #{myRanking?.position || '-'}
                  </Typography>
                </Box>
                <RankingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.9 }}>
                    Total de Pontos
                  </Typography>
                  <Typography variant="h3" fontWeight={800}>
                    {userGamification?.total_points || 0}
                  </Typography>
                </Box>
                <StarIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.9 }}>
                    Badges Conquistadas
                  </Typography>
                  <Typography variant="h3" fontWeight={800}>
                    {earnedBadgeIds.length}/{Object.keys(allBadges).length}
                  </Typography>
                </Box>
                <BadgeIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.9 }}>
                    Sequência
                  </Typography>
                  <Typography variant="h3" fontWeight={800}>
                    {userGamification?.streak_months || 0} 🔥
                  </Typography>
                </Box>
                <FireIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </MotionPaper>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="fullWidth"
          >
            <Tab icon={<TrophyIcon />} label="Ranking" />
            <Tab icon={<BadgeIcon />} label="Badges" />
            {user?.role === 'admin' && <Tab icon={<RewardIcon />} label="Premiar" />}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Ranking Tab */}
          {activeTab === 0 && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                  🏆 Ranking Mensal
                </Typography>
                {ranking.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Nenhum vendedor no ranking ainda
                  </Typography>
                ) : (
                  ranking.map((item, index) => (
                    <RankingRow
                      key={item.user_id}
                      item={item}
                      index={index}
                      isCurrentUser={item.user_id === user.id}
                    />
                  ))
                )}
              </Paper>
            </motion.div>
          )}

          {/* Badges Tab */}
          {activeTab === 1 && (
            <motion.div
              key="badges"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                  🎖️ Coleção de Badges
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(allBadges).map(([id, badge]) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={id}>
                      <BadgeCard
                        badge={badge}
                        earned={earnedBadgeIds.includes(id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          )}

          {/* Award Tab (Admin Only) */}
          {activeTab === 2 && user?.role === 'admin' && (
            <motion.div
              key="award"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} mb={3}>
                      🎁 Conceder Badge
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Selecione um vendedor do ranking para conceder uma badge manualmente.
                    </Typography>
                    <List>
                      {ranking.slice(0, 10).map((item) => (
                        <ListItem
                          key={item.user_id}
                          button
                          onClick={() => {
                            setSelectedUser(item);
                            setAwardDialogOpen(true);
                          }}
                          sx={{
                            borderRadius: 1,
                            mb: 1,
                            '&:hover': { backgroundColor: 'action.hover' },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {item.name?.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={item.name}
                            secondary={`${item.career_level} • ${item.total_points} pts`}
                          />
                          <Chip
                            size="small"
                            label={`#${item.position}`}
                            color="primary"
                            variant="outlined"
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} mb={3}>
                      📊 Estatísticas de Badges
                    </Typography>
                    {Object.entries(allBadges).map(([id, badge]) => (
                      <Box
                        key={id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6">{badge.icon}</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {badge.name}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`+${badge.points} pts`}
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Award Badge Dialog */}
        <Dialog open={awardDialogOpen} onClose={() => setAwardDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Conceder Badge para {selectedUser?.name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Selecione a badge que deseja conceder:
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(allBadges).map(([id, badge]) => (
                <Grid item xs={6} key={id}>
                  <Paper
                    onClick={() => setSelectedBadge(id)}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedBadge === id ? 'primary.main' : 'transparent',
                      '&:hover': { borderColor: 'primary.light' },
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h4">{badge.icon}</Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {badge.name}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAwardDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleAwardBadge}
              variant="contained"
              disabled={!selectedBadge}
            >
              Conceder Badge
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
