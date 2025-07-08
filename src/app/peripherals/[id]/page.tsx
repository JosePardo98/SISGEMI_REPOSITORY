import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import PeripheralDetailClientPage from '@/components/peripherals/PeripheralDetailClientPage';

interface PeripheralDetailPageProps {
  params: {
    id: string;
  };
}

export default function PeripheralDetailPage({ params }: PeripheralDetailPageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <PeripheralDetailClientPage peripheralId={params.id} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: PeripheralDetailPageProps) {
  return {
    title: `Detalles del Periférico ${params.id} - SISGEMI`,
  };
}
