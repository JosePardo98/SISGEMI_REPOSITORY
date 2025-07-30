
'use client';

import React, { useState } from 'react';
import AlertsCard from '@/components/equipment/AlertsCard';
import MaintenanceChart from '@/components/equipment/MaintenanceChart';
import EquipmentClientPage from '@/components/equipment/EquipmentClientPage';
import TicketsClientPage from '@/components/tickets/TicketsClientPage';
import PeripheralMaintenanceClientPage from '@/components/peripherals/PeripheralMaintenanceClientPage';
import { Button } from '@/components/ui/button';

export default function HomePageClient() {
  const [activeView, setActiveView] = useState('panel');

  const NavButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => {
    const lines = label.split('\n');
    return (
        <Button
            onClick={onClick}
            variant="ghost"
            className={`h-auto flex-shrink-0 flex-col items-center justify-center p-2 rounded-md shadow-sm transition-transform transform hover:scale-105 ${isActive ? 'bg-card text-primary font-bold' : 'bg-secondary hover:bg-muted text-secondary-foreground'}`}
            style={{ minWidth: '130px', height: '60px' }}
        >
            {lines.map((line, index) => <span key={index} className="leading-tight text-sm text-center whitespace-normal">{line}</span>)}
        </Button>
    );
  };

  const menuItems = [
    { id: 'panel', label: 'Panel' },
    { id: 'registro-mantenimientos', label: 'Registro de\nMantenimientos' },
    { id: 'mantenimiento-perifericos', label: 'Mantenimiento a\nPeriféricos' },
    { id: 'tickets', label: 'Tickets' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'panel':
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                <div className="lg:col-span-1">
                    <AlertsCard />
                </div>
                <div className="lg:col-span-2">
                    <MaintenanceChart />
                </div>
            </div>
        );
      case 'registro-mantenimientos':
        return <EquipmentClientPage />;
      case 'mantenimiento-perifericos':
        return <PeripheralMaintenanceClientPage />;
      case 'tickets':
        return <TicketsClientPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-headline font-semibold">
                        Bitácora Master (JAD Matamoros Planta II)
                    </h1>
                </div>
                <nav className="flex items-center justify-center -mx-4 px-2 py-2 bg-primary/90">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                        {menuItems.map(item => (
                            <NavButton 
                                key={item.id}
                                label={item.label}
                                isActive={activeView === item.id}
                                onClick={() => setActiveView(item.id)}
                            />
                        ))}
                    </div>
                </nav>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
