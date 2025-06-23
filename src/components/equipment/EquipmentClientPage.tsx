
'use client';

import React, { useEffect, useState } from 'react';
import type { Equipment } from '@/lib/types';
import { getEquipments } from '@/lib/actions';
import { EquipmentTable } from './EquipmentTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, PlusCircle, Printer, ScanLine, Receipt, Computer, Router, Speaker } from 'lucide-react'; // Changed HardDrive to Computer, added Speaker
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const EquipmentClientPage: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEquipments();
        setEquipments(data);
      } catch (err) {
        setError('Error al cargar los equipos. Por favor, intente de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipments();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-3">
      <AccordionItem value="item-1" className="border rounded-lg shadow-sm overflow-hidden">
        <AccordionTrigger 
          className="p-4 text-2xl font-headline font-semibold text-primary hover:no-underline flex items-center justify-between w-full text-left bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center">
            <Computer size={28} className="mr-3 text-accent" />
            Mantenimiento de Equipos de Cómputo
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2 p-4 border-t border-border"> 
          <div className="space-y-6">
            <div className="flex justify-end items-center pt-2"> 
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/equipment/new">
                  <PlusCircle size={20} className="mr-2" />
                  Agregar Nuevo Equipo
                </Link>
              </Button>
            </div>
            <EquipmentTable equipments={equipments} />
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="item-peripherals-main" className="border rounded-lg shadow-sm overflow-hidden">
        <AccordionTrigger
          className="p-4 text-2xl font-headline font-semibold text-primary hover:no-underline flex items-center justify-between w-full text-left bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center">
            <Speaker size={28} className="mr-3 text-accent" />
            Mantenimiento de Equipos Periféricos
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-2 border-t border-border">
          <Accordion type="multiple" className="w-full space-y-2">
            <AccordionItem value="item-2" className="border rounded-lg shadow-sm overflow-hidden bg-secondary/20">
              <AccordionTrigger 
                className="p-3 text-lg font-headline font-semibold text-primary/90 hover:no-underline flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center">
                  <Printer size={22} className="mr-3 text-accent/90" />
                   Impresoras y Escáneres
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 p-4 border-t border-border bg-background"> 
                <div className="space-y-4">
                  <div className="flex justify-end items-center"> 
                    <Button asChild className="bg-primary/90 hover:bg-primary/80" size="sm" disabled>
                      <Link href="#">
                        <PlusCircle size={18} className="mr-2" />
                        Agregar Impresora/Escáner (Próximamente)
                      </Link>
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">La gestión de impresoras y escáneres estará disponible próximamente.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg shadow-sm overflow-hidden bg-secondary/20">
              <AccordionTrigger 
                className="p-3 text-lg font-headline font-semibold text-primary/90 hover:no-underline flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center">
                  <Receipt size={22} className="mr-3 text-accent/90" />
                  Impresoras de Tickets
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 p-4 border-t border-border bg-background"> 
                <div className="space-y-4">
                  <div className="flex justify-end items-center"> 
                    <Button asChild className="bg-primary/90 hover:bg-primary/80" size="sm" disabled>
                      <Link href="#">
                        <PlusCircle size={18} className="mr-2" />
                        Agregar Impresora de Tickets (Próximamente)
                      </Link>
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">La gestión de impresoras de tickets estará disponible próximamente.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg shadow-sm overflow-hidden bg-secondary/20">
              <AccordionTrigger 
                className="p-3 text-lg font-headline font-semibold text-primary/90 hover:no-underline flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center">
                  <Router size={22} className="mr-3 text-accent/90" />
                  Switches, Modems y Enrutadores
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 p-4 border-t border-border bg-background">
                 <div className="space-y-4">
                  <div className="flex justify-end items-center"> 
                    <Button asChild className="bg-primary/90 hover:bg-primary/80" size="sm" disabled>
                      <Link href="#">
                        <PlusCircle size={18} className="mr-2" />
                        Agregar Dispositivo de Red (Próximamente)
                      </Link>
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">La gestión de switches, modems y enrutadores estará disponible próximamente.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border rounded-lg shadow-sm overflow-hidden bg-secondary/20">
              <AccordionTrigger 
                className="p-3 text-lg font-headline font-semibold text-primary/90 hover:no-underline flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center">
                  <ScanLine size={22} className="mr-3 text-accent/90" />
                  Otros Dispositivos
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 p-4 border-t border-border bg-background">
                 <div className="space-y-4">
                  <div className="flex justify-end items-center"> 
                    <Button asChild className="bg-primary/90 hover:bg-primary/80" size="sm" disabled>
                      <Link href="#">
                        <PlusCircle size={18} className="mr-2" />
                        Agregar Otro Dispositivo (Próximamente)
                      </Link>
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">La gestión de otros tipos de dispositivos estará disponible próximamente.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default EquipmentClientPage;
