'use client';

import React, { useEffect, useState } from 'react';
import type { Ticket } from '@/lib/types';
import { getTickets } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTickets();
        setTickets(data);
      } catch (err) {
        setError('Error al cargar los tickets. Por favor, intente de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getStatusVariant = (status: Ticket['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'Abierto':
        return 'destructive';
      case 'En Proceso':
        return 'default'; // This will be primary color
      case 'Cerrado':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PC</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Ingeniero Asignado</TableHead>
            <TableHead>Fecha Reporte</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length > 0 ? tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">{ticket.pcName}</TableCell>
              <TableCell>{ticket.userName}</TableCell>
              <TableCell>{ticket.assignedEngineer}</TableCell>
              <TableCell>{formatDate(ticket.date)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
              </TableCell>
              <TableCell>{ticket.maintenanceType}</TableCell>
              <TableCell className="text-right">
                <Button asChild size="icon" variant="outline" className="h-8 w-8 hover:border-accent hover:text-accent">
                    <Link href={`/tickets/${ticket.id}/edit`}>
                        <Edit size={16} />
                    </Link>
                </Button>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No se han generado tickets.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketList;
