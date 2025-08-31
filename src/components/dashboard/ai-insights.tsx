
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { analyzeDashboardData } from '@/ai/flows/analyze-dashboard-data';
import type { Kpi, Role } from '@/lib/types';
import { Sparkles, Bot, Loader2 } from 'lucide-react';

type AiInsightsProps = {
  kpis: Kpi[];
  role: Role | 'All';
};

export default function AiInsights({ kpis, role }: AiInsightsProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    setIsModalOpen(true);
    try {
      const kpiDataString = JSON.stringify(
        kpis.map(({ title, progress, status }) => ({ title, progress, status })),
        null,
        2
      );
      const result = await analyzeDashboardData({ kpiData: kpiDataString, role });
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Error analyzing data:', error);
      setAnalysis('Failed to analyze data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAnalysis(null);
    setLoading(false);
  };


  return (
    <>
    <Card className="card-glow flex flex-col flex-grow h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-glow">AI-Powered Insights</CardTitle>
        <Sparkles className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
         <p className="text-sm text-muted-foreground text-center">Click the button to generate an analysis of your current KPI data for the selected role.</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={kpis.length === 0} className="w-full glow-button">
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Dashboard Data
            </>
        </Button>
      </CardFooter>
    </Card>

    <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="glow-modal sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="font-orbitron text-2xl text-yellow-400 animate-neon-glow flex items-center">
                   <Sparkles className="mr-3 h-6 w-6"/> AI Analysis
                </DialogTitle>
                <DialogDescription className="font-rajdhani text-base">
                    AI-powered insights based on the current dashboard filters.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 min-h-[150px] flex items-center justify-center">
                 {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Analyzing data...</p>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3">
                    <Bot className="h-6 w-6 flex-shrink-0 text-primary mt-1" />
                    <p className="text-base text-gray-300">{analysis}</p>
                  </div>
                )}
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeModal}>
                    Close
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
