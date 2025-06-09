'use client';

import React, { useEffect, useState } from 'react';
import type { Equipment, MaintenanceRecord } from '@/lib/types';
import { getEquipmentById, getMaintenanceRecordsForEquipment } from '@/lib/actions';
import { MaintenanceHistoryTable } from './MaintenanceHistoryTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Wrench, CalendarDays, Info, Cpu, ListChecks } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface EquipmentDetailClientPageProps {
  equipmentId: string;
}

const EquipmentDetailClientPage: React.FC<EquipmentDetailClientPageProps> = ({ equipmentId }) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const eqData = await getEquipmentById(equipmentId);
        if (eqData) {
          setEquipment(eqData);
          const recordsData = await getMaintenanceRecordsForEquipment(equipmentId);
          setMaintenanceRecords(recordsData);
        } else {
          setError('Equipo no encontrado.');
        }
      } catch (err) {
        setError('Error al cargar los detalles del equipo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [equipmentId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
     try {
      return format(parseISO(dateString), 'PPP', { locale: es }); // PPP for 'Aug 23, 2020' format
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" /> {/* Back button */}
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" /> {/* Title */}
            <Skeleton className="h-4 w-1/2" /> {/* Subtitle/ID */}
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </CardContent>
        </Card>
        <Skeleton className="h-64 w-full" /> {/* Maintenance history table skeleton */}
        <Skeleton className="h-10 w-1/3" /> {/* Register button */}
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
            <ArrowLeft size={16} className="mr-2" /> Volver a la Lista
          </Link>
        </Button>
      </Alert>
    );
  }

  if (!equipment) {
    // This case should be covered by error state, but as a fallback.
    return <p>Equipo no encontrado.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="outline" className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <Link href="/">
            <ArrowLeft size={16} className="mr-2" /> Volver a la Lista
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-secondary/50 p-6">
          <CardTitle className="text-3xl font-headline font-bold text-primary flex items-center">
            <Cpu size={32} className="mr-3 text-accent" /> {equipment.name}
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground">ID CPU: {equipment.id}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center"><Info size={20} className="mr-2 text-accent" />Especificaciones</h3>
            <p><strong className="font-medium">Sistema Operativo:</strong> {equipment.os}</p>
            <p><strong className="font-medium">Tipo de Equipo:</strong> {equipment.type}</p>
            <p><strong className="font-medium">Especificaciones Detalladas:</strong> {equipment.specifications}</p>
            <p><strong className="font-medium">Puntos Comunes de Falla:</strong> {equipment.commonFailurePoints}</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center"><CalendarDays size={20} className="mr-2 text-accent" />Fechas de Mantenimiento</h3>
            <p><strong className="font-medium">Último Mantenimiento:</strong> {formatDate(equipment.lastMaintenanceDate)}</p>
            <p><strong className="font-medium">Próximo Mantenimiento Sugerido:</strong> {formatDate(equipment.nextMaintenanceDate)}</p>
          </div>
        </CardContent>
         <CardFooter className="bg-secondary/50 p-6 flex justify-end">
          <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href={`/equipment/${equipment.id}/register`}>
              <Wrench size={20} className="mr-2" /> Registrar Nuevo Mantenimiento
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <MaintenanceHistoryTable records={maintenanceRecords} />
    </div>
  );
};

export default EquipmentDetailClientPage;
