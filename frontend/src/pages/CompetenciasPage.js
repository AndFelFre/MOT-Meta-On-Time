import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { toast } from 'sonner';
import { Award } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function CompetenciasPage() {
  const { user } = useAuth();
  const [competencias, setCompetencias] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    persistencia: 3,
    influencia: 3,
    relacionamento: 3,
    organizacao: 3,
    criatividade: 3
  });

  useEffect(() => {
    fetchCompetencias();
  }, [user]);

  const fetchCompetencias = async () => {
    try {
      const response = await api.get(`/competencias/${user.id}`);
      setCompetencias(response.data);
      setFormData({
        persistencia: response.data.persistencia,
        influencia: response.data.influencia,
        relacionamento: response.data.relacionamento,
        organizacao: response.data.organizacao,
        criatividade: response.data.criatividade
      });
    } catch (error) {
      console.error('Error fetching competencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put(`/competencias/${user.id}`, formData);
      setCompetencias(response.data);
      toast.success('✅ Competências atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar competências');
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

  const radarData = [
    { competencia: 'Persistência', value: formData.persistencia },
    { competencia: 'Influência', value: formData.influencia },
    { competencia: 'Relacionamento', value: formData.relacionamento },
    { competencia: 'Organização', value: formData.organizacao },
    { competencia: 'Criatividade', value: formData.criatividade }
  ];

  const media = competencias?.media || 3.0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-2">
            Avaliação de Competências (ADV)
          </h1>
          <p className="text-slate-600">Autoavaliação de habilidades profissionais</p>
        </div>

        <Card className="p-8 border-l-4 border-l-accent-success" data-testid="media-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Média Geral</p>
              <p className="text-5xl font-bold font-heading text-slate-900">{media.toFixed(1)}</p>
              <p className="text-sm text-slate-600 mt-2">de 5.0</p>
            </div>
            <Award className="h-12 w-12 text-accent-success" />
          </div>
        </Card>

        {/* Radar Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">Radar de Competências</h2>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="competencia" tick={{ fill: '#64748B', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#64748B' }} />
              <Radar name="Nível" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Evaluation Form */}
        <Card className="p-6">
          <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">Avalie suas Competências</h2>
          <div className="space-y-8">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold text-slate-900 capitalize">{key}</Label>
                  <span className="text-2xl font-bold font-heading text-slate-900">{formData[key]}</span>
                </div>
                <Slider
                  value={[formData[key]]}
                  onValueChange={(value) => setFormData({...formData, [key]: value[0]})}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                  data-testid={`slider-${key}`}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-500">1 - Baixo</span>
                  <span className="text-xs text-slate-500">5 - Alto</span>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleSave} disabled={saving} className="mt-6" data-testid="save-competencias-btn">
            {saving ? 'Salvando...' : 'Salvar Avaliação'}
          </Button>
        </Card>

        <Card className="p-6 bg-slate-50">
          <h3 className="text-lg font-semibold font-heading text-slate-900 mb-3">Sobre as Competências</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• <strong>Persistência:</strong> Capacidade de manter o foco e superar obstáculos</li>
            <li>• <strong>Influência:</strong> Habilidade de persuadir e inspirar outras pessoas</li>
            <li>• <strong>Relacionamento:</strong> Facilidade em criar e manter conexões</li>
            <li>• <strong>Organização:</strong> Gestão eficaz de tempo e recursos</li>
            <li>• <strong>Criatividade:</strong> Capacidade de encontrar soluções inovadoras</li>
          </ul>
          <p className="text-sm text-slate-600 mt-4">
            A média das competências é considerada em processos de promoção e desenvolvimento de carreira.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}