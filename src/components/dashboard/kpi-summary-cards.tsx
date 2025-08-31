import type { Kpi } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle, ListTodo } from 'lucide-react';

type KpiSummaryCardsProps = {
  kpis: Kpi[];
};

export default function KpiSummaryCards({ kpis }: KpiSummaryCardsProps) {
  const totalKpis = kpis.length;
  const onTrack = kpis.filter((kpi) => kpi.status === 'On Track').length;
  const atRisk = kpis.filter((kpi) => kpi.status === 'At Risk').length;
  const offTrack = kpis.filter((kpi) => kpi.status === 'Off Track' && kpi.progress > 0).length;

  const summaryData = [
    { title: 'Total KPIs', value: totalKpis, icon: ListTodo, color: 'text-blue-400', progressColor: 'from-blue-500 to-blue-400' },
    { title: 'On Track', value: onTrack, icon: CheckCircle2, color: 'text-green-400', progressColor: 'from-green-500 to-green-400' },
    { title: 'At Risk', value: atRisk, icon: AlertTriangle, color: 'text-yellow-400', progressColor: 'from-yellow-500 to-yellow-400' },
    { title: 'Off Track', value: offTrack, icon: XCircle, color: 'text-red-400', progressColor: 'from-red-500 to-red-400' },
  ];

  const getPercentage = (value: number) => {
    if (totalKpis === 0) return 0;
    return Math.round((value / totalKpis) * 100);
  };

  return (
    <>
      {summaryData.map((item, index) => (
        <div key={index} className="kpi-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">{item.title}</p>
              <p className={`text-4xl font-bold text-white mt-2 font-orbitron ${item.color}`}>{item.value}</p>
               {item.title !== 'Total KPIs' && (
                <div className={`flex items-center text-sm mt-3 ${item.color}`}>
                  <item.icon className="mr-2" />
                  <span className="font-semibold">{getPercentage(item.value)}% of total</span>
                </div>
               )}
            </div>
            <div className={`w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg ${item.progressColor.split(' ')[0]}`} style={{ animation: 'pulseGlow 2s ease infinite' }}>
              <item.icon className="text-white text-2xl" />
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className={`bg-gradient-to-r h-2 rounded-full ${item.progressColor}`} style={{ width: `${item.title === 'Total KPIs' ? 100 : getPercentage(item.value)}%` }}></div>
          </div>
        </div>
      ))}
    </>
  );
}
