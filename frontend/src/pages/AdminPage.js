import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { toast } from 'sonner';
import { Users, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({});
  const [showKpiDialog, setShowKpiDialog] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openKpiDialog = async (selectedUser) => {
    setSelectedUser(selectedUser);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await api.get(`/kpis/${selectedUser.id}/${currentMonth}`);
      setKpiData({
        novos_ativos_realizado: response.data.novos_ativos_realizado,
        churn_realizado: response.data.churn_realizado,
        tpv_m1_realizado: response.data.tpv_m1_realizado,
        ativos_m1_realizado: response.data.ativos_m1_realizado,
        migracao_hunter_realizado: response.data.migracao_hunter_realizado
      });
      setShowKpiDialog(true);
    } catch (error) {
      toast.error('Erro ao carregar KPIs');
    }
  };

  const handleSaveKpi = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      await api.put(`/kpis/${selectedUser.id}/${currentMonth}`, kpiData);
      toast.success('✅ KPIs atualizados com sucesso!');
      setShowKpiDialog(false);
    } catch (error) {
      toast.error('Erro ao atualizar KPIs');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">Acesso negado</p>
        </div>
      </DashboardLayout>
    );
  }

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
            Administração
          </h1>
          <p className="text-slate-600">Gerencie usuários e metas</p>
        </div>

        <Card className="p-6 border-l-4 border-l-accent-info" data-testid="total-users-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Total de Usuários</p>
              <p className="text-3xl font-bold font-heading text-slate-900">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-accent-info" />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">Usuários</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Nome</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Cargo</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Nível</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-4 px-4 text-slate-600">{u.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{u.career_level}</td>
                    <td className="py-4 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openKpiDialog(u)}
                        data-testid={`edit-kpi-btn-${u.id}`}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar KPIs
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={showKpiDialog} onOpenChange={setShowKpiDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar KPIs - {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="novos_ativos">Novos Ativos (Realizado)</Label>
              <Input
                id="novos_ativos"
                type="number"
                value={kpiData.novos_ativos_realizado || 0}
                onChange={(e) => setKpiData({...kpiData, novos_ativos_realizado: parseInt(e.target.value) || 0})}
                data-testid="kpi-novos-ativos-input"
              />
            </div>
            <div>
              <Label htmlFor="churn">Churn % (Realizado)</Label>
              <Input
                id="churn"
                type="number"
                step="0.1"
                value={kpiData.churn_realizado || 0}
                onChange={(e) => setKpiData({...kpiData, churn_realizado: parseFloat(e.target.value) || 0})}
                data-testid="kpi-churn-input"
              />
            </div>
            <div>
              <Label htmlFor="tpv_m1">TPV M1 (Realizado)</Label>
              <Input
                id="tpv_m1"
                type="number"
                value={kpiData.tpv_m1_realizado || 0}
                onChange={(e) => setKpiData({...kpiData, tpv_m1_realizado: parseFloat(e.target.value) || 0})}
                data-testid="kpi-tpv-input"
              />
            </div>
            <div>
              <Label htmlFor="ativos_m1">Ativos M1 (Realizado)</Label>
              <Input
                id="ativos_m1"
                type="number"
                value={kpiData.ativos_m1_realizado || 0}
                onChange={(e) => setKpiData({...kpiData, ativos_m1_realizado: parseInt(e.target.value) || 0})}
                data-testid="kpi-ativos-m1-input"
              />
            </div>
            <div>
              <Label htmlFor="migracao">Migração Hunter % (Realizado)</Label>
              <Input
                id="migracao"
                type="number"
                step="0.1"
                value={kpiData.migracao_hunter_realizado || 0}
                onChange={(e) => setKpiData({...kpiData, migracao_hunter_realizado: parseFloat(e.target.value) || 0})}
                data-testid="kpi-migracao-input"
              />
            </div>
            <Button onClick={handleSaveKpi} className="w-full" data-testid="save-kpi-btn">
              Salvar KPIs
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}