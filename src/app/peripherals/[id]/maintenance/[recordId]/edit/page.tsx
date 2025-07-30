import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import EditPeripheralMaintenanceRecordClientPage from '@/components/peripherals/EditPeripheralMaintenanceRecordClientPage';

interface EditMaintenanceRecordPageProps {
  params: {
    id: string; // Peripheral ID
    recordId: string; // Maintenance Record ID
  };
}

export default function EditPeripheralMaintenanceRecordPage({ params }: EditMaintenanceRecordPageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <EditPeripheralMaintenanceRecordClientPage peripheralId={params.id} recordId={params.recordId} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: EditMaintenanceRecordPageProps) {
  return {
    title: `Modificar Registro de Mantenimiento de Periférico ${params.recordId} - Bitácora Master`,
  };
}
