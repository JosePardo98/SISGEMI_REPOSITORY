'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { Ticket } from '@/lib/types';
import { getTickets, deleteTicket } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTickets = useCallback(async () => {
    try {
      // Don't set loading to true here to avoid flicker on re-fetches
      setError(null);
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      setError('Error al cargar los tickets. Por favor, intente de nuevo más tarde.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTickets().finally(() => setLoading(false));
  }, [fetchTickets]);

  const handleDeleteTicket = async (ticketId: string) => {
    setIsDeleting(ticketId);
    try {
      await deleteTicket(ticketId);
      toast({
        title: 'Ticket Eliminado',
        description: 'El ticket ha sido eliminado exitosamente.',
      });
      await fetchTickets(); // Refresh the list
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: 'Error al Eliminar',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el ticket.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

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
              <TableCell className="text-right space-x-2">
                <Button asChild size="sm" variant="default">
                    <Link href={`/tickets/${ticket.id}/edit`}>
                        <Edit size={16} className="mr-2" />
                        Modificar
                    </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting === ticket.id}
                    >
                      {isDeleting === ticket.id ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Trash2 size={16} className="mr-2" />
                      )}
                      {isDeleting === ticket.id ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center">
                        <AlertTriangle size={20} className="mr-2 text-destructive" />
                        ¿Confirmar Eliminación?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el ticket para la PC <strong>{ticket.pcName}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Sí, Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
