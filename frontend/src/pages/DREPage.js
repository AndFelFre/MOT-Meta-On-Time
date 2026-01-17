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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DREPage() {
  const { user } = useAuth();
  const [dreList, setDreList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7),
    salario: user?.base_salary || 1570,
    beneficios: 300,
    receita: 5000
  });

  useEffect(() => {
    fetchDRE();
  }, [user]);

  const fetchDRE = async () => {
    try {
      const response = await api.get(`/dre/${user.id}`);
      setDreList(response.data);
    } catch (error) {
      console.error('Error fetching DRE:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.role !== 'admin') {
      toast.error('Apenas administradores podem criar DRE');
      return;
    }

    try {
      await api.post(`/dre/${user.id}`, formData);
      toast.success('✅ DRE criado com sucesso!');
      setShowForm(false);
      fetchDRE();
    } catch (error) {
      toast.error('Erro ao criar DRE');
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

  const chartData = dreList.map(dre => ({
    mes: dre.month,
    receita: dre.receita,
    custos: dre.custos_totais,
    roi: dre.roi_percent
  }));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-2">
              DRE do Agente
            </h1>
            <p className="text-slate-600">Análise financeira e ROI</p>
          </div>
          {user.role === 'admin' && (
            <Button onClick={() => setShowForm(!showForm)} data-testid="toggle-form-btn">
              {showForm ? 'Cancelar' : 'Novo DRE'}
            </Button>
          )}
        </div>

        {showForm && user.role === 'admin' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">Criar Novo DRE</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Mês</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    required
                    data-testid="dre-month-input"
                  />
                </div>
                <div>
                  <Label htmlFor="salario">Salário (R$)</Label>
                  <Input
                    id="salario"
                    type="number"
                    step="0.01"
                    value={formData.salario}
                    onChange={(e) => setFormData({...formData, salario: parseFloat(e.target.value)})}
                    required
                    data-testid="dre-salario-input"
                  />
                </div>
                <div>
                  <Label htmlFor="beneficios">Benefícios (R$)</Label>
                  <Input
                    id="beneficios"
                    type="number"
                    step="0.01"
                    value={formData.beneficios}
                    onChange={(e) => setFormData({...formData, beneficios: parseFloat(e.target.value)})}
                    required
                    data-testid="dre-beneficios-input"
                  />
                </div>
                <div>
                  <Label htmlFor="receita">Receita (R$)</Label>
                  <Input
                    id="receita"
                    type="number"
                    step="0.01"
                    value={formData.receita}
                    onChange={(e) => setFormData({...formData, receita: parseFloat(e.target.value)})}
                    required
                    data-testid="dre-receita-input"
                  />
                </div>
              </div>
              <Button type="submit" data-testid="submit-dre-btn">Criar DRE</Button>
            </form>
          </Card>
        )}

        {dreList.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">Evolução Financeira</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mes" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.5rem' }}
                />
                <Bar dataKey="receita" fill="#10B981" name="Receita" />
                <Bar dataKey="custos" fill="#E11D48" name="Custos" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        <div className="space-y-4">
          {dreList.length > 0 ? (
            dreList.map((dre, index) => (
              <Card key={index} className="p-6" data-testid={`dre-card-${index}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold font-heading text-slate-900">{dre.month}</h3>
                  <span className={`px-3 py-1 rounded-md text-sm font-semibold ${
                    dre.roi_percent > 0 ? 'bg-accent-success text-white' : 'bg-accent-danger text-white'
                  }`}>
                    ROI: {dre.roi_percent.toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Salário</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(dre.salario)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Benefícios</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(dre.beneficios)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Receita</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(dre.receita)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Payback</p>
                    <p className="font-semibold text-slate-900">{dre.payback_months} meses</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12">
              <p className="text-slate-500 text-center">Nenhum DRE cadastrado ainda</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}