
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { Peripheral } from '@/lib/types';
import { getPeripherals } from '@/lib/actions';
import { PeripheralTable } from './PeripheralTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, PlusCircle, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PeripheralMaintenanceClientPage: React.FC = () => {
  const [peripherals, setPeripherals] = useState<Peripheral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeripherals = useCallback(async () => {
    try {
      setError(null);
      const data = await getPeripherals();
      setPeripherals(data);
    } catch (err) {
      setError('Error al cargar los periféricos. Por favor, intente de nuevo más tarde.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPeripherals().finally(() => setLoading(false));
  }, [fetchPeripherals]);

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
                <div>
                  <CardTitle className="flex items-center">
                    <HardDrive className="mr-3" />
                    Mantenimiento a Periféricos
                  </CardTitle>
                  <CardDescription>Gestione el mantenimiento de impresoras, scanners, etc.</CardDescription>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/peripherals/new">
                    <PlusCircle size={20} className="mr-2" />
                    Agregar Nuevo Periférico
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <PeripheralTable peripherals={peripherals} onPeripheralDeleted={fetchPeripherals} />
            </CardContent>
        </Card>
    </div>
  );
};

export default PeripheralMaintenanceClientPage;
