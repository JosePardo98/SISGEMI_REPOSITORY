
'use client';

import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { getMaintenanceCountsByMonth } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const chartConfig = {
  correctivos: {
    label: "Mantenimientos Correctivos",
    color: "hsl(var(--primary))",
  },
  preventivos: {
    label: "Mantenimientos Preventivos",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

type ChartData = {
  month: string;
  preventivos: number;
  correctivos: number;
};

export default function MaintenanceChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allMonthsData = await getMaintenanceCountsByMonth();
        // Filter for May, June, July, and August as requested
        const relevantData = allMonthsData.filter(d => ['MAY', 'JUN', 'JUL', 'AGO'].includes(d.month.toUpperCase()));
        setData(relevantData);
        setError(null);
      } catch (err) {
        console.error("Failed to load chart data:", err);
        setError("No se pudieron cargar los datos del gráfico.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Mantenimientos realizados a Equipos de Cómputo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6 aspect-[2/1]">
            <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
     return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Mantenimientos realizados a Equipos de Cómputo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6 aspect-[2/1]">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Mantenimientos realizados a Equipos de Cómputo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full aspect-[2/1]">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke="hsl(var(--foreground))"
            />
            <YAxis stroke="hsl(var(--foreground))" domain={[0, 30]} allowDecimals={false} />
            <ChartTooltip 
                cursor={{fill: 'hsl(var(--muted))'}}
                content={<ChartTooltipContent />} 
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="correctivos" fill="var(--color-correctivos)" radius={4} />
            <Bar dataKey="preventivos" fill="var(--color-preventivos)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

