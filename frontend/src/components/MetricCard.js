import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const MetricCard = ({ metric }) => {
  const farolColors = {
    green: 'bg-accent-success',
    yellow: 'bg-accent-warning',
    red: 'bg-accent-danger'
  };

  return (
    <Card className="p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">KPI</p>
          <h3 className="text-lg font-semibold font-heading text-slate-900">{metric.name}</h3>
        </div>
        <div className={`w-3 h-3 rounded-full ${farolColors[metric.farol]}`} data-testid={`farol-${metric.farol}`} />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-500">Meta</span>
          <span className="text-sm font-semibold text-slate-700">{metric.meta}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-500">Realizado</span>
          <span className="text-sm font-semibold text-slate-900">{metric.realizado}</span>
        </div>

        <Progress value={Math.min(metric.atingimento, 100)} className="h-2" />

        <div className="flex justify-between items-baseline pt-2">
          <span className="text-xs text-slate-500">Atingimento</span>
          <span className="text-lg font-bold font-heading text-slate-900">{metric.atingimento.toFixed(1)}%</span>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-500">Peso: {(metric.peso * 100).toFixed(0)}%</span>
            <span className="text-sm font-semibold text-slate-900">
              Final: {(metric.atingimentoFinal * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};