
import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import RegisterCorrectiveMaintenanceClientPage from '@/components/equipment/RegisterCorrectiveMaintenanceClientPage';

interface RegisterCorrectiveMaintenancePageProps {
  params: {
    id: string; // Equipment ID
  };
}

export default function RegisterCorrectiveMaintenancePage({ params }: RegisterCorrectiveMaintenancePageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <RegisterCorrectiveMaintenanceClientPage equipmentId={params.id} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: RegisterCorrectiveMaintenancePageProps) {
  // In a real app, you might fetch equipment name here for a dynamic title
  return {
    title: `Registrar Mantenimiento Correctivo para Equipo ${params.id} - SISGEMI`,
  };
}
