
import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import EditPeripheralClientPage from '@/components/peripherals/EditPeripheralClientPage';

interface EditPeripheralPageProps {
  params: {
    id: string;
  };
}

export default function EditPeripheralPage({ params }: EditPeripheralPageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <EditPeripheralClientPage peripheralId={params.id} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: EditPeripheralPageProps) {
  return {
    title: `Modificar Periférico ${params.id} - Bitácora Master`,
  };
}
