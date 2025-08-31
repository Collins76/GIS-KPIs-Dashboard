
import { useState, useEffect } from 'react';
import type { Kpi } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type KpiUpdateDialogProps = {
  kpi: Kpi;
  onUpdate: (kpi: Kpi, progress: number) => void;
  onClose: () => void;
};

export function KpiUpdateDialog({ kpi, onUpdate, onClose }: KpiUpdateDialogProps) {
  const [progress, setProgress] = useState(kpi.progress);

  useEffect(() => {
    setProgress(kpi.progress);
  }, [kpi]);

  const handleSave = () => {
    onUpdate(kpi, progress);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update KPI Progress</DialogTitle>
          <DialogDescription>
            Update the progress for: <span className="font-semibold text-foreground">{kpi.title}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <h4 className="font-medium">KPI Details</h4>
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3 text-sm">
                    <p><strong className="font-semibold">Role:</strong> {kpi.role}</p>
                    <p><strong className="font-semibold">Category:</strong> <Badge variant="secondary">{kpi.category}</Badge></p>
                    <p><strong className="font-semibold">Target:</strong> {kpi.target}</p>
                    <p><strong className="font-semibold">Metric:</strong> {kpi.metric}</p>
                    <p><strong className="font-semibold">Data Source:</strong> {kpi.dataSource}</p>
                </div>
            </div>

          <div className="space-y-2">
            <Label htmlFor="progress">Progress: {progress}%</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="progress"
                min={0}
                max={100}
                step={1}
                value={[progress]}
                onValueChange={(value) => setProgress(value[0])}
                className="w-full"
              />
              <Input
                type="number"
                value={progress}
                onChange={(e) => setProgress(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-20"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
