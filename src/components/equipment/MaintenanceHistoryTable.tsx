
'use client';

import React, { useState } from 'react';
import type { Equipment, MaintenanceRecord } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash2, Edit, AlertTriangle, HistoryIcon, Wrench } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface MaintenanceHistoryTableProps {
  records: MaintenanceRecord[];
  equipment: Equipment;
  onRecordDeleted: () => void; // Callback to refresh data
}

export const MaintenanceHistoryTable: React.FC<MaintenanceHistoryTableProps> = ({ records, equipment, onRecordDeleted }) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID of record being deleted

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      console.error(`Invalid date string: ${dateString}`, error);
      return 'Fecha inválida';
    }
  };
  
  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  const handleDelete = async (recordId: string) => {
    setIsDeleting(recordId);
    try {
      const { deleteMaintenanceRecord } = await import('@/lib/actions');
      await deleteMaintenanceRecord(recordId, equipment.id);

      toast({
        title: 'Registro Eliminado',
        description: 'El registro de mantenimiento ha sido eliminado.',
        variant: 'default',
      });
      onRecordDeleted(); 
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      toast({
        title: 'Error al Eliminar',
        description: 'No se pudo eliminar el registro de mantenimiento.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Accordion type="single" collapsible defaultValue="preventive-maintenance" className="w-full space-y-3">
      <AccordionItem value="preventive-maintenance" className="border rounded-lg shadow-lg overflow-hidden">
        <AccordionTrigger 
          className="p-4 text-xl font-headline font-semibold text-primary hover:no-underline flex items-center justify-between w-full text-left bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center">
            <HistoryIcon size={26} className="mr-3 text-accent" />
            Historial de Mantenimientos Preventivos
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2 p-4 border-t border-border">
          {sortedRecords.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{record.technician}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button asChild variant="outline" size="sm" className="hover:border-accent hover:text-accent">
                          <Link href={`/equipment/${equipment.id}/maintenance/${record.id}/edit`}>
                            <Edit size={16} className="mr-1" /> Modificar
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="hover:border-destructive hover:text-destructive" disabled={isDeleting === record.id}>
                              {isDeleting === record.id ? (
                                <>Eliminando...</>
                              ) : (
                                <><Trash2 size={16} className="mr-1" /> Eliminar</>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center">
                                <AlertTriangle size={20} className="mr-2 text-destructive" />
                                ¿Confirmar Eliminación?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de mantenimiento del {formatDate(record.date)}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(record.id)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Sí, Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : equipment.lastMaintenanceDate ? (
            <p className="text-muted-foreground">
              Último mantenimiento general registrado el: {formatDate(equipment.lastMaintenanceDate)}. 
              No hay un historial detallado de mantenimientos adicionales para este equipo.
            </p>
          ) : (
            <p className="text-muted-foreground">
              No se ha registrado ningún mantenimiento para este equipo.
            </p>
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="corrective-maintenance" className="border rounded-lg shadow-lg overflow-hidden">
        <AccordionTrigger 
          className="p-4 text-xl font-headline font-semibold text-primary hover:no-underline flex items-center justify-between w-full text-left bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center">
            <Wrench size={26} className="mr-3 text-accent" />
            Historial de Mantenimientos Correctivos
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2 p-4 border-t border-border">
          <p className="text-muted-foreground">
            La gestión de mantenimientos correctivos estará disponible próximamente.
          </p>
          {/* Aquí se podría agregar una tabla similar para mantenimientos correctivos en el futuro */}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

