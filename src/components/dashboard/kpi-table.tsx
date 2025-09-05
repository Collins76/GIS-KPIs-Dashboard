
"use client";

import { useState, useContext } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { KpiStatus, Kpi } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { KpiUpdateDialog } from './kpi-update-dialog';
import { Edit } from 'lucide-react';
import { format } from 'date-fns';
import { UserContext } from '@/context/user-context';
import { addKpiUpdateActivity } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';


type KpiTableProps = {
  onKpiUpdate: (kpi: Kpi) => void;
  filteredKpis: Kpi[];
};

export default function KpiTable({
  onKpiUpdate,
  filteredKpis,
}: KpiTableProps) {
  const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);
  const { user } = useContext(UserContext);
  const { toast } = useToast();

  const handleProgressChange = (kpi: Kpi, newProgress: number) => {
    let newStatus: KpiStatus;
    if (newProgress === 100) newStatus = 'Completed'
    else if (newProgress > 75) newStatus = 'On Track';
    else if (newProgress > 40) newStatus = 'At Risk';
    else if (newProgress > 0) newStatus = 'Off Track';
    else newStatus = 'Not Started';

    const updatedKpi = { ...kpi, progress: newProgress, status: newStatus };
    onKpiUpdate(updatedKpi);
    addKpiUpdateActivity(user, updatedKpi);
     toast({
      title: "KPI Updated & Logged",
      description: `Progress for "${updatedKpi.title}" is now ${updatedKpi.progress}%.`,
    });
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
      case 'Completed': return 'default';
      case 'On Track': return 'default';
      case 'At Risk': return 'secondary';
      case 'Off Track': return 'destructive';
      default: return 'outline';
    }
  };
  
  return (
    <>
      <div className="glow-container p-6">
        <h2 className="text-2xl font-bold text-white mb-6">KPIs Status & Tracking</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">KPI</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKpis.length > 0 ? (
              filteredKpis.map(kpi => (
                <TableRow key={kpi.id}>
                  <TableCell className="font-medium text-xs">{kpi.title}</TableCell>
                  <TableCell>{kpi.role}</TableCell>
                  <TableCell>{kpi.frequency}</TableCell>
                  <TableCell>{kpi.weight}%</TableCell>
                  <TableCell>{kpi.targetType === 'Percentage' ? `${kpi.target}%` : kpi.target}</TableCell>
                  <TableCell onClick={() => handleOpenDialog(kpi)} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Progress value={kpi.progress} className="w-[80%] h-3" />
                      <span>{kpi.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(kpi.status)}>{kpi.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(kpi.startDate), 'MMM d, yyyy')} - {format(new Date(kpi.endDate), 'MMM d, yyyy')}
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
                <TableCell colSpan={9} className="text-center h-24">No KPIs found for the selected filters.</TableCell>
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
