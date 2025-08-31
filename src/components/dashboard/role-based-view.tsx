
"use client";

import type { Kpi, Role } from '@/lib/types';
import { roles } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleBasedViewProps {
  kpis: Kpi[];
}

export default function RoleBasedView({ kpis }: RoleBasedViewProps) {

  const getRoleStats = (role: Role) => {
    const roleKpis = kpis.filter(kpi => kpi.role === role);
    if (roleKpis.length === 0) {
      return {
        totalKpis: 0,
        overallProgress: 0,
        completed: 0,
        inProgress: 0,
        atRisk: 0,
      };
    }

    const totalProgress = roleKpis.reduce((sum, kpi) => sum + kpi.progress, 0);
    const overallProgress = totalProgress / roleKpis.length;

    const completed = roleKpis.filter(kpi => kpi.status === 'Completed').length;
    const inProgress = roleKpis.filter(kpi => kpi.status === 'On Track').length;
    const atRisk = roleKpis.filter(kpi => kpi.status === 'At Risk' || kpi.status === 'Off Track').length;

    return {
      totalKpis: roleKpis.length,
      overallProgress,
      completed,
      inProgress,
      atRisk,
    };
  };

  return (
    <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center font-orbitron">
            <Users className="mr-3 h-6 w-6 text-yellow-400"/>
            Role-Based KPI View
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map(role => {
          const stats = getRoleStats(role);
          return (
            <Card key={role} className="kpi-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold text-white font-orbitron">{role}</CardTitle>
                <Badge variant="secondary">{stats.totalKpis} KPIs</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400 mb-2 font-rajdhani">Overall Progress</div>
                <div className="flex items-center gap-4">
                    <Progress value={stats.overallProgress} className="h-3" />
                    <span className="font-bold font-orbitron text-white">{Math.round(stats.overallProgress)}%</span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center text-green-400">
                           <CheckCircle2 className="mr-2 h-4 w-4" />
                           <span>Completed</span>
                        </div>
                        <span className="font-bold text-white">{stats.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="flex items-center text-yellow-400">
                           <Loader className="mr-2 h-4 w-4 animate-spin" />
                           <span>In Progress</span>
                        </div>
                        <span className="font-bold text-white">{stats.inProgress}</span>
                    </div>
                     <div className="flex justify-between items-center">
                       <div className="flex items-center text-red-400">
                           <AlertTriangle className="mr-2 h-4 w-4 animate-pulse" />
                           <span>At Risk</span>
                        </div>
                        <span className="font-bold text-white">{stats.atRisk}</span>
                    </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
