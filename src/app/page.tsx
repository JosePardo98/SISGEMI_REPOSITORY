import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import EquipmentClientPage from '@/components/equipment/EquipmentClientPage';

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <EquipmentClientPage />
      </PageWrapper>
    </>
  );
}
