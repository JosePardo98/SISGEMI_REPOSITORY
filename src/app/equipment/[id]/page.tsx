import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import EquipmentDetailClientPage from '@/components/equipment/EquipmentDetailClientPage';

interface EquipmentDetailPageProps {
  params: {
    id: string;
  };
}

export default function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <EquipmentDetailClientPage equipmentId={params.id} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: EquipmentDetailPageProps) {
  // In a real app, fetch equipment name for a dynamic title
  return {
    title: `Detalles del Equipo ${params.id} - Bitácora Master`,
  };
}
