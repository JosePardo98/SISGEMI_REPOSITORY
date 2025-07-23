
'use client';

import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { getMaintenanceCountsByMonth, getPeripheralMaintenanceCountsByMonth } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const chartConfig = {
  correctivos: {
    label: "Mantenimientos Correctivos (Equipos)",
    color: "hsl(var(--primary))",
  },
  preventivos: {
    label: "Mantenimientos Preventivos (Equipos)",
    color: "hsl(var(--destructive))",
  },
  perifericos: {
    label: "Mantenimiento a Periféricos",
    color: "hsl(var(--accent))",
  }
} satisfies ChartConfig;

type ChartData = {
  month: string;
  preventivos: number;
  correctivos: number;
  perifericos: number;
};

export default function MaintenanceChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both datasets in parallel
        const [equipmentData, peripheralData] = await Promise.all([
            getMaintenanceCountsByMonth(),
            getPeripheralMaintenanceCountsByMonth()
        ]);

        // Merge the data
        const mergedData = equipmentData.map((equipMonthData, index) => {
            const periphMonthData = peripheralData[index];
            return {
                ...equipMonthData,
                perifericos: periphMonthData.preventivos + periphMonthData.correctivos,
            };
        });

        const relevantData = mergedData.filter(d => ['MAY', 'JUN', 'JUL', 'AGO'].includes(d.month.toUpperCase()));
        
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
          <CardTitle className="text-lg font-bold">Mantenimientos Realizados por Mes</CardTitle>
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
          <CardTitle className="text-lg font-bold">Mantenimientos Realizados por Mes</CardTitle>
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
        <CardTitle className="text-lg font-bold">Mantenimientos Realizados por Mes</CardTitle>
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
            <Bar dataKey="perifericos" fill="var(--color-perifericos)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
