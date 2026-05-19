'use client';
import { Suspense } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FundCard } from '@/components/widgets/FundCard';
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';
import { funds } from '@/data/mock';
import { FUND_CARD_CODE } from '@/lib/code-sources';

export default function FundsPage() {
  return (
    <div>
      <PageHeader title="Nos fonds" subtitle="Découvrez l'ensemble de nos fonds d'investissement" />
      <WidgetWrapper title="FundCard" codeSource={FUND_CARD_CODE}>
        <Suspense fallback={null}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, paddingTop: 40 }}>
            {funds.map(fund => (
              <FundCard key={fund.id} {...fund} />
            ))}
          </div>
        </Suspense>
      </WidgetWrapper>
    </div>
  );
}
