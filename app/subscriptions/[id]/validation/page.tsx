import { Suspense } from 'react';
import { SubscriptionValidationPage } from '@/components/widgets/SubscriptionValidationPage';

export default function ValidationPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <SubscriptionValidationPage id={params.id} />
    </Suspense>
  );
}
