"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
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

  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-glow">AI-Powered Insights</CardTitle>
        <Sparkles className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : analysis ? (
          <div className="flex items-start space-x-3">
             <Bot className="h-5 w-5 flex-shrink-0 text-primary mt-1" />
            <p className="text-sm text-muted-foreground">{analysis}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Click the button to generate an analysis of your current KPI data for the selected role.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={loading || kpis.length === 0} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
             <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Dashboard Data
             </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
