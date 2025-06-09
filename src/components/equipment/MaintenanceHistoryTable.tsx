'use client';

import React from 'react';
import type { MaintenanceRecord } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface MaintenanceHistoryTableProps {
  records: MaintenanceRecord[];
}

export const MaintenanceHistoryTable: React.FC<MaintenanceHistoryTableProps> = ({ records }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      console.error(`Invalid date string: ${dateString}`, error);
      return 'Fecha inválida';
    }
  };
  
  // Sort records by date, most recent first, directly in the component
  // as the data source might not always provide it sorted or could be re-sorted elsewhere.
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
        ) : (
          <p className="text-muted-foreground">No hay historial de mantenimiento para este equipo.</p>
        )}
      </CardContent>
    </Card>
  );
};
