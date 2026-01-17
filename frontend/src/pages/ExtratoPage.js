import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { FileText } from 'lucide-react';

export default function ExtratoPage() {
  const { user } = useAuth();
  const [extrato, setExtrato] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExtrato();
  }, [user]);

  const fetchExtrato = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await api.get(`/extrato/${user.id}/${currentMonth}`);
      setExtrato(response.data);
    } catch (error) {
      console.error('Error fetching extrato:', error);
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-2">
            Extrato do Agente
          </h1>
          <p className="text-slate-600">Histórico e relatórios detalhados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6" data-testid="bonus-time-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Bônus Time</p>
                <p className="text-3xl font-bold font-heading text-slate-900">
                  R$ {extrato?.bonus_time?.toFixed(2) || '0,00'}
                </p>
              </div>
              <FileText className="h-8 w-8 text-accent-info" />
            </div>
          </Card>

          <Card className="p-6" data-testid="bonus-rentabilizacao-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Bônus Rentabilização</p>
                <p className="text-3xl font-bold font-heading text-slate-900">
                  R$ {extrato?.bonus_rentabilizacao?.toFixed(2) || '0,00'}
                </p>
              </div>
              <FileText className="h-8 w-8 text-accent-success" />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">Histórico Semestral</h2>
          {extrato?.historico_semestral?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Mês</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Atingimento</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Bônus</th>
                  </tr>
                </thead>
                <tbody>
                  {extrato.historico_semestral.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-900">{item.month}</td>
                      <td className="py-4 px-4 text-slate-600">{item.atingimento}%</td>
                      <td className="py-4 px-4 text-slate-600">R$ {item.bonus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Nenhum histórico disponível</p>
          )}
        </Card>

        <Card className="p-6 bg-slate-50">
          <h3 className="text-lg font-semibold font-heading text-slate-900 mb-3">Sobre o Extrato</h3>
          <p className="text-sm text-slate-600">
            O extrato do agente apresenta um resumo detalhado das bonificações recebidas,
            incluindo bônus por performance individual (Time) e bônus por rentabilização
            da carteira. O histórico semestral permite acompanhar a evolução ao longo do tempo.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}