'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addPeripheralMaintenanceRecord } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

const maintenanceSchema = z.object({
  date: z.string().min(1, "La fecha es requerida."),
  technician: z.string().min(1, "El nombre del técnico es requerido."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  type: z.enum(['Preventivo', 'Correctivo'], { required_error: "Debe seleccionar un tipo de mantenimiento." }),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface RegisterPeripheralMaintenanceFormProps {
  peripheralId: string;
  peripheralType: string;
  onSuccess?: () => void;
}

export const RegisterPeripheralMaintenanceForm: React.FC<RegisterPeripheralMaintenanceFormProps> = ({ peripheralId, peripheralType, onSuccess }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      technician: '',
      description: '',
      type: 'Preventivo',
    }
  });

  const onSubmit: SubmitHandler<MaintenanceFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await addPeripheralMaintenanceRecord({ ...data, peripheralId });
      toast({
        title: "Mantenimiento Registrado",
        description: `El mantenimiento para ${peripheralType} ha sido guardado.`,
        variant: "default",
      });
      reset();
      if (onSuccess) onSuccess();
      router.push(`/peripherals/${peripheralId}`);
    } catch (error) {
      console.error("Error registering maintenance:", error);
      toast({
        title: "Error al Registrar",
        description: error instanceof Error ? error.message : "Hubo un problema al guardar.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Registrar Mantenimiento de Periférico</CardTitle>
        <CardDescription>Para: <span className="font-semibold">{peripheralType} (ID: {peripheralId})</span></CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maintenance-date">Fecha</Label>
              <Input id="maintenance-date" type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance-type">Tipo de Mantenimiento</Label>
              <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="maintenance-type">
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventivo">Preventivo</SelectItem>
                        <SelectItem value="Correctivo">Correctivo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>
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
              placeholder="Ej: Limpieza de cabezales, cambio de cartucho de tóner, etc." 
              {...register('description')} 
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90">
            {isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
            {isSubmitting ? 'Guardando...' : 'Guardar Mantenimiento'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
