'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { Peripheral, PeripheralMaintenanceRecord } from '@/lib/types';
import { getPeripheralById, getPeripheralMaintenanceRecords, deletePeripheralMaintenanceRecord } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  ArrowLeft, Edit3, Info, Printer, Scan, Projector, Wrench, FileText, History as HistoryIcon, Trash2, Edit, AlertTriangle, PlusCircle, Loader2, HardDrive, MapPin, Tag, Box, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

interface PeripheralDetailClientPageProps {
  peripheralId: string;
}

const DetailItem: React.FC<{ label: string; value?: string | null; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="flex items-start py-2">
    {Icon && <Icon size={18} className="mr-3 mt-1 text-accent flex-shrink-0" />}
    <p className="text-sm"><strong className="font-medium text-foreground/80">{label}:</strong> {value || 'N/A'}</p>
  </div>
);

const getPeripheralIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('impresora') || lowerType.includes('printer')) return Printer;
    if (lowerType.includes('scanner')) return Scan;
    if (lowerType.includes('proyector') || lowerType.includes('projector')) return Projector;
    return HardDrive;
}


const PeripheralDetailClientPage: React.FC<PeripheralDetailClientPageProps> = ({ peripheralId }) => {
  const [peripheral, setPeripheral] = useState<Peripheral | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<PeripheralMaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const pData = await getPeripheralById(peripheralId);
      if (pData) {
        setPeripheral(pData);
        const recordsData = await getPeripheralMaintenanceRecords(peripheralId);
        setMaintenanceRecords(recordsData);
      } else {
        setError('Periférico no encontrado.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles del periférico.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [peripheralId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTableDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!peripheral) return;
    setIsDeletingRecord(recordId);
    try {
      await deletePeripheralMaintenanceRecord(recordId, peripheral.id);
      toast({
        title: 'Registro Eliminado',
        description: 'El registro de mantenimiento ha sido eliminado.',
        variant: 'default',
      });
      fetchData(); 
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      toast({
        title: 'Error al Eliminar',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el registro.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingRecord(null);
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

  if (!peripheral) {
    return <p>Periférico no encontrado.</p>;
  }

  const PeripheralIcon = getPeripheralIcon(peripheral.type);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
          <Link href="/">
            <ArrowLeft size={16} className="mr-2" /> Volver a la Lista
          </Link>
        </Button>
      </div>

       <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
                <PeripheralIcon size={40} className="text-primary flex-shrink-0" />
                <div>
                    <CardTitle className="text-2xl md:text-3xl">{peripheral.type}</CardTitle>
                    <CardDescription>ID: {peripheral.id}</CardDescription>
                </div>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href={`/peripherals/${peripheral.id}/edit`}>
                <Edit3 size={18} className="mr-2" /> Modificar Datos
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pt-4">
            <DetailItem label="Marca" value={peripheral.brand} icon={Box} />
            <DetailItem label="Modelo" value={peripheral.model} icon={Box} />
            <DetailItem label="No. Patrimonial" value={peripheral.patrimonialId} icon={Tag} />
            <DetailItem label="Ubicación" value={peripheral.location} icon={MapPin} />
            <DetailItem label="Estado" value={peripheral.status} icon={Activity} />
            <DetailItem label="Puntos Comunes de Falla (IA)" value={peripheral.commonFailurePoints} icon={Wrench} />
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <CardTitle className="text-2xl flex items-center">
              <HistoryIcon size={24} className="mr-3 text-accent" />
              Historial de Mantenimientos
            </CardTitle>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link href={`/peripherals/${peripheral.id}/register`}>
                <PlusCircle size={16} className="mr-2" /> Registrar Mantenimiento
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {maintenanceRecords.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Técnico(s)</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatTableDate(record.date)}</TableCell>
                      <TableCell>{record.technician}</TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap">{record.description}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button asChild size="icon" variant="outline" className="h-8 w-8 hover:border-accent hover:text-accent">
                          <Link href={`/peripherals/${peripheral.id}/maintenance/${record.id}/edit`}>
                            <Edit size={16} />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8 hover:border-destructive hover:text-destructive" disabled={isDeletingRecord === record.id}>
                              {isDeletingRecord === record.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center"><AlertTriangle size={20} className="mr-2 text-destructive" />¿Confirmar?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente el registro del {formatTableDate(record.date)}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRecord(record.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
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
          ) : (
            <p className="text-muted-foreground text-center py-4">No hay registros de mantenimiento para este periférico.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeripheralDetailClientPage;
