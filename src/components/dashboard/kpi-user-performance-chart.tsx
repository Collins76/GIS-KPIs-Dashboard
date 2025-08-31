
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Sector, Legend, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { Kpi } from "@/lib/types"
import { roles } from "@/lib/data"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

type KpiUserPerformanceChartProps = {
  kpis: Kpi[];
  type: 'pie' | 'bar';
};


const chartConfig = {
  inProgress: {
    label: "In Progress",
  },
  'GIS Coordinator': { label: 'GIS Coordinator', color: 'hsl(var(--chart-1))' },
  'GIS Lead': { label: 'GIS Lead', color: 'hsl(var(--chart-2))' },
  'GIS Specialist': { label: 'GIS Specialist', color: 'hsl(var(--chart-3))' },
  'Geodatabase Specialist': { label: 'Geodatabase Specialist', color: 'hsl(var(--chart-4))' },
  'GIS Analyst': { label: 'GIS Analyst', color: 'hsl(var(--chart-5))' },
} satisfies ChartConfig

export default function KpiUserPerformanceChart({ kpis, type }: KpiUserPerformanceChartProps) {
  const chartData = React.useMemo(() => {
    return roles.map(role => {
      const userKpis = kpis.filter(kpi => kpi.role === role);
      const inProgressCount = userKpis.filter(kpi => kpi.status === 'On Track' || kpi.status === 'At Risk' || kpi.status === 'Off Track').length;
      const roleKey = role.replace(/\s+/g, '-');
      return {
        role,
        inProgress: inProgressCount,
        fill: `var(--color-${roleKey})`
      }
    });
  }, [kpis]);

  const [activeIndex, setActiveIndex] = React.useState(0)

  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index)
    },
    [setActiveIndex]
  )

  if (type === 'pie') {
    return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-[300px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="inProgress"
            nameKey="role"
            innerRadius={60}
            strokeWidth={5}
            activeIndex={activeIndex}
            activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
              <g>
                <Sector {...props} outerRadius={outerRadius + 10} />
                <Sector
                  {...props}
                  outerRadius={outerRadius + 25}
                  innerRadius={outerRadius + 15}
                />
              </g>
            )}
            onMouseEnter={onPieEnter}
          >
            {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartConfig[entry.role as keyof typeof chartConfig]?.color} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="role" />} />
        </PieChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[300px]">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="role"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.split(" ").map((w:string) => w[0]).join('')}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="inProgress" name="In Progress" radius={8}>
            {chartData.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={chartConfig[entry.role as keyof typeof chartConfig]?.color} />
            ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
