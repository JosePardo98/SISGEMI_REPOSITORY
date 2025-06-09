
import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import AddEquipmentClientPage from '@/components/equipment/AddEquipmentClientPage';

export default function AddEquipmentPage() {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <AddEquipmentClientPage />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata() {
  return {
    title: 'Agregar Nuevo Equipo - SISGEMI',
  };
}
