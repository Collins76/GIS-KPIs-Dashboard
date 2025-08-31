"use client"

import * as React from "react"
import { Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Kpi } from "@/lib/types"

type KpiStatusChartProps = {
  kpis: Kpi[];
};

export default function KpiStatusChart({ kpis }: KpiStatusChartProps) {
  const onTrack = kpis.filter((kpi) => kpi.status === 'On Track').length;
  const atRisk = kpis.filter((kpi) => kpi.status === 'At Risk').length;
  const offTrack = kpis.filter((kpi) => kpi.status === 'Off Track').length;

  const chartData = [
    { name: "On Track", value: onTrack, fill: "hsl(var(--chart-2))" },
    { name: "At Risk", value: atRisk, fill: "hsl(var(--chart-4))" },
    { name: "Off Track", value: offTrack, fill: "hsl(var(--destructive))" },
  ]

  const id = "pie-interactive"
  const [activeIndex, setActiveIndex] = React.useState(0)

  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index)
    },
    [setActiveIndex]
  )

  return (
    <ChartContainer
      config={{}}
      className="mx-auto aspect-square h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
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
        />
      </PieChart>
    </ChartContainer>
  )
}
