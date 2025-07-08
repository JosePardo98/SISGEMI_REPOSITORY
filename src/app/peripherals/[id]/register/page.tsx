import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import RegisterPeripheralMaintenanceClientPage from '@/components/peripherals/RegisterPeripheralMaintenanceClientPage';

interface RegisterMaintenancePageProps {
  params: {
    id: string;
  };
}

export default function RegisterPeripheralMaintenancePage({ params }: RegisterMaintenancePageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <RegisterPeripheralMaintenanceClientPage peripheralId={params.id} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: RegisterMaintenancePageProps) {
  return {
    title: `Registrar Mantenimiento para Periférico ${params.id} - SISGEMI`,
  };
}
