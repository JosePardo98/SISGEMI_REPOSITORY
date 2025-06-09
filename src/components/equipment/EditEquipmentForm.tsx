
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
import { getEquipmentById, updateEquipment } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { Equipment } from '@/lib/types';
import { format, parseISO } from 'date-fns';

// Schema for editable fields
const equipmentFormSchema = z.object({
  name: z.string().min(1, "El nombre del PC es requerido.").max(50, "El nombre no debe exceder los 50 caracteres."),
  os: z.string().min(1, "El sistema operativo es requerido.").max(50, "El SO no debe exceder los 50 caracteres."),
  type: z.string().min(1, "El tipo de equipo es requerido.").max(50, "El tipo no debe exceder los 50 caracteres."),
  commonFailurePoints: z.string().min(1, "Los puntos comunes de falla son requeridos.").max(200, "Puntos de falla no debe exceder 200 caracteres."),
  specifications: z.string().min(1, "Las especificaciones son requeridas.").max(300, "Especificaciones no debe exceder 300 caracteres."),
  lastMaintenanceDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
  nextMaintenanceDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
});

export type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

interface EditEquipmentFormProps {
  equipmentId: string;
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

export const EditEquipmentForm: React.FC<EditEquipmentFormProps> = ({ equipmentId, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [initialEquipmentName, setInitialEquipmentName] = useState('');


  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentFormSchema),
  });

  useEffect(() => {
    const fetchEquipmentData = async () => {
      setIsLoadingData(true);
      try {
        const equipment = await getEquipmentById(equipmentId);
        if (equipment) {
          setInitialEquipmentName(equipment.name);
          reset({
            name: equipment.name,
            os: equipment.os,
            type: equipment.type,
            commonFailurePoints: equipment.commonFailurePoints,
            specifications: equipment.specifications,
            lastMaintenanceDate: formatDateForInput(equipment.lastMaintenanceDate),
            nextMaintenanceDate: formatDateForInput(equipment.nextMaintenanceDate),
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudo cargar la información del equipo.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error al Cargar Datos",
          description: "Hubo un problema al obtener los detalles del equipo.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchEquipmentData();
  }, [equipmentId, reset, toast]);


  const onSubmit: SubmitHandler<EquipmentFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      // Construct the data to send, ensuring dates are correctly formatted or undefined
      const payload: Partial<Equipment> = {
        ...data,
        lastMaintenanceDate: data.lastMaintenanceDate || undefined,
        nextMaintenanceDate: data.nextMaintenanceDate || undefined,
      };
      await updateEquipment(equipmentId, payload);
      toast({
        title: "Equipo Actualizado",
        description: `El equipo ${data.name} ha sido actualizado exitosamente. (Simulado)`,
        variant: "default",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error actualizando equipo:", error);
      toast({
        title: "Error al Actualizar Equipo",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar los cambios. Intente de nuevo.",
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
          <CardTitle className="text-2xl font-headline text-primary">Cargando Datos del Equipo...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 size={48} className="animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Modificar Equipo: {initialEquipmentName}</CardTitle>
        <CardDescription>ID PC: {equipmentId} (No editable)</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="equipment-name">Nombre PC</Label>
            <Input id="equipment-name" placeholder="Ej: Ventas-PC03" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="equipment-os">Sistema Operativo</Label>
              <Input id="equipment-os" placeholder="Ej: Windows 11 Pro" {...register('os')} />
              {errors.os && <p className="text-sm text-destructive">{errors.os.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment-type">Tipo de Equipo</Label>
              <Input id="equipment-type" placeholder="Ej: Desktop CPU, Laptop, Servidor" {...register('type')} />
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="equipment-specifications">Especificaciones</Label>
            <Textarea 
              id="equipment-specifications" 
              rows={3} 
              placeholder="Ej: Intel Core i3, 4GB RAM, 128GB SSD" 
              {...register('specifications')} 
            />
            {errors.specifications && <p className="text-sm text-destructive">{errors.specifications.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment-commonFailurePoints">Puntos Comunes de Falla</Label>
            <Textarea 
              id="equipment-commonFailurePoints" 
              rows={3} 
              placeholder="Ej: Fuente de poder, sobrecalentamiento por polvo" 
              {...register('commonFailurePoints')} 
            />
            {errors.commonFailurePoints && <p className="text-sm text-destructive">{errors.commonFailurePoints.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="equipment-lastMaintenanceDate">Último Mantenimiento</Label>
              <Input id="equipment-lastMaintenanceDate" type="date" {...register('lastMaintenanceDate')} />
              {errors.lastMaintenanceDate && <p className="text-sm text-destructive">{errors.lastMaintenanceDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment-nextMaintenanceDate">Próximo Mantenimiento</Label>
              <Input id="equipment-nextMaintenanceDate" type="date" {...register('nextMaintenanceDate')} />
              {errors.nextMaintenanceDate && <p className="text-sm text-destructive">{errors.nextMaintenanceDate.message}</p>}
            </div>
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
