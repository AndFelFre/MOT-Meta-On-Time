import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const PerformanceChart = ({ sellers }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Categorize sellers by performance
  const excellent = sellers.filter((s) => s.atingimento >= 100).length;
  const good = sellers.filter((s) => s.atingimento >= 80 && s.atingimento < 100).length;
  const regular = sellers.filter((s) => s.atingimento >= 60 && s.atingimento < 80).length;
  const critical = sellers.filter((s) => s.atingimento < 60).length;

  const doughnutData = {
    labels: ['Excelente (≥100%)', 'Bom (80-99%)', 'Regular (60-79%)', 'Crítico (<60%)'],
    datasets: [
      {
        data: [excellent, good, regular, critical],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main,
          theme.palette.error.main,
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#fff' : '#333',
          padding: 15,
          usePointStyle: true,
        },
      },
    },
    cutout: '65%',
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        height: '100%',
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2}>
        Distribuição de Performance
      </Typography>
      <Box sx={{ height: 280 }}>
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </Box>
    </Paper>
  );
};

export const KPIComparisonChart = ({ sellers }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Get top 10 sellers sorted by performance
  const topSellers = [...sellers]
    .sort((a, b) => (b.atingimento || 0) - (a.atingimento || 0))
    .slice(0, 10);

  const barData = {
    labels: topSellers.map((s) => s.name?.split(' ')[0] || 'N/A'),
    datasets: [
      {
        label: 'Atingimento %',
        data: topSellers.map((s) => s.atingimento || 0),
        backgroundColor: topSellers.map((s) =>
          s.atingimento >= 100
            ? theme.palette.success.main
            : s.atingimento >= 80
            ? theme.palette.warning.main
            : theme.palette.error.main
        ),
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#aaa' : '#666',
        },
      },
      y: {
        beginAtZero: true,
        max: 150,
        grid: {
          color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
        ticks: {
          color: isDark ? '#aaa' : '#666',
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        height: '100%',
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2}>
        Ranking de Atingimento
      </Typography>
      <Box sx={{ height: 280 }}>
        <Bar data={barData} options={barOptions} />
      </Box>
    </Paper>
  );
};

export const TPVChart = ({ sellers }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Get sellers with TPV data
  const sellersWithTPV = sellers
    .filter((s) => s.kpis?.tpv_m1_realizado > 0)
    .sort((a, b) => (b.kpis?.tpv_m1_realizado || 0) - (a.kpis?.tpv_m1_realizado || 0))
    .slice(0, 8);

  const barData = {
    labels: sellersWithTPV.map((s) => s.name?.split(' ')[0] || 'N/A'),
    datasets: [
      {
        label: 'TPV Realizado (R$)',
        data: sellersWithTPV.map((s) => (s.kpis?.tpv_m1_realizado || 0) / 1000),
        backgroundColor: theme.palette.primary.main,
        borderRadius: 6,
      },
      {
        label: 'Meta TPV (R$)',
        data: sellersWithTPV.map((s) => (s.kpis?.tpv_m1 || 0) / 1000),
        backgroundColor: theme.palette.grey[300],
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#fff' : '#333',
          usePointStyle: true,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#aaa' : '#666' },
      },
      y: {
        beginAtZero: true,
        grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        ticks: {
          color: isDark ? '#aaa' : '#666',
          callback: (value) => `${value}k`,
        },
      },
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        height: '100%',
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2}>
        TPV por Vendedor
      </Typography>
      <Box sx={{ height: 280 }}>
        <Bar data={barData} options={barOptions} />
      </Box>
    </Paper>
  );
};

export default { PerformanceChart, KPIComparisonChart, TPVChart };
