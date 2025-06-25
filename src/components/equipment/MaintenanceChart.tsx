'use client';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const chartData = [
  { month: 'MAYO', correctivos: 4.3, preventivos: 2.4 },
  { month: 'JUNIO', correctivos: 2.5, preventivos: 4.4 },
  { month: 'JULIO', correctivos: 3.5, preventivos: 1.8 },
  { month: 'AGOSTO', correctivos: 4.5, preventivos: 2.8 },
];

const chartConfig = {
  correctivos: {
    label: "Mantenimientos Correctivos",
    color: "hsl(var(--primary))",
  },
  preventivos: {
    label: "Mantenimientos Preventivos",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function MaintenanceChart() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Mantenimientos realizados</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke="hsl(var(--foreground))"
            />
            <YAxis stroke="hsl(var(--foreground))" />
            <ChartTooltip 
                cursor={{fill: 'hsl(var(--muted))'}}
                content={<ChartTooltipContent />} 
            />
            <Legend />
            <Bar dataKey="correctivos" fill="var(--color-correctivos)" radius={4} />
            <Bar dataKey="preventivos" fill="var(--color-preventivos)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
