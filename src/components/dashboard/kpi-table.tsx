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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { kpis as allKpis, roles } from '@/lib/data';
import type { Role, KpiStatus } from '@/lib/types';

export default function KpiTable() {
  const [selectedRole, setSelectedRole] = useState<Role | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<KpiStatus | 'All'>('All');

  const filteredKpis = allKpis.filter(kpi => 
    (selectedRole === 'All' || kpi.role === selectedRole) &&
    (selectedStatus === 'All' || kpi.status === selectedStatus)
  );

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
    return 'bg-red-500';
  }

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-glow">KPIs Status & Tracking</CardTitle>
        <div className="flex items-center space-x-4 pt-4">
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role | 'All')}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as KpiStatus | 'All')}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="On Track">On Track</SelectItem>
              <SelectItem value="At Risk">At Risk</SelectItem>
              <SelectItem value="Off Track">Off Track</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">KPI</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKpis.length > 0 ? (
              filteredKpis.map(kpi => (
                <TableRow key={kpi.id}>
                  <TableCell className="font-medium">{kpi.title}</TableCell>
                  <TableCell>{kpi.role}</TableCell>
                  <TableCell>{kpi.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Progress value={kpi.progress} indicatorClassName={getProgressColor(kpi.progress)} className="w-[60%]" />
                       <span>{kpi.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(kpi.status)}>{kpi.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No KPIs found for the selected filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
