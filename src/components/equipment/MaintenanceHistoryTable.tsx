
'use client';

import React from 'react';
import type { Equipment, MaintenanceRecord } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface MaintenanceHistoryTableProps {
  records: MaintenanceRecord[];
  equipment: Equipment; // Added equipment prop
}

export const MaintenanceHistoryTable: React.FC<MaintenanceHistoryTableProps> = ({ records, equipment }) => {
  const formatDate = (dateString?: string) => { // Made dateString optional for equipment.lastMaintenanceDate
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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary">Historial de Mantenimientos Preventivos</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedRecords.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{record.technician}</TableCell>
                    <TableCell>{record.description}</TableCell>
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
      </CardContent>
    </Card>
  );
};
