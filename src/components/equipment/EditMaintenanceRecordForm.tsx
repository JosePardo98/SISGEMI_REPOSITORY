'use client';

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { getMaintenanceRecordById, updateMaintenanceRecord } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { MaintenanceRecord } from '@/lib/types';
import { format, parseISO } from 'date-fns';

const maintenanceSchema = z.object({
  date: z.string().min(1, "La fecha es requerida."),
  technician: z.string().min(1, "El nombre del técnico es requerido."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface EditMaintenanceFormProps {
  equipmentId: string;
  recordId: string;
  onSuccess?: () => void;
}

const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch (e) {
    console.warn("Invalid date string for input:", dateString);
    return ''; 
  }
};

export const EditMaintenanceRecordForm: React.FC<EditMaintenanceFormProps> = ({ equipmentId, recordId, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [equipmentName, setEquipmentName] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
  });

  useEffect(() => {
    const fetchRecordData = async () => {
      setIsLoadingData(true);
      try {
        const record = await getMaintenanceRecordById(recordId);
        const { getEquipmentById } = await import('@/lib/actions');
        const equipment = await getEquipmentById(equipmentId);
        if (equipment) {
          setEquipmentName(equipment.name);
        }

        if (record) {
          reset({
            date: formatDateForInput(record.date),
            technician: record.technician,
            description: record.description,
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudo cargar la información del registro de mantenimiento.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error al Cargar Datos",
          description: error instanceof Error ? error.message : "Hubo un problema al obtener los detalles del registro.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchRecordData();
  }, [recordId, equipmentId, reset, toast]);

  const onSubmit: SubmitHandler<MaintenanceFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await updateMaintenanceRecord(recordId, equipmentId, data);
      toast({
        title: "Registro Actualizado",
        description: `El registro de mantenimiento ha sido actualizado exitosamente.`,
        variant: "default",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error actualizando registro de mantenimiento:", error);
      toast({
        title: "Error al Actualizar",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar los cambios.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingData) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Cargando Datos del Registro...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 size={48} className="animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Modificar Registro de Mantenimiento</CardTitle>
        <CardDescription>Para: <span className="font-semibold">{equipmentName || equipmentId}</span> (ID Registro: {recordId})</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maintenance-date">Fecha</Label>
            <Input id="maintenance-date" type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance-tecnico">Técnico</Label>
            <Input id="maintenance-tecnico" placeholder="Ej: Juan Pérez" {...register('technician')} />
            {errors.technician && <p className="text-sm text-destructive">{errors.technician.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance-descripcion">Descripción</Label>
            <Textarea 
              id="maintenance-descripcion" 
              rows={5} 
              placeholder="Ej: Limpieza de componentes, actualización de software, revisión de virus." 
              {...register('description')} 
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || isLoadingData} className="w-full bg-primary hover:bg-primary/90">
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" /> Guardando Cambios...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" /> Guardar Cambios
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
