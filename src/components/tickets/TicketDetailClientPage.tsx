'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { Ticket } from '@/lib/types';
import { getTicketById } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  ArrowLeft, Edit3, Ticket as TicketIcon, Computer, User, Calendar, Wrench, ClipboardList, FileText, Activity, HardDrive, Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface TicketDetailClientPageProps {
  ticketId: string;
}

const DetailItem: React.FC<{ label: string; value?: string | null; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="flex items-start py-2">
    {Icon && <Icon size={18} className="mr-3 mt-1 text-accent flex-shrink-0" />}
    <p className="text-sm"><strong className="font-medium text-foreground/80">{label}:</strong> {value || 'N/A'}</p>
  </div>
);

const getStatusVariant = (status: Ticket['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'Abierto':
        return 'destructive';
      case 'En Proceso':
        return 'default';
      case 'Cerrado':
        return 'secondary';
      default:
        return 'secondary';
    }
}

const TicketDetailClientPage: React.FC<TicketDetailClientPageProps> = ({ ticketId }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const ticketData = await getTicketById(ticketId);
      if (ticketData) {
        setTicket(ticketData);
      } else {
        setError('Ticket no encontrado.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles del ticket.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">
            <ArrowLeft size={16} className="mr-2" /> Volver
          </Link>
        </Button>
      </Alert>
    );
  }

  if (!ticket) {
    return <p>Ticket no encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
          <Link href="/">
            <ArrowLeft size={16} className="mr-2" /> Volver al Listado de Tickets
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
            <div className="flex items-center gap-4">
                <TicketIcon size={40} className="text-primary flex-shrink-0" />
                <div>
                    <CardTitle className="text-2xl md:text-3xl">Ticket para: {ticket.pcName}</CardTitle>
                    <CardDescription>ID: {ticket.id} | Reportado: {formatDate(ticket.date)}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="pt-4">
            <div className="space-y-4">
                {/* PC Info Section */}
                <div>
                    <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                        <Computer size={22} className="mr-3 text-accent" />
                        Información de PC y Usuario
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 pl-4 border-l-2 border-accent/50 ml-2">
                        <DetailItem label="ID PC" value={ticket.pcId} icon={HardDrive} />
                        <DetailItem label="Nombre de PC" value={ticket.pcName} icon={Computer} />
                        <DetailItem label="Usuario" value={ticket.userName} icon={User} />
                        <DetailItem label="No. de Patrimonio de PC" value={ticket.patrimonialId} icon={Tag} />
                        <DetailItem label="Marca" value={ticket.brand} />
                        <DetailItem label="Modelo" value={ticket.model} />
                    </div>
                </div>

                {/* Maintenance Info Section */}
                <div>
                    <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                        <Wrench size={22} className="mr-3 text-accent" />
                        Información de Mantenimiento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pl-4 border-l-2 border-accent/50 ml-2">
                        <DetailItem label="Ingeniero Asignado" value={ticket.assignedEngineer} icon={User} />
                        <DetailItem label="Tipo" value={ticket.maintenanceType} icon={Wrench} />
                        <div className="flex items-start py-2 col-span-full">
                            <Activity size={18} className="mr-3 mt-1 text-accent flex-shrink-0" />
                            <p className="text-sm">
                                <strong className="font-medium text-foreground/80">Estado:</strong>{' '}
                                <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                            </p>
                        </div>
                        <DetailItem label="Descripción del Problema" value={ticket.problemDescription} icon={FileText} />
                        <DetailItem label="Acciones Realizadas" value={ticket.actionsTaken} icon={ClipboardList} />
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href={`/tickets/${ticket.id}/edit`}>
              <Edit3 size={20} className="mr-2" /> Modificar Datos de Ticket
            </Link>
          </Button>
      </div>
    </div>
  );
};

export default TicketDetailClientPage;
