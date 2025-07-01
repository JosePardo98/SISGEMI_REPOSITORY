'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import AlertsCard from '@/components/equipment/AlertsCard';
import MaintenanceChart from '@/components/equipment/MaintenanceChart';
import EquipmentClientPage from '@/components/equipment/EquipmentClientPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Computer } from 'lucide-react';
import RegisteredEquipmentCard from '@/components/equipment/RegisteredEquipmentCard';

const JadLogo = () => (
    <div className="bg-white px-4 flex flex-col items-center justify-evenly shadow-lg h-full w-auto">
        <Image src="/logo-jad.png" alt="JAD Matamoros Logo" width={220} height={70} unoptimized={true} />
        <div className="text-sm text-black font-semibold tracking-wider">SISGEMI</div>
    </div>
);

const NavButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => {
    const lines = label.split('\n');
    return (
        <Button
            onClick={onClick}
            variant="ghost"
            className={`h-auto flex-col items-center justify-center p-2 rounded-md shadow-md transition-transform transform hover:scale-105 ${isActive ? 'bg-white text-primary font-bold' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            style={{ minWidth: '140px', height: '60px' }}
        >
            {lines.map((line, index) => <span key={index} className="leading-tight text-sm">{line}</span>)}
        </Button>
    );
};

export default function HomePage() {
  const [activeView, setActiveView] = useState('panel');

  const menuItems = [
    { id: 'panel', label: 'Panel' },
    { id: 'registro-mantenimientos', label: 'Registro de\nMantenimientos' },
    { id: 'perifericos', label: 'Mantenimiento de\nPeriféricos' },
    { id: 'tickets', label: 'Tickets' },
    { id: 'calendarios', label: 'Calendarios' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'panel':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
            <div className="lg:col-span-2 space-y-8">
              <AlertsCard />
              <RegisteredEquipmentCard />
            </div>
            <div className="lg:col-span-3">
              <MaintenanceChart />
            </div>
          </div>
        );
      case 'registro-mantenimientos':
        return <EquipmentClientPage />;
      case 'perifericos':
        return (
            <Card className="mt-6 shadow-lg animate-fade-in">
                <CardHeader><CardTitle>Mantenimiento de Equipos Periféricos</CardTitle></CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="printers">
                            <AccordionTrigger>Impresoras y Escáneres</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground p-4">La gestión de impresoras y escáneres estará disponible próximamente.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="ticket-printers">
                            <AccordionTrigger>Impresoras de Tickets</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground p-4">La gestión de impresoras de tickets estará disponible próximamente.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="networking">
                            <AccordionTrigger>Switches, Modems y Enrutadores</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground p-4">La gestión de equipos de red estará disponible próximamente.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="other">
                            <AccordionTrigger>Otros Dispositivos</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground p-4">La gestión de otros dispositivos periféricos estará disponible próximamente.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        );
      case 'tickets':
        return (
            <Card className="mt-6 shadow-lg animate-fade-in">
                <CardHeader><CardTitle>Tickets para Mantenimiento</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">La gestión de tickets para mantenimientos estará disponible próximamente.</p></CardContent>
            </Card>
        );
      case 'calendarios':
        return (
            <Card className="mt-6 shadow-lg animate-fade-in">
                <CardHeader><CardTitle>Calendarios de Mantenimiento</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">La visualización de calendarios de mantenimiento estará disponible próximamente.</p></CardContent>
            </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex items-stretch" style={{ height: '140px' }}>
          <div className="flex-shrink-0">
            <JadLogo />
          </div>
          <div className="flex-grow flex flex-col">
            <div className="bg-primary text-primary-foreground flex-grow flex items-center px-6">
               <Computer size={32} className="mr-3" />
               <h1 className="text-xl md:text-2xl font-headline font-semibold">
                 SISGEMI: Gestión de Mantenimiento (JAD Matamoros Planta II)
               </h1>
            </div>
            <div className="bg-primary/90 flex-grow flex items-center px-4">
                <nav className="flex items-center space-x-2">
                    {menuItems.map(item => (
                        <NavButton 
                          key={item.id}
                          label={item.label}
                          isActive={activeView === item.id}
                          onClick={() => setActiveView(item.id)}
                        />
                    ))}
                </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
