
import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import EditEquipmentClientPage from '@/components/equipment/EditEquipmentClientPage';

interface EditEquipmentPageProps {
  params: {
    id: string;
  };
}

export default function EditEquipmentPage({ params }: EditEquipmentPageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <EditEquipmentClientPage equipmentId={params.id} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: EditEquipmentPageProps) {
  return {
    title: `Modificar Equipo ${params.id} - Bitácora Master`,
  };
}
