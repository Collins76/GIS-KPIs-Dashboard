import type { Kpi } from '@/lib/types';
import { BarChart, CheckCircle2, AlertTriangle, Loader, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type KpiSummaryCardsProps = {
  kpis: Kpi[];
};

export default function KpiSummaryCards({ kpis }: KpiSummaryCardsProps) {
  const totalKpis = kpis.length;
  const completed = kpis.filter((kpi) => kpi.progress === 100).length;
  const inProgress = kpis.filter((kpi) => kpi.progress > 0 && kpi.progress < 100).length;
  const atRisk = kpis.filter((kpi) => kpi.status === 'At Risk' || kpi.status === 'Off Track').length;

  const getPercentage = (value: number) => {
    if (totalKpis === 0) return 0;
    return Math.round((value / totalKpis) * 100);
  };
  
  const summaryData = [
    { title: 'Total KPIs', value: totalKpis, icon: BarChart, color: 'text-blue-400', progressColor: 'bg-blue-500', subText: 'All Active', subIcon: TrendingUp },
    { title: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-400', progressColor: 'bg-green-500', subText: `${getPercentage(completed)}% Complete`, subIcon: CheckCircle2 },
    { title: 'In Progress', value: inProgress, icon: Loader, color: 'text-yellow-400', progressColor: 'bg-yellow-500', subText: `${getPercentage(inProgress)}% Ongoing`, subIcon: Loader },
    { title: 'At Risk', value: atRisk, icon: AlertTriangle, color: 'text-red-400', progressColor: 'bg-red-500', subText: `${getPercentage(atRisk)}% At Risk`, subIcon: AlertTriangle },
  ];

  return (
    <>
      {summaryData.map((item, index) => (
        <div key={index} className="kpi-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">{item.title}</p>
              <p className={`text-4xl font-bold text-white mt-2 font-orbitron`}>{item.value}</p>
               <div className={`flex items-center text-sm mt-3 ${item.color}`}>
                  <item.subIcon className={cn('mr-2 h-4 w-4', item.title === 'In Progress' && 'animate-spin')} />
                  <span className="font-semibold">{item.subText}</span>
                </div>
            </div>
            <div className={`w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg ${item.progressColor.replace('bg-', 'from-')}/50 ${item.progressColor.replace('bg-', 'to-')}/70`} style={{ animation: 'pulseGlow 2s ease infinite' }}>
              <item.icon className={cn('text-white text-3xl animate-float', item.title === 'In Progress' && 'animate-spin')} />
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${item.progressColor}`} 
              style={{ width: `${item.title === 'Total KPIs' ? 100 : getPercentage(item.value)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </>
  );
}
