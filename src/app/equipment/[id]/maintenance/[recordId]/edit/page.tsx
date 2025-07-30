
import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import EditMaintenanceRecordClientPage from '@/components/equipment/EditMaintenanceRecordClientPage';

interface EditMaintenanceRecordPageProps {
  params: {
    id: string; // Equipment ID
    recordId: string; // Maintenance Record ID
  };
}

export default function EditMaintenanceRecordPage({ params }: EditMaintenanceRecordPageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <EditMaintenanceRecordClientPage equipmentId={params.id} recordId={params.recordId} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: EditMaintenanceRecordPageProps) {
  return {
    title: `Modificar Registro de Mantenimiento ${params.recordId} - Bitácora Master`,
  };
}
