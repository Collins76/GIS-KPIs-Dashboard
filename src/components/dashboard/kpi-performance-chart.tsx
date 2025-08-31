"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Kpi, KpiCategory } from "@/lib/types"

type KpiPerformanceChartProps = {
  kpis: Kpi[];
};

const chartConfig = {
  progress: {
    label: "Progress",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function KpiPerformanceChart({ kpis }: KpiPerformanceChartProps) {

  const categories: KpiCategory[] = ['Business Growth', 'People Development', 'Operational Process', 'Customer'];
  
  const chartData = categories.map(category => {
    const kpisInCategory = kpis.filter(kpi => kpi.category === category);
    const avgProgress = kpisInCategory.length > 0 
      ? kpisInCategory.reduce((acc, kpi) => acc + kpi.progress, 0) / kpisInCategory.length
      : 0;
    return {
      category,
      progress: Math.round(avgProgress),
    }
  });


  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[300px]">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.split(" ").map(w => w[0]).join('')}
        />
        <YAxis />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="progress" fill="var(--color-progress)" radius={8} />
      </BarChart>
    </ChartContainer>
  )
}
