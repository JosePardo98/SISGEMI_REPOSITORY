'use client';

import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar';
import AlertsCard from '@/components/equipment/AlertsCard';
import MaintenanceChart from '@/components/equipment/MaintenanceChart';
import EquipmentClientPage from '@/components/equipment/EquipmentClientPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// This is a placeholder for the logo based on the image provided.
const JadLogo = () => (
    <div className="p-4 bg-white rounded-md flex flex-col items-center shadow-md my-4 w-40">
        <svg width="100" height="50" viewBox="0 0 160 80" className="text-blue-800">
            <circle cx="30" cy="40" r="25" fill="currentColor"/>
            <text x="18" y="52" fontFamily="Arial, sans-serif" fontSize="30" fill="white" fontWeight="bold">J</text>
            <path d="M 30 40 a 25 25 0 0 1 0 -2.5" stroke="white" strokeWidth="2.5" fill="none"/>
            <path d="M 22 45 q 8 6 16 0" stroke="white" strokeWidth="2.5" fill="none"/>
            <path d="M 18 45 q 8 6 16 0" stroke="white" strokeWidth="2.5" fill="none"/>
            <text x="65" y="35" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="bold" fill="currentColor">JAD</text>
            <text x="65" y="60" fontFamily="Arial, sans-serif" fontSize="14" fill="#333" fontWeight="bold">MATAMOROS</text>
        </svg>
        <div className="text-sm text-red-600 mt-2 font-semibold tracking-wider">SISGEMI</div>
    </div>
);


export default function HomePage() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <AlertsCard />
            <MaintenanceChart />
          </div>
        );
      case 'mantenimientos':
        return <EquipmentClientPage />; // This component is now just the equipment table view
      case 'perifericos':
        return (
            <Card className="mt-6 shadow-lg animate-fade-in">
                <CardHeader><CardTitle>Equipos Periféricos</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">La gestión de equipos periféricos estará disponible próximamente.</p></CardContent>
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

  const menuItems = [
    { id: 'mantenimientos', label: 'Mantenimientos' },
    { id: 'perifericos', label: 'Equipos Periféricos' },
    { id: 'tickets', label: 'Tickets' },
    { id: 'calendarios', label: 'Calendarios' },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
        <SidebarProvider>
            <Sidebar className="bg-cyan-100 border-r-2 border-cyan-200" style={{backgroundColor: 'hsl(195, 75%, 92%)'}}>
                <SidebarHeader className="items-center">
                    <JadLogo />
                </SidebarHeader>
                <SidebarContent className="flex flex-col justify-start pt-4">
                    <div className="px-6 mb-4">
                        <h2 
                            className="text-lg font-bold border-b-2 border-red-500 inline-block pb-1 cursor-pointer"
                            onClick={() => setActiveView('dashboard')}
                        >
                            Dashboard
                        </h2>
                    </div>
                    <SidebarMenu>
                        {menuItems.map(item => (
                             <SidebarMenuItem key={item.id}>
                                <SidebarMenuButton 
                                    onClick={() => setActiveView(item.id)} 
                                    className="bg-white text-black hover:bg-gray-200 data-[active=true]:bg-primary data-[active=true]:text-white mx-4 font-medium" 
                                    isActive={activeView === item.id}
                                >
                                    {item.label}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <main className="flex-grow container mx-auto px-4 py-8">
                    {renderContent()}
                </main>
            </SidebarInset>
        </SidebarProvider>
    </div>
  );
}
