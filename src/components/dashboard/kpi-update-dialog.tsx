
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
      <DialogContent className="glow-modal sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-2xl text-yellow-400 animate-neon-glow">Update KPI Progress</DialogTitle>
          <DialogDescription className="font-rajdhani text-base">
            Update the progress for: <span className="font-semibold text-white">{kpi.title}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
            <div className="glow-container p-4 rounded-lg">
                <h4 className="text-white font-bold mb-4 font-orbitron text-lg">KPI Details</h4>
                <div className="space-y-3 text-sm text-gray-300">
                    <p><strong className="font-semibold text-yellow-400 w-24 inline-block">Role:</strong> {kpi.role}</p>
                    <p><strong className="font-semibold text-yellow-400 w-24 inline-block">Category:</strong> <Badge variant="secondary">{kpi.category}</Badge></p>
                    <p><strong className="font-semibold text-yellow-400 w-24 inline-block">Target:</strong> {kpi.target}</p>
                    <p><strong className="font-semibold text-yellow-400 w-24 inline-block">Metric:</strong> {kpi.metric}</p>
                    <p><strong className="font-semibold text-yellow-400 w-24 inline-block">Data Source:</strong> {kpi.dataSource}</p>
                </div>
            </div>

          <div className="glow-container p-4 rounded-lg">
             <Label htmlFor="progress" className="font-orbitron text-lg text-white">Progress: {progress}%</Label>
            <div className="flex items-center gap-4 mt-4">
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
                className="glow-input w-24 text-center"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} className="glow-button">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
