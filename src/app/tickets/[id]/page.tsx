
import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import TicketDetailClientPage from '@/components/tickets/TicketDetailClientPage';

interface TicketDetailPageProps {
  params: {
    id: string;
  };
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <TicketDetailClientPage ticketId={params.id} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: TicketDetailPageProps) {
  return {
    title: `Detalles del Ticket ${params.id} - Bitácora Master`,
  };
}
