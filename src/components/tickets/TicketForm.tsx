'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addTicket } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

const ticketSchema = z.object({
  pcId: z.string().min(1, "El ID de la PC es requerido."),
  pcName: z.string().min(1, "El nombre de la PC es requerido."),
  userName: z.string().min(1, "El nombre de usuario es requerido."),
  patrimonialId: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  date: z.string().min(1, "La fecha es requerida."),
  assignedEngineer: z.string().min(1, "El ingeniero es requerido."),
  maintenanceType: z.enum(['Preventivo', 'Correctivo'], { required_error: "Debe seleccionar un tipo de mantenimiento." }),
  problemDescription: z.string().min(10, "La descripción del problema debe tener al menos 10 caracteres."),
  actionsTaken: z.string().min(10, "Las acciones de mantenimiento deben tener al menos 10 caracteres."),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  onTicketCreated?: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ onTicketCreated }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      pcId: '',
      pcName: '',
      userName: '',
      patrimonialId: '',
      brand: '',
      model: '',
      assignedEngineer: '',
      problemDescription: '',
      actionsTaken: '',
    },
  });

  const onSubmit: SubmitHandler<TicketFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await addTicket(data);
      toast({
        title: "Ticket Creado",
        description: `El ticket para la PC ${data.pcId} ha sido creado exitosamente.`,
      });
      reset();
      if (onTicketCreated) onTicketCreated();
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error al Crear Ticket",
        description: error instanceof Error ? error.message : "Hubo un problema al crear el ticket. Intente de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Generar Ticket para Mantenimiento</CardTitle>
        <CardDescription>Complete la información para generar un nuevo ticket de soporte.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-8 pt-6">
          {/* Datos de la PC */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">Datos de la PC</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pcId">ID PC</Label>
                <Input id="pcId" {...register('pcId')} />
                {errors.pcId && <p className="text-sm text-destructive">{errors.pcId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pcName">Nombre PC</Label>
                <Input id="pcName" {...register('pcName')} />
                {errors.pcName && <p className="text-sm text-destructive">{errors.pcName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="userName">Nombre de usuario</Label>
                <Input id="userName" {...register('userName')} />
                {errors.userName && <p className="text-sm text-destructive">{errors.userName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="patrimonialId">Numero de Patrimonio de PC</Label>
                <Input id="patrimonialId" {...register('patrimonialId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" {...register('brand')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" {...register('model')} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>
            </div>
          </div>
          
          {/* Datos de mantenimiento */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">Datos de mantenimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="assignedEngineer">Ingeniero encargado</Label>
                <Input id="assignedEngineer" {...register('assignedEngineer')} />
                {errors.assignedEngineer && <p className="text-sm text-destructive">{errors.assignedEngineer.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenanceType">Tipo de Mantenimiento</Label>
                <Controller
                  name="maintenanceType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="maintenanceType">
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventivo">Preventivo</SelectItem>
                        <SelectItem value="Correctivo">Correctivo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.maintenanceType && <p className="text-sm text-destructive">{errors.maintenanceType.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="problemDescription">Descripción del problema</Label>
              <Textarea id="problemDescription" rows={3} {...register('problemDescription')} />
              {errors.problemDescription && <p className="text-sm text-destructive">{errors.problemDescription.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionsTaken">Acciones de Mantenimiento</Label>
              <Textarea id="actionsTaken" rows={3} {...register('actionsTaken')} />
              {errors.actionsTaken && <p className="text-sm text-destructive">{errors.actionsTaken.message}</p>}
            </div>
          </div>

        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Enviando...' : 'Enviar Ticket'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TicketForm;
