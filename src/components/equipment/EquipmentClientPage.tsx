
'use client';

import React, { useEffect, useState } from 'react';
import type { Equipment } from '@/lib/types';
import { getEquipments } from '@/lib/actions';
import { EquipmentTable } from './EquipmentTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, PlusCircle } from 'lucide-react';
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
        {/* Skeleton for AccordionTrigger */}
        <Skeleton className="h-14 w-full rounded-md" />
        {/* Skeletons for AccordionContent (assuming it's open) */}
        <div className="space-y-6 pt-4 pl-2 pr-2">
          <div className="flex justify-end">
            <Skeleton className="h-10 w-48 rounded-md" /> {/* Add button */}
          </div>
          <Skeleton className="h-64 w-full rounded-md" /> {/* Table */}
        </div>
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
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
      <AccordionItem value="item-1" className="border-b-0"> {/* No bottom border for a cleaner section look */}
        <AccordionTrigger 
          className="py-3 text-3xl font-headline font-bold text-primary hover:no-underline flex items-center justify-between w-full text-left"
        >
          Equipos de Cómputo
        </AccordionTrigger>
        <AccordionContent className="pt-2"> 
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
    </Accordion>
  );
};

export default EquipmentClientPage;
