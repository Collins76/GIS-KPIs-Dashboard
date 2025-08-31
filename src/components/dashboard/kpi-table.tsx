
"use client";

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Role, KpiStatus, Kpi } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { KpiUpdateDialog } from './kpi-update-dialog';
import { Edit } from 'lucide-react';

type KpiTableProps = {
  kpiData: Kpi[];
  onKpiUpdate: (kpi: Kpi) => void;
  selectedRole: Role | 'All';
  setSelectedRole: (role: Role | 'All') => void;
  selectedStatus: KpiStatus | 'All';
  setSelectedStatus: (status: KpiStatus | 'All') => void;
  filteredKpis: Kpi[];
};

export default function KpiTable({
  onKpiUpdate,
  filteredKpis,
}: KpiTableProps) {
  const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);

  const handleProgressChange = (kpi: Kpi, newProgress: number) => {
    let newStatus: KpiStatus;
    if (newProgress > 75) newStatus = 'On Track';
    else if (newProgress > 40) newStatus = 'At Risk';
    else if (newProgress > 0) newStatus = 'Off Track';
    else newStatus = 'Not Started';

    onKpiUpdate({ ...kpi, progress: newProgress, status: newStatus });
  };
  
  const handleOpenDialog = (kpi: Kpi) => {
    setSelectedKpi(kpi);
  };
  
  const handleUpdate = (kpi: Kpi, progress: number) => {
    handleProgressChange(kpi, progress);
    setSelectedKpi(null);
  }

  const getStatusVariant = (status: KpiStatus) => {
    switch (status) {
      case 'On Track': return 'default';
      case 'At Risk': return 'secondary';
      case 'Off Track': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getProgressColor = (progress: number) => {
    if (progress > 75) return 'bg-green-500';
    if (progress > 40) return 'bg-yellow-500';
    if (progress > 0) return 'bg-red-500';
    return 'bg-gray-400';
  }

  return (
    <>
      <div className="glow-container p-6">
        <h2 className="text-2xl font-bold text-white mb-6">KPIs Status & Tracking</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">KPI</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKpis.length > 0 ? (
              filteredKpis.map(kpi => (
                <TableRow key={kpi.id}>
                  <TableCell className="font-medium">{kpi.title}</TableCell>
                  <TableCell>{kpi.role}</TableCell>
                  <TableCell>{kpi.category}</TableCell>
                  <TableCell onClick={() => handleOpenDialog(kpi)} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Progress value={kpi.progress} className="w-[80%] h-3" />
                      <span>{kpi.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(kpi.status)}>{kpi.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(kpi)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">No KPIs found for the selected filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {selectedKpi && (
        <KpiUpdateDialog
          kpi={selectedKpi}
          onUpdate={handleUpdate}
          onClose={() => setSelectedKpi(null)}
        />
      )}
    </>
  );
}
