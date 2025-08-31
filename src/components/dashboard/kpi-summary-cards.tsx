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
  const offTrack = kpis.filter((kpi) => kpi.status === 'Off Track').length;

  const summaryData = [
    { title: 'Total KPIs', value: totalKpis, icon: ListTodo, color: 'text-primary' },
    { title: 'On Track', value: onTrack, icon: CheckCircle2, color: 'text-green-500' },
    { title: 'At Risk', value: atRisk, icon: AlertTriangle, color: 'text-yellow-500' },
    { title: 'Off Track', value: offTrack, icon: XCircle, color: 'text-red-500' },
  ];

  return (
    <>
      {summaryData.map((item, index) => (
        <Card key={index} className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 text-muted-foreground ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            {totalKpis > 0 && item.title !== 'Total KPIs' ? (
                 <p className="text-xs text-muted-foreground">
                    {((item.value / totalKpis) * 100).toFixed(0)}% of total
                 </p>
            ) : item.title === 'Total KPIs' ? <p className="text-xs text-muted-foreground">KPIs for selected role</p> : <p className="text-xs text-muted-foreground">
              0% of total
            </p> }
          </CardContent>
        </Card>
      ))}
    </>
  );
}
