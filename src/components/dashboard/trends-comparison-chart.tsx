
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { Kpi, User } from "@/lib/types";
import { roles } from "@/lib/data";

type TrendsComparisonChartProps = {
  kpis: Kpi[];
  type: 'bar' | 'doughnut';
};

const chartConfig = {
  target: {
    label: "Target",
    color: "hsl(var(--destructive))",
  },
  achieved: {
    label: "Achieved",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// Function to get user by role.
// In a real app, this would come from an API or a user management system.
const getUserByRole = (role: string, loggedInUser: User | null): User => {
    // If the role matches the logged-in user's role, use their info
    if (loggedInUser && loggedInUser.role === role) {
        return loggedInUser;
    }

    // Fallback to generating a mock user for other roles
    const baseEmail = `${role.toLowerCase().replace(/\s+/g, '.')}@ikejaelectric.com`;
    return {
        name: role.split(' ')[0], // Use first name for brevity
        email: baseEmail,
        role: role as User['role'],
        location: 'CHQ',
        avatar: `https://i.pravatar.cc/150?u=${baseEmail}`
    };
};


export default function TrendsComparisonChart({ kpis, type }: TrendsComparisonChartProps) {
  const [loggedInUser, setLoggedInUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('gis-user-profile');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
  }, []);

  const chartData = React.useMemo(() => {
    return roles.map(role => {
      const user = getUserByRole(role, loggedInUser);
      const userKpis = kpis.filter(kpi => kpi.role === role);
      const targetCount = userKpis.length;
      const achievedCount = userKpis.filter(kpi => kpi.status === 'Completed').length;
      return {
        name: user.name,
        target: targetCount,
        achieved: achievedCount,
      };
    });
  }, [kpis, loggedInUser]);

  if (type === 'doughnut') {
    const doughnutData = chartData.map(d => ({ name: d.name, value: d.achieved }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
       <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[500px]">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={doughnutData}
            dataKey="value"
            nameKey="name"
            innerRadius={80}
            outerRadius={150}
            paddingAngle={5}
          >
            {doughnutData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[500px]">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <YAxis />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <ChartLegend />
        <Bar dataKey="target" fill="var(--color-target)" radius={4} />
        <Bar dataKey="achieved" fill="var(--color-achieved)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
