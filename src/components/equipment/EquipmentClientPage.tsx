
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { Equipment } from '@/lib/types';
import { getEquipments } from '@/lib/actions';
import { EquipmentTable } from './EquipmentTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EquipmentClientPage: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipments = useCallback(async () => {
    try {
      setError(null);
      const data = await getEquipments();
      setEquipments(data);
    } catch (err) {
      setError('Error al cargar los equipos. Por favor, intente de nuevo más tarde.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchEquipments().finally(() => setLoading(false));
  }, [fetchEquipments]);

  if (loading) {
    return (
      <Card className="shadow-lg animate-fade-in">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive" className="mt-6 animate-fade-in">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="animate-fade-in">
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                <CardTitle>Mantenimientos a Equipos de Cómputo</CardTitle>
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/equipment/new">
                    <PlusCircle size={20} className="mr-2" />
                    Agregar Nuevo Equipo
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <EquipmentTable equipments={equipments} onEquipmentDeleted={fetchEquipments} />
            </CardContent>
        </Card>
    </div>
  );
};

export default EquipmentClientPage;
