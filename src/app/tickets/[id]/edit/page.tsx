
import AppHeader from '@/components/layout/AppHeader';
import PageWrapper from '@/components/layout/PageWrapper';
import EditTicketClientPage from '@/components/tickets/EditTicketClientPage';

interface EditTicketPageProps {
  params: {
    id: string; // Ticket ID
  };
}

export default function EditTicketPage({ params }: EditTicketPageProps) {
  return (
    <>
      <AppHeader />
      <PageWrapper>
        <EditTicketClientPage ticketId={params.id} />
      </PageWrapper>
    </>
  );
}

export async function generateMetadata({ params }: EditTicketPageProps) {
  return {
    title: `Modificar Ticket ${params.id} - Bitácora Master`,
  };
}
