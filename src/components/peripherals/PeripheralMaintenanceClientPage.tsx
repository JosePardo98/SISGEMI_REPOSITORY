'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HardDrive } from 'lucide-react';

const PeripheralMaintenanceClientPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="mr-3" />
            Mantenimiento a Periféricos
          </CardTitle>
          <CardDescription>
            Esta sección está en construcción. Aquí podrás gestionar el mantenimiento de periféricos como impresoras, scanners, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-10">Próximamente disponible.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeripheralMaintenanceClientPage;
