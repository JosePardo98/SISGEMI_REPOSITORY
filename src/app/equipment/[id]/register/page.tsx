import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import RegisterMaintenanceClientPage from '@/components/equipment/RegisterMaintenanceClientPage';

interface RegisterMaintenancePageProps {
  params: {
    id: string;
  };
}

export default function RegisterMaintenancePage({ params }: RegisterMaintenancePageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <RegisterMaintenanceClientPage equipmentId={params.id} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: RegisterMaintenancePageProps) {
  return {
    title: `Registrar Mantenimiento para Equipo ${params.id} - SISGEMI`,
  };
}
