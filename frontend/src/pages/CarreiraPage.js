import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Award, Clock } from 'lucide-react';

export default function CarreiraPage() {
  const { user } = useAuth();

  const careerLevels = [
    {
      level: 'Recruta',
      requirements: 'Entrada na empresa',
      tpv_min: 0,
      time_min: 0,
      benefits: 'Salário base + comissões'
    },
    {
      level: 'Aspirante',
      requirements: 'TPV Carteira ≥ R$ 50k + 3 meses',
      tpv_min: 50000,
      time_min: 3,
      benefits: 'Salário base + comissões + bônus 10%'
    },
    {
      level: 'Consultor',
      requirements: 'TPV Carteira ≥ R$ 150k + 6 meses',
      tpv_min: 150000,
      time_min: 6,
      benefits: 'Salário base + comissões + bônus 15%'
    },
    {
      level: 'Senior',
      requirements: 'TPV Carteira ≥ R$ 300k + 12 meses',
      tpv_min: 300000,
      time_min: 12,
      benefits: 'Salário base + comissões + bônus 20% + participação'
    },
    {
      level: 'Master',
      requirements: 'TPV Carteira ≥ R$ 500k + 18 meses',
      tpv_min: 500000,
      time_min: 18,
      benefits: 'Salário base + comissões + bônus 25% + participação + carro'
    }
  ];

  const currentLevelIndex = careerLevels.findIndex(l => l.level === user?.career_level);
  const nextLevel = currentLevelIndex < careerLevels.length - 1 ? careerLevels[currentLevelIndex + 1] : null;

  const tpvProgress = nextLevel ? Math.min((user?.active_base * 1000 || 0) / nextLevel.tpv_min * 100, 100) : 100;
  const timeProgress = nextLevel ? Math.min((user?.time_in_company || 0) / nextLevel.time_min * 100, 100) : 100;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight mb-2">
            Plano de Carreira
          </h1>
          <p className="text-slate-600">Acompanhe sua evolução profissional</p>
        </div>

        {/* Current Level */}
        <Card className="p-8 border-2 border-slate-900 bg-slate-50" data-testid="current-level-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Nível Atual</p>
              <h2 className="text-4xl font-bold font-heading text-slate-900">{user?.career_level}</h2>
            </div>
            <Award className="h-16 w-16 text-slate-900" />
          </div>
          <p className="text-slate-600">{careerLevels[currentLevelIndex]?.benefits}</p>
        </Card>

        {/* Progress to Next Level */}
        {nextLevel && (
          <Card className="p-6">
            <h3 className="text-xl font-bold font-heading text-slate-900 mb-6">Progresso para {nextLevel.level}</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-accent-info" />
                    <span className="text-sm font-semibold text-slate-900">TPV Carteira</span>
                  </div>
                  <span className="text-sm text-slate-600">
                    R$ {((user?.active_base || 0) * 1000).toLocaleString('pt-BR')} / R$ {nextLevel.tpv_min.toLocaleString('pt-BR')}
                  </span>
                </div>
                <Progress value={tpvProgress} className="h-3" />
                <p className="text-xs text-slate-500 mt-1">{tpvProgress.toFixed(0)}% completo</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-accent-warning" />
                    <span className="text-sm font-semibold text-slate-900">Tempo na Empresa</span>
                  </div>
                  <span className="text-sm text-slate-600">
                    {user?.time_in_company || 0} / {nextLevel.time_min} meses
                  </span>
                </div>
                <Progress value={timeProgress} className="h-3" />
                <p className="text-xs text-slate-500 mt-1">{timeProgress.toFixed(0)}% completo</p>
              </div>
            </div>
          </Card>
        )}

        {/* Career Levels */}
        <div>
          <h3 className="text-2xl font-bold font-heading text-slate-900 mb-6">Todos os Níveis</h3>
          <div className="space-y-4">
            {careerLevels.map((level, index) => (
              <Card
                key={level.level}
                className={`p-6 ${
                  level.level === user?.career_level
                    ? 'border-2 border-slate-900 bg-slate-50'
                    : index < currentLevelIndex
                    ? 'border border-accent-success bg-accent-success/5'
                    : 'border border-slate-200'
                }`}
                data-testid={`career-level-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-bold font-heading text-slate-900">{level.level}</h4>
                      {level.level === user?.career_level && (
                        <span className="px-2 py-1 bg-slate-900 text-white text-xs font-semibold rounded">ATUAL</span>
                      )}
                      {index < currentLevelIndex && (
                        <span className="px-2 py-1 bg-accent-success text-white text-xs font-semibold rounded">COMPLETO</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{level.requirements}</p>
                    <p className="text-sm text-slate-700 font-medium">{level.benefits}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}