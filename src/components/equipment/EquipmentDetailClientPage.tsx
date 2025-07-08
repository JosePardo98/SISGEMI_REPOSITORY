
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { Equipment, MaintenanceRecord, CorrectiveMaintenanceRecord } from '@/lib/types';
import { getEquipmentById, getMaintenanceRecordsForEquipment, getCorrectiveMaintenanceRecordsForEquipment, deleteMaintenanceRecord, deleteCorrectiveMaintenanceRecord } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  ArrowLeft, Edit3, Info, Computer, Server, Laptop, Mouse, Monitor, Keyboard, Zap, HelpCircle, Archive, 
  Wrench, Briefcase, FileText, History as HistoryIcon, Trash2, Edit, AlertTriangle, PlusCircle, User, Loader2, MapPin 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface EquipmentDetailClientPageProps {
  equipmentId: string;
}

const DetailItem: React.FC<{ label: string; value?: string | null; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="flex items-start py-2">
    {Icon && <Icon size={18} className="mr-3 mt-1 text-accent flex-shrink-0" />}
    <p className="text-sm"><strong className="font-medium text-foreground/80">{label}:</strong> {value || 'N/A'}</p>
  </div>
);


const EquipmentDetailClientPage: React.FC<EquipmentDetailClientPageProps> = ({ equipmentId }) => {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [correctiveMaintenanceRecords, setCorrectiveMaintenanceRecords] = useState<CorrectiveMaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingPreventiveRecord, setIsDeletingPreventiveRecord] = useState<string | null>(null);
  const [isDeletingCorrectiveRecord, setIsDeletingCorrectiveRecord] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState('info-pc');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const eqData = await getEquipmentById(equipmentId);
      if (eqData) {
        setEquipment(eqData);
        const preventiveRecordsData = await getMaintenanceRecordsForEquipment(equipmentId);
        setMaintenanceRecords(preventiveRecordsData);
        const correctiveRecordsData = await getCorrectiveMaintenanceRecordsForEquipment(equipmentId);
        setCorrectiveMaintenanceRecords(correctiveRecordsData);
      } else {
        setError('Equipo no encontrado.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles del equipo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTableDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      console.error(`Invalid date string: ${dateString}`, error);
      return 'Fecha inválida';
    }
  };

  const sortedMaintenanceRecords = React.useMemo(() => {
    return [...maintenanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [maintenanceRecords]);

  const sortedCorrectiveMaintenanceRecords = React.useMemo(() => {
    return [...correctiveMaintenanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [correctiveMaintenanceRecords]);

  const handleDeletePreventiveRecord = async (recordId: string) => {
    if (!equipment) return;
    setIsDeletingPreventiveRecord(recordId);
    try {
      await deleteMaintenanceRecord(recordId, equipment.id);
      toast({
        title: 'Registro Eliminado',
        description: 'El registro de mantenimiento preventivo ha sido eliminado.',
        variant: 'default',
      });
      fetchData(); 
    } catch (error) {
      console.error('Error deleting preventive maintenance record:', error);
      toast({
        title: 'Error al Eliminar',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el registro de mantenimiento preventivo.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingPreventiveRecord(null);
    }
  };

  const handleDeleteCorrectiveRecord = async (recordId: string) => {
    if (!equipment) return;
    setIsDeletingCorrectiveRecord(recordId);
    try {
      await deleteCorrectiveMaintenanceRecord(recordId, equipment.id);
      toast({
        title: 'Registro Eliminado',
        description: 'El registro de mantenimiento correctivo ha sido eliminado.',
        variant: 'default',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting corrective maintenance record:', error);
      toast({
        title: 'Error al Eliminar',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el registro de mantenimiento correctivo.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingCorrectiveRecord(null);
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
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
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">
            <ArrowLeft size={16} className="mr-2" /> Volver a la Lista
          </Link>
        </Button>
      </Alert>
    );
  }

  if (!equipment) {
    return <p>Equipo no encontrado.</p>;
  }

  const navItems = [
    { id: 'info-pc', label: 'Información de PC' },
    { id: 'info-inventario', label: 'Información de Inventario' },
    { id: 'hist-preventivo', label: 'Historial de Mantenimientos Preventivos' },
    { id: 'hist-correctivo', label: 'Historial de Mantenimientos Correctivos' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
          <Link href="/">
            <ArrowLeft size={16} className="mr-2" /> Volver a la Lista
          </Link>
        </Button>
      </div>

      <div className="flex items-baseline justify-between flex-wrap gap-y-2 gap-x-4">
        <div className="flex items-center gap-4">
          <Computer size={40} className="text-primary flex-shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">{equipment.name}</h1>
            <p className="text-sm text-muted-foreground">ID PC: {equipment.id}</p>
          </div>
        </div>
        <p className="text-lg text-foreground text-right">
          <span className="font-semibold">Usuario:</span> {equipment.userName || 'N/A'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {navItems.map(item => (
            <Button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                variant={activeView === item.id ? 'default' : 'secondary'}
                className="py-6 text-base font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 h-auto text-wrap"
            >
                {item.label}
            </Button>
        ))}
      </div>

      <Card className="shadow-xl mt-2 animate-fade-in" key={activeView}>
        <CardContent className="p-6">
          {activeView === 'info-pc' && (
             <div>
              <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center">
                <FileText size={24} className="mr-3 text-accent" />
                Información de PC
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <DetailItem label="Nombre de Usuario" value={equipment.userName} icon={User} />
                <DetailItem label="Ubicación" value={equipment.location} icon={MapPin} />
                <DetailItem label="Procesador" value={equipment.processor} icon={Server} />
                <DetailItem label="Memoria RAM" value={equipment.ramAmount} icon={Info} />
                <DetailItem label="Tipo de RAM" value={equipment.ramType} icon={Info} />
                <DetailItem label="Capacidad Disco" value={equipment.storageCapacity} icon={Archive} />
                <DetailItem label="Tipo Disco" value={equipment.storageType} icon={Archive} />
                <DetailItem label="Sistema Operativo" value={equipment.os} icon={Computer} />
                <DetailItem label="Dirección IP" value={equipment.ipAddress} icon={Info} />
              </div>
              <div className="mt-4 border-t pt-2 space-y-2">
                <DetailItem label="Tipo de Equipo (IA)" value={equipment.type} icon={HelpCircle} />
                <DetailItem label="Puntos Comunes de Falla (IA)" value={equipment.commonFailurePoints} icon={Zap} />
              </div>
             </div>
          )}
          {activeView === 'info-inventario' && (
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center">
                <Briefcase size={24} className="mr-3 text-accent" />
                Información de Inventario
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <DetailItem label="No. Patrimonial PC" value={equipment.pcPatrimonialId} />
                  <DetailItem label="Condición de PC" value={equipment.pcStatus} />
                  <DetailItem label="¿Piezas reutilizables?" value={equipment.reusableParts} />
                  <DetailItem label="No. Patrimonial Mouse" value={equipment.mousePatrimonialId} icon={Mouse} />
                  <DetailItem label="Marca Mouse" value={equipment.mouseBrand} icon={Mouse} />
                  <DetailItem label="Modelo Mouse" value={equipment.mouseModel} icon={Mouse} />
                  <DetailItem label="No. Patrimonial Monitor" value={equipment.monitorPatrimonialId} icon={Monitor} />
                  <DetailItem label="Marca Monitor" value={equipment.monitorBrand} icon={Monitor} />
                  <DetailItem label="Modelo Monitor" value={equipment.monitorModel} icon={Monitor} />
                  <DetailItem label="No. Patrimonial Teclado" value={equipment.keyboardPatrimonialId} icon={Keyboard} />
                  <DetailItem label="Marca Teclado" value={equipment.keyboardBrand} icon={Keyboard} />
                  <DetailItem label="Modelo Teclado" value={equipment.keyboardModel} icon={Keyboard} />
                  <DetailItem label="No. Patrimonial Regulador" value={equipment.regulatorPatrimonialId} icon={Zap} />
                  <DetailItem label="Marca Regulador" value={equipment.regulatorBrand} icon={Zap} />
                  <DetailItem label="Modelo Regulador" value={equipment.regulatorModel} icon={Zap} />
                </div>
            </div>
          )}
          {activeView === 'hist-preventivo' && (
             <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h2 className="text-2xl font-semibold text-primary flex items-center">
                    <HistoryIcon size={24} className="mr-3 text-accent" />
                    Historial de Mantenimientos Preventivos
                  </h2>
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                    <Link href={`/equipment/${equipment.id}/register`}>
                      <PlusCircle size={16} className="mr-2" /> Registrar Mantenimiento
                    </Link>
                  </Button>
                </div>
                {sortedMaintenanceRecords.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Ingenieros</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedMaintenanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatTableDate(record.date)}</TableCell>
                            <TableCell>{record.technician}</TableCell>
                            <TableCell className="max-w-xs whitespace-pre-wrap">{record.description}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button asChild size="icon" variant="outline" className="h-8 w-8 hover:border-accent hover:text-accent">
                                <Link href={`/equipment/${equipment.id}/maintenance/${record.id}/edit`}>
                                  <Edit size={16} />
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8 hover:border-destructive hover:text-destructive" disabled={isDeletingPreventiveRecord === record.id}>
                                    {isDeletingPreventiveRecord === record.id ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={16} />
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
                                      Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de mantenimiento preventivo del {formatTableDate(record.date)}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeletePreventiveRecord(record.id)}
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
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No se ha registrado ningún mantenimiento preventivo para este equipo.
                  </p>
                )}
              </div>
          )}
          {activeView === 'hist-correctivo' && (
             <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h2 className="text-2xl font-semibold text-primary flex items-center">
                    <Wrench size={24} className="mr-3 text-accent" />
                    Historial de Mantenimientos Correctivos
                  </h2>
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                    <Link href={`/equipment/${equipment.id}/register-corrective`}>
                      <PlusCircle size={16} className="mr-2" /> Registrar Mantenimiento
                    </Link>
                  </Button>
                </div>
                {sortedCorrectiveMaintenanceRecords.length > 0 ? (
                   <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Ingenieros</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedCorrectiveMaintenanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatTableDate(record.date)}</TableCell>
                            <TableCell>{record.technician}</TableCell>
                            <TableCell>{record.description}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="icon" variant="outline" className="h-8 w-8 hover:border-accent hover:text-accent" disabled>
                                <Edit size={16} />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8 hover:border-destructive hover:text-destructive" disabled={isDeletingCorrectiveRecord === record.id}>
                                    {isDeletingCorrectiveRecord === record.id ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={16} />
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
                                      Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de mantenimiento correctivo del {formatTableDate(record.date)}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteCorrectiveRecord(record.id)}
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
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No se ha registrado ningún mantenimiento correctivo para este equipo.
                  </p>
                )}
              </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href={`/equipment/${equipment.id}/edit`}>
              <Edit3 size={20} className="mr-2" /> Modificar datos de Equipo
            </Link>
          </Button>
      </div>

    </div>
  );
};

export default EquipmentDetailClientPage;
