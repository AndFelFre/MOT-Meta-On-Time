import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { toast } from 'sonner';
import { Target, TrendingDown } from 'lucide-react';

export default function ForecastPage() {
  const { user } = useAuth();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    qualificacao: 0,
    proposta: 0,
    novo_cliente: 0,
    novo_ativo: 0
  });

  useEffect(() => {
    fetchForecast();
  }, [user]);

  const fetchForecast = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await api.get(`/forecast/${user.id}/${currentMonth}`);
      setForecast(response.data);
      setFormData({
        qualificacao: response.data.qualificacao,
        proposta: response.data.proposta,
        novo_cliente: response.data.novo_cliente,
        novo_ativo: response.data.novo_ativo
      });
    } catch (error) {
      console.error('Error fetching forecast:', error);
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
      const response = await api.put(`/forecast/${user.id}/${currentMonth}`, formData);
      setForecast(response.data);
      toast.success('✅ Forecast atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar forecast');
    } finally {
      setSaving(false);
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
            Forecast de Vendas
          </h1>
          <p className="text-slate-600">Funil de conversão e previsões</p>
        </div>

        {/* Funnel Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-l-4 border-l-accent-info" data-testid="funnel-qualificacao">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs uppercase tracking-widest text-slate-500">Qualificação</p>
              <Target className="h-5 w-5 text-accent-info" />
            </div>
            <p className="text-3xl font-bold font-heading text-slate-900">{forecast?.qualificacao || 0}</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-accent-success" data-testid="funnel-proposta">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs uppercase tracking-widest text-slate-500">Proposta</p>
              <TrendingDown className="h-5 w-5 text-accent-success" />
            </div>
            <p className="text-3xl font-bold font-heading text-slate-900">{forecast?.proposta || 0}</p>
            {forecast?.conv_qualif_proposta > 0 && (
              <p className="text-xs text-slate-500 mt-1">{forecast.conv_qualif_proposta.toFixed(1)}% de conversão</p>
            )}
          </Card>

          <Card className="p-6 border-l-4 border-l-accent-warning" data-testid="funnel-cliente">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs uppercase tracking-widest text-slate-500">Novo Cliente</p>
              <TrendingDown className="h-5 w-5 text-accent-warning" />
            </div>
            <p className="text-3xl font-bold font-heading text-slate-900">{forecast?.novo_cliente || 0}</p>
            {forecast?.conv_proposta_cliente > 0 && (
              <p className="text-xs text-slate-500 mt-1">{forecast.conv_proposta_cliente.toFixed(1)}% de conversão</p>
            )}
          </Card>

          <Card className="p-6 border-l-4 border-l-accent-danger" data-testid="funnel-ativo">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs uppercase tracking-widest text-slate-500">Novo Ativo</p>
              <TrendingDown className="h-5 w-5 text-accent-danger" />
            </div>
            <p className="text-3xl font-bold font-heading text-slate-900">{forecast?.novo_ativo || 0}</p>
            {forecast?.conv_cliente_ativo > 0 && (
              <p className="text-xs text-slate-500 mt-1">{forecast.conv_cliente_ativo.toFixed(1)}% de conversão</p>
            )}
          </Card>
        </div>

        {/* Edit Form */}
        {user.role === 'admin' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">Atualizar Dados</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <Label htmlFor="qualificacao">Qualificação</Label>
                <Input
                  id="qualificacao"
                  type="number"
                  min="0"
                  value={formData.qualificacao}
                  onChange={(e) => setFormData({...formData, qualificacao: parseInt(e.target.value) || 0})}
                  data-testid="input-qualificacao"
                />
              </div>
              <div>
                <Label htmlFor="proposta">Proposta</Label>
                <Input
                  id="proposta"
                  type="number"
                  min="0"
                  value={formData.proposta}
                  onChange={(e) => setFormData({...formData, proposta: parseInt(e.target.value) || 0})}
                  data-testid="input-proposta"
                />
              </div>
              <div>
                <Label htmlFor="novo_cliente">Novo Cliente</Label>
                <Input
                  id="novo_cliente"
                  type="number"
                  min="0"
                  value={formData.novo_cliente}
                  onChange={(e) => setFormData({...formData, novo_cliente: parseInt(e.target.value) || 0})}
                  data-testid="input-cliente"
                />
              </div>
              <div>
                <Label htmlFor="novo_ativo">Novo Ativo</Label>
                <Input
                  id="novo_ativo"
                  type="number"
                  min="0"
                  value={formData.novo_ativo}
                  onChange={(e) => setFormData({...formData, novo_ativo: parseInt(e.target.value) || 0})}
                  data-testid="input-ativo"
                />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} data-testid="save-forecast-btn">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-6 bg-slate-50">
          <h3 className="text-lg font-semibold font-heading text-slate-900 mb-3">Sobre o Forecast</h3>
          <p className="text-sm text-slate-600 mb-4">
            O Forecast permite visualizar o funil de vendas completo, desde a qualificação inicial até o novo ativo gerado.
            As taxas de conversão são calculadas automaticamente entre cada etapa.
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• <strong>Qualificação:</strong> Leads qualificados para contato</li>
            <li>• <strong>Proposta:</strong> Propostas comerciais enviadas</li>
            <li>• <strong>Novo Cliente:</strong> Clientes que fecharam contrato</li>
            <li>• <strong>Novo Ativo:</strong> Ativos efetivamente gerados</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}