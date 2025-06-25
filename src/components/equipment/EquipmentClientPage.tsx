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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MaintenanceChart from './MaintenanceChart';
import AlertsCard from './AlertsCard';
import { cn } from '@/lib/utils';

const EquipmentClientPage: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('computo');

  useEffect(() => {
    const fetchEquipments = async () => {
      // Only fetch data if the relevant view is active
      if (activeView === 'computo') {
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
      } else {
        setLoading(false);
      }
    };
    fetchEquipments();
  }, [activeView]);

  const renderContent = () => {
    if (loading && activeView === 'computo') {
      return (
        <div className="space-y-4 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    switch (activeView) {
      case 'computo':
        return (
          <Card className="mt-6 shadow-lg animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                <CardTitle>Mantenimiento de Equipos de Cómputo</CardTitle>
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/equipment/new">
                    <PlusCircle size={20} className="mr-2" />
                    Agregar Nuevo Equipo
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <EquipmentTable equipments={equipments} />
            </CardContent>
          </Card>
        );
      case 'perifericos':
        return (
          <Card className="mt-6 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle>Mantenimiento de Equipos Periféricos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">La gestión de equipos periféricos estará disponible próximamente.</p>
            </CardContent>
          </Card>
        );
      case 'tickets':
         return (
          <Card className="mt-6 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle>Tickets para Mantenimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">La gestión de tickets para mantenimientos estará disponible próximamente.</p>
            </CardContent>
          </Card>
        );
      case 'calendarios':
         return (
          <Card className="mt-6 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle>Calendarios de Mantenimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">La visualización de calendarios de mantenimiento estará disponible próximamente.</p>
            </CardContent>
          </Card>
        );
      case 'usuarios':
         return (
          <Card className="mt-6 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle>Información de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">La gestión de información de usuarios estará disponible próximamente.</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };
  
  const NavButton = ({ viewName, children }: { viewName: string; children: React.ReactNode }) => (
    <Button
      onClick={() => setActiveView(viewName)}
      className={cn(
        'h-24 w-full text-base sm:text-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 rounded-xl shadow-md',
        activeView === viewName ? 'bg-primary ring-4 ring-primary/50 shadow-2xl scale-105' : 'bg-accent hover:bg-accent/90'
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
            <AlertsCard />
            <MaintenanceChart />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <NavButton viewName="computo">Mantenimiento de Equipo de Cómputo</NavButton>
                <NavButton viewName="perifericos">Mantenimiento de Equipos Periféricos</NavButton>
                <NavButton viewName="tickets">Tickets para Mantenimiento</NavButton>
                <NavButton viewName="calendarios">Calendarios de Mantenimiento</NavButton>
                <div className="sm:col-span-2 flex justify-center">
                  <div className="w-full sm:w-1/2">
                    <NavButton viewName="usuarios">Información de Usuarios</NavButton>
                  </div>
                </div>
            </div>

            <div className="mt-6">
              {renderContent()}
            </div>
        </div>
    </div>
  );
};

export default EquipmentClientPage;
