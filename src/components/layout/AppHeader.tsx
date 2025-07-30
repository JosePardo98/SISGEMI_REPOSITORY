import React from 'react';
import { Computer } from 'lucide-react';

const AppHeader: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 md:py-6 flex items-center">
        <Computer size={32} className="mr-3" />
        <h1 className="text-xl md:text-2xl font-headline font-semibold">
          Bitácora Master (JAD Matamoros Planta II)
        </h1>
      </div>
    </header>
  );
};

export default AppHeader;
