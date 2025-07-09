'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { getTickets } from "@/lib/actions";
import type { Ticket } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function AlertsCard() {
  const [alerts, setAlerts] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpenTickets = async () => {
      try {
        setLoading(true);
        const allTickets = await getTickets();
        const openTickets = allTickets.filter(ticket => ticket.status === 'Abierto');
        setAlerts(openTickets);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
        setError("No se pudieron cargar las alertas.");
      } finally {
        setLoading(false);
      }
    };
    fetchOpenTickets();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-4/5 bg-accent-foreground/20" />
          <Skeleton className="h-4 w-2/3 bg-accent-foreground/20" />
          <Skeleton className="h-4 w-3/4 bg-accent-foreground/20" />
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive" className="bg-destructive/80 border-destructive-foreground text-destructive-foreground">
           <Terminal className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (alerts.length === 0) {
      return (
        <p className="text-sm text-center text-accent-foreground/80">No hay tickets abiertos.</p>
      );
    }

    return (
      <ul className="space-y-2 list-disc pl-5">
        {alerts.map((ticket) => (
          <li key={ticket.id} className="text-sm">
            <Link href={`/tickets/${ticket.id}`} className="hover:underline" title={ticket.problemDescription}>
              {`Mantenimiento ${ticket.maintenanceType.toLowerCase()} pendiente para ${ticket.pcName}`}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="bg-accent text-accent-foreground shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-bold">
          <BellRing className="mr-2 h-5 w-5" />
          Alertas de Mantenimientos:
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
