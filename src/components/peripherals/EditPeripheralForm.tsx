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
import { getPeripheralById, updatePeripheral } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { Peripheral } from '@/lib/types';

const peripheralSchema = z.object({
  type: z.string().min(1, "El tipo es requerido."),
  patrimonialId: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  commonFailurePoints: z.string().min(1, "Los puntos comunes de falla son requeridos."),
});

type PeripheralFormData = z.infer<typeof peripheralSchema>;

interface EditPeripheralFormProps {
  peripheralId: string;
  onSuccess?: () => void;
}

export const EditPeripheralForm: React.FC<EditPeripheralFormProps> = ({ peripheralId, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PeripheralFormData>({
    resolver: zodResolver(peripheralSchema),
  });

  useEffect(() => {
    const fetchPeripheralData = async () => {
      setIsLoadingData(true);
      try {
        const peripheral = await getPeripheralById(peripheralId);
        if (peripheral) {
          reset({
            type: peripheral.type,
            commonFailurePoints: peripheral.commonFailurePoints,
            patrimonialId: peripheral.patrimonialId || '',
            brand: peripheral.brand || '',
            model: peripheral.model || '',
            location: peripheral.location || '',
            status: peripheral.status || '',
          });
        } else {
          toast({ title: "Error", description: "No se pudo cargar la información del periférico.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error al Cargar Datos", description: "Hubo un problema al obtener los detalles.", variant: "destructive" });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchPeripheralData();
  }, [peripheralId, reset, toast]);

  const onSubmit: SubmitHandler<PeripheralFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await updatePeripheral(peripheralId, data);
      toast({
        title: "Periférico Actualizado",
        description: `El periférico con ID ${peripheralId} ha sido actualizado.`,
        variant: "default",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error actualizando periférico:", error);
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
      <Card className="w-full shadow-xl"><CardHeader><CardTitle>Cargando...</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 size={48} className="animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Modificar Periférico</CardTitle>
        <CardDescription>ID Periférico: {peripheralId} (No editable)</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="peripheral-type">Tipo (para IA) <span className="text-destructive">*</span></Label>
              <Input id="peripheral-type" {...register('type')} />
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-location">Ubicación</Label>
              <Input id="peripheral-location" {...register('location')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-patrimonialId">No. Patrimonial</Label>
              <Input id="peripheral-patrimonialId" {...register('patrimonialId')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-brand">Marca</Label>
              <Input id="peripheral-brand" {...register('brand')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peripheral-model">Modelo</Label>
              <Input id="peripheral-model" {...register('model')} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="peripheral-status">Estado</Label>
              <Input id="peripheral-status" {...register('status')} />
            </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="peripheral-commonFailurePoints">Puntos Comunes de Falla (para IA) <span className="text-destructive">*</span></Label>
              <Textarea 
                id="peripheral-commonFailurePoints" 
                rows={3} 
                {...register('commonFailurePoints')} 
              />
              {errors.commonFailurePoints && <p className="text-sm text-destructive">{errors.commonFailurePoints.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || isLoadingData} className="w-full bg-primary hover:bg-primary/90">
            {isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
