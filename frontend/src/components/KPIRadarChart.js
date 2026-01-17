import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme as useMuiTheme } from '@mui/material/styles';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const KPIRadarChart = ({ metrics }) => {
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === 'dark';

  const data = {
    labels: metrics.map((m) => m.name),
    datasets: [
      {
        label: 'Atingimento',
        data: metrics.map((m) => Math.min(m.atingimento, 200)),
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)',
        borderColor: theme.palette.secondary.main,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.secondary.main,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.palette.secondary.main,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: theme.palette.text.primary,
          font: {
            size: 11,
            weight: 600,
          },
        },
        ticks: {
          color: theme.palette.text.secondary,
          backdropColor: 'transparent',
          stepSize: 50,
        },
        suggestedMin: 0,
        suggestedMax: 150,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: isDark ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.r.toFixed(1)}%`,
        },
      },
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={3}>
        Radar de Performance
      </Typography>
      <Box height={300}>
        <Radar data={data} options={options} />
      </Box>
    </Paper>
  );
};
