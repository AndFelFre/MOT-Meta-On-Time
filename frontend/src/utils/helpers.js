export const calculateKPIMetrics = (kpi) => {
  const weights = {
    novos_ativos: 0.3,
    churn: 0.2,
    tpv_m1: 0.2,
    ativos_m1: 0.15,
    migracao_hunter: 0.15
  };

  const metrics = [];

  const novosAtivosAtingimento = kpi.novos_ativos_meta > 0 ? (kpi.novos_ativos_realizado / kpi.novos_ativos_meta) * 100 : 0;
  const novosAtivosFinal = (novosAtivosAtingimento / 100) * weights.novos_ativos;
  metrics.push({
    name: 'Novos Ativos',
    meta: kpi.novos_ativos_meta,
    realizado: kpi.novos_ativos_realizado,
    atingimento: novosAtivosAtingimento,
    peso: weights.novos_ativos,
    atingimentoFinal: novosAtivosFinal,
    farol: novosAtivosAtingimento >= 100 ? 'green' : novosAtivosAtingimento >= 80 ? 'yellow' : 'red'
  });

  const churnAtingimento = kpi.churn_meta > 0 ? (1 - (kpi.churn_realizado / kpi.churn_meta)) * 100 : 0;
  const churnFinal = Math.max(0, (churnAtingimento / 100) * weights.churn);
  metrics.push({
    name: 'Churn',
    meta: `${kpi.churn_meta}%`,
    realizado: `${kpi.churn_realizado}%`,
    atingimento: Math.max(0, churnAtingimento),
    peso: weights.churn,
    atingimentoFinal: churnFinal,
    farol: churnAtingimento >= 100 ? 'green' : churnAtingimento >= 80 ? 'yellow' : 'red',
    isInverse: true
  });

  const tpvAtingimento = kpi.tpv_m1_meta > 0 ? (kpi.tpv_m1_realizado / kpi.tpv_m1_meta) * 100 : 0;
  const tpvFinal = (tpvAtingimento / 100) * weights.tpv_m1;
  metrics.push({
    name: 'TPV M1',
    meta: `R$ ${(kpi.tpv_m1_meta / 1000).toFixed(0)}k`,
    realizado: `R$ ${(kpi.tpv_m1_realizado / 1000).toFixed(0)}k`,
    atingimento: tpvAtingimento,
    peso: weights.tpv_m1,
    atingimentoFinal: tpvFinal,
    farol: tpvAtingimento >= 100 ? 'green' : tpvAtingimento >= 80 ? 'yellow' : 'red'
  });

  const ativosM1Atingimento = kpi.ativos_m1_meta > 0 ? (kpi.ativos_m1_realizado / kpi.ativos_m1_meta) * 100 : 0;
  const ativosM1Final = (ativosM1Atingimento / 100) * weights.ativos_m1;
  metrics.push({
    name: 'Ativos M1',
    meta: kpi.ativos_m1_meta,
    realizado: kpi.ativos_m1_realizado,
    atingimento: ativosM1Atingimento,
    peso: weights.ativos_m1,
    atingimentoFinal: ativosM1Final,
    farol: ativosM1Atingimento >= 100 ? 'green' : ativosM1Atingimento >= 80 ? 'yellow' : 'red'
  });

  const migracaoAtingimento = kpi.migracao_hunter_meta > 0 ? (kpi.migracao_hunter_realizado / kpi.migracao_hunter_meta) * 100 : 0;
  const migracaoFinal = (migracaoAtingimento / 100) * weights.migracao_hunter;
  metrics.push({
    name: 'Migração Hunter +70%',
    meta: `${kpi.migracao_hunter_meta}%`,
    realizado: `${kpi.migracao_hunter_realizado}%`,
    atingimento: migracaoAtingimento,
    peso: weights.migracao_hunter,
    atingimentoFinal: migracaoFinal,
    farol: migracaoAtingimento >= 100 ? 'green' : migracaoAtingimento >= 80 ? 'yellow' : 'red'
  });

  const totalAtingimento = metrics.reduce((sum, m) => sum + (m.atingimentoFinal * 100), 0);

  return { metrics, totalAtingimento };
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};