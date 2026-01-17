import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { formatCurrency } from '@/utils/helpers';
import { toast } from 'sonner';
import { DollarSign } from 'lucide-react';

export default function BonusPage() {
  const { user } = useAuth();
  const [bonus, setBonus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faixas, setFaixas] = useState([]);

  useEffect(() => {
    fetchBonus();
  }, [user]);

  const fetchBonus = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await api.get(`/bonus/${user.id}/${currentMonth}`);
      setBonus(response.data);
      setFaixas(response.data.faixas);
    } catch (error) {
      console.error('Error fetching bonus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (user.role !== 'admin') {
      toast.error('Apenas administradores podem editar');
      return;
    }

    setSaving(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await api.put(`/bonus/${user.id}/${currentMonth}`, { faixas });
      setBonus(response.data);
      toast.success('✅ Bonificação atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar bonificação');
    } finally {
      setSaving(false);
    }
  };

  const updateFaixa = (index, value) => {
    const newFaixas = [...faixas];
    newFaixas[index].clients_count = parseInt(value) || 0;
    setFaixas(newFaixas);
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

  const bonusTotal = faixas.reduce((sum, f) => sum + (f.bonus_per_client * f.clients_count), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-2">
            Sistema de Bonificação TPV
          </h1>
          <p className="text-slate-600">Gerencie suas faixas de bonificação por TPV</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-l-4 border-l-accent-info" data-testid="bonus-total-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Bônus Bruto</p>
                <p className="text-3xl font-bold font-heading text-slate-900">{formatCurrency(bonusTotal)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent-info" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-accent-warning">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Multiplicador</p>
              <p className="text-3xl font-bold font-heading text-slate-900">{bonus?.multiplicador.toFixed(1)}x</p>
              <p className="text-xs text-slate-500 mt-2">Baseado no atingimento de metas</p>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-accent-success" data-testid="bonus-final-card">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Bônus Final</p>
              <p className="text-3xl font-bold font-heading text-slate-900">{formatCurrency(bonus?.bonus_final || 0)}</p>
              <p className="text-xs text-slate-500 mt-2">Cap: 200% do salário base</p>
            </div>
          </Card>
        </div>

        {/* Faixas Table */}
        <Card className="p-6">
          <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">Faixas de Bonificação</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Faixa</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">TPV Mínimo</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Bônus/Cliente</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Meta Mín</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Clientes</th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {faixas.map((faixa, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{faixa.faixa}</td>
                    <td className="py-4 px-4 text-slate-600">{formatCurrency(faixa.tpv_min)}</td>
                    <td className="py-4 px-4 text-slate-600">{formatCurrency(faixa.bonus_per_client)}</td>
                    <td className="py-4 px-4 text-slate-600">{faixa.meta_min_clients}</td>
                    <td className="py-4 px-4">
                      <Input
                        type="number"
                        min="0"
                        value={faixa.clients_count}
                        onChange={(e) => updateFaixa(index, e.target.value)}
                        className="w-20"
                        disabled={user.role !== 'admin'}
                        data-testid={`clients-input-${index}`}
                      />
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(faixa.bonus_per_client * faixa.clients_count)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan="5" className="py-4 px-4 text-right text-slate-900">Total:</td>
                  <td className="py-4 px-4 text-right text-slate-900">{formatCurrency(bonusTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {user.role === 'admin' && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} disabled={saving} data-testid="save-bonus-btn">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-slate-50">
          <h3 className="text-lg font-semibold font-heading text-slate-900 mb-3">Como Funciona</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• O bônus total é calculado pela soma de clientes em cada faixa multiplicado pelo valor</li>
            <li>• O multiplicador varia de acordo com o atingimento de metas: 1x (≥65%), 0.8x (80-99%), 0x (&lt;80%)</li>
            <li>• O bônus final tem um limite (cap) de 200% do salário base</li>
            <li>• Cada faixa possui uma meta mínima de clientes para ser considerada</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}