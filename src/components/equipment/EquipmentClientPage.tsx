
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
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-10 w-full" />
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
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline font-bold text-primary">Lista de Equipos</h2>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/equipment/new">
            <PlusCircle size={20} className="mr-2" />
            Agregar Nuevo Equipo
          </Link>
        </Button>
      </div>
      <EquipmentTable equipments={equipments} />
    </div>
  );
};

export default EquipmentClientPage;
