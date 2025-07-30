import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-secondary text-secondary-foreground py-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Bitácora Master JAD Matamoros Planta II. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default PageWrapper;
