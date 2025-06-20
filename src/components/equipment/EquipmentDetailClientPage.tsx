
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { Equipment, MaintenanceRecord, CorrectiveMaintenanceRecord } from '@/lib/types';
import { getEquipmentById, getMaintenanceRecordsForEquipment, getCorrectiveMaintenanceRecordsForEquipment, deleteMaintenanceRecord, deleteCorrectiveMaintenanceRecord } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit3, Info, Computer, Server, Laptop, Mouse, Monitor, Keyboard, Zap, HelpCircle, Archive, Wrench, Briefcase, FileText, History as HistoryIcon, Trash2, Edit, AlertTriangle, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

const DetailItem: React.FC<{ label: string; value?: string; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="flex items-start py-1">
    {Icon && <Icon size={18} className="mr-2 mt-0.5 text-accent flex-shrink-0" />}
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
      setError('Error al cargar los detalles del equipo.');
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
        description: 'No se pudo eliminar el registro de mantenimiento preventivo.',
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
        description: 'No se pudo eliminar el registro de mantenimiento correctivo.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingCorrectiveRecord(null);
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-1/3" />
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

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="outline" className="mb-6 shadow-sm hover:shadow-md transition-shadow">
          <Link href="/">
            <ArrowLeft size={16} className="mr-2" /> Volver a la Lista
          </Link>
        </Button>
      </div>

      <Card className="border rounded-lg shadow-xl overflow-hidden">
        <CardHeader className="bg-secondary/50 p-6">
          <div className="flex flex-col">
            <CardTitle className="text-3xl font-headline font-bold text-primary flex items-center">
              {equipment.type?.toLowerCase().includes('laptop') ? <Laptop size={32} className="mr-3 text-accent" /> : <Computer size={32} className="mr-3 text-accent" />}
              {equipment.name}
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground">ID PC: {equipment.id}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="multiple" defaultValue={['info-pc', 'hist-preventivo']} className="w-full">
            <AccordionItem value="info-pc" className="border-b">
              <AccordionTrigger className="px-6 py-4 text-xl font-semibold text-primary hover:no-underline flex items-center justify-between w-full text-left hover:bg-secondary/20 transition-colors">
                <div className="flex items-center">
                  <FileText size={24} className="mr-3 text-accent" />
                  Información de PC
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                  <DetailItem label="Procesador" value={equipment.processor} icon={Server} />
                  <DetailItem label="Memoria RAM" value={equipment.ramAmount} icon={Info} />
                  <DetailItem label="Tipo de RAM" value={equipment.ramType} icon={Info} />
                  <DetailItem label="Capacidad Disco" value={equipment.storageCapacity} icon={Archive}/>
                  <DetailItem label="Tipo Disco" value={equipment.storageType} icon={Archive}/>
                  <DetailItem label="Sistema Operativo" value={equipment.os} icon={Computer} />
                  <DetailItem label="Dirección IP" value={equipment.ipAddress} icon={Info} />
                  <DetailItem label="Tipo de Equipo (IA)" value={equipment.type} icon={HelpCircle} />
                </div>
                <div className="mt-2">
                  <DetailItem label="Puntos Comunes de Falla (IA)" value={equipment.commonFailurePoints} icon={Zap} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="info-inventario" className="border-b">
              <AccordionTrigger className="px-6 py-4 text-xl font-semibold text-primary hover:no-underline flex items-center justify-between w-full text-left hover:bg-secondary/20 transition-colors">
                <div className="flex items-center">
                  <Briefcase size={24} className="mr-3 text-accent" />
                  Información de Inventario
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                  <DetailItem label="Nombre de Usuario" value={equipment.userName} />
                  <DetailItem label="No. Patrimonial PC" value={equipment.pcPatrimonialId} />
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
                  <DetailItem label="Estado de PC" value={equipment.pcStatus} />
                  <DetailItem label="¿Piezas reutilizables?" value={equipment.reusableParts} />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="hist-preventivo" className="border-b">
              <AccordionTrigger className="px-6 py-4 text-xl font-semibold text-primary hover:no-underline flex items-center justify-between w-full text-left hover:bg-secondary/20 transition-colors">
                <div className="flex items-center">
                  <HistoryIcon size={26} className="mr-3 text-accent" />
                  Historial de Mantenimientos Preventivos
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6 space-y-4">
                 <div className="flex justify-end">
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                    <Link href={`/equipment/${equipment.id}/register`}>
                      <PlusCircle size={16} className="mr-2" /> Registrar Mantenimiento Preventivo
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
                            <TableCell>{record.description}</TableCell>
                            <TableCell className="text-right space-x-4">
                              <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                <Link href={`/equipment/${equipment.id}/maintenance/${record.id}/edit`}>
                                  <Edit size={16} className="mr-1" /> Modificar
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" disabled={isDeletingPreventiveRecord === record.id}>
                                    {isDeletingPreventiveRecord === record.id ? (
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="hist-correctivo" className="border-b-0">
              <AccordionTrigger className="px-6 py-4 text-xl font-semibold text-primary hover:no-underline flex items-center justify-between w-full text-left hover:bg-secondary/20 transition-colors">
                <div className="flex items-center">
                  <Wrench size={26} className="mr-3 text-accent" />
                  Historial de Mantenimientos Correctivos
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6 space-y-4">
                <div className="flex justify-end">
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                    <Link href={`/equipment/${equipment.id}/register-corrective`}>
                      <PlusCircle size={16} className="mr-2" /> Registrar Mantenimiento Correctivo
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
                            <TableCell className="text-right space-x-4">
                              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled>
                                <Edit size={16} className="mr-1" /> Modificar
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" disabled={isDeletingCorrectiveRecord === record.id}>
                                    {isDeletingCorrectiveRecord === record.id ? (
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
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>

        <CardFooter className="bg-secondary/50 p-6 flex flex-col md:flex-row justify-center items-center gap-4 border-t">
            <Button asChild size="lg" className="w-full md:w-auto shadow-md hover:shadow-lg transition-shadow bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href={`/equipment/${equipment.id}/edit`}>
                <Edit3 size={20} className="mr-2" /> Modificar datos de Equipo
              </Link>
            </Button>
          </CardFooter>
      </Card>
      
    </div>
  );
};

export default EquipmentDetailClientPage;

