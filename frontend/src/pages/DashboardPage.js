import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/MetricCard';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { calculateKPIMetrics } from '@/utils/helpers';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get(`/dashboard/${user.id}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData?.kpi) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">Dados não disponíveis</p>
        </div>
      </DashboardLayout>
    );
  }

  const { metrics, totalAtingimento } = calculateKPIMetrics(dashboardData.kpi);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-2">
            Olá, {user?.name}!
          </h1>
          <p className="text-slate-600">Acompanhe seu desempenho e metas</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-l-4 border-l-accent-success" data-testid="summary-atingimento">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Atingimento Total</p>
                <p className="text-3xl font-bold font-heading text-slate-900">{totalAtingimento.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent-success" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-accent-info" data-testid="summary-carreira">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Nível de Carreira</p>
                <p className="text-2xl font-bold font-heading text-slate-900">{user?.career_level}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent-info" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-accent-warning" data-testid="summary-bonus">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Bônus Estimado</p>
                <p className="text-2xl font-bold font-heading text-slate-900">
                  {dashboardData.bonus ? `R$ ${dashboardData.bonus.bonus_final.toFixed(2)}` : 'R$ 0,00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-accent-warning" />
            </div>
          </Card>
        </div>

        {/* KPIs Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Metas do Mês</h2>
            <p className="text-slate-600">KPIs individuais e performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>
        </div>

        {/* Total Atingimento Card */}
        <Card className="p-8 border-2 border-slate-900 bg-slate-50" data-testid="total-card">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Atingimento Final (Soma Ponderada)</p>
            <p className="text-5xl font-bold font-heading text-slate-900 mb-4">{totalAtingimento.toFixed(1)}%</p>
            <div className="flex items-center justify-center space-x-2">
              {totalAtingimento >= 100 && (
                <span className="px-4 py-2 bg-accent-success text-white text-sm font-semibold rounded-md">
                  Meta Atingida!
                </span>
              )}
              {totalAtingimento >= 80 && totalAtingimento < 100 && (
                <span className="px-4 py-2 bg-accent-warning text-white text-sm font-semibold rounded-md">
                  Quase lá!
                </span>
              )}
              {totalAtingimento < 80 && (
                <span className="px-4 py-2 bg-accent-danger text-white text-sm font-semibold rounded-md">
                  Precisa Melhorar
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}