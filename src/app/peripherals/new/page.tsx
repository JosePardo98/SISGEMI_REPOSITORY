
import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import AddPeripheralClientPage from '@/components/peripherals/AddPeripheralClientPage';

export default function AddPeripheralPage() {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <AddPeripheralClientPage />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata() {
  return {
    title: 'Agregar Nuevo Periférico - SISGEMI',
  };
}
