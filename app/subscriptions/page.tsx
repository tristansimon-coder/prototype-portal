'use client';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/widgets/KpiCard';
import { SubscriptionTable } from '@/components/widgets/SubscriptionTable';
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';
import { subscriptions, portfolioKpis } from '@/data/mock';

const tableCode = `interface Subscription {
  id: number;
  fund: string;
  part: string | null;
  date: string;
  amount: number;
  called: number;
  distributed: number;
  valuation: number | null;
  status: string;
}`;

export default function SubscriptionsPage() {
  return (
    <div>
      <PageHeader title="Mes souscriptions" />

      <WidgetWrapper title="KPI Header" codeSource={tableCode}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32, paddingTop: 40 }}>
          <KpiCard label="Engagement total" value={portfolioKpis.totalEngagement} format="currency" tooltip="Montant total engagé" />
          <KpiCard label="Total appelé" value={portfolioKpis.totalCalled} format="currency" tooltip="Montant total appelé" />
          <KpiCard label="Total distribué" value={portfolioKpis.totalDistributed} format="currency" tooltip="Montant total distribué" />
          <KpiCard label="Valorisation" value={portfolioKpis.valuation} format="currency" tooltip="Valorisation du portefeuille" />
        </div>
      </WidgetWrapper>

      <WidgetWrapper title="SubscriptionTable" codeSource={tableCode}>
        <div style={{ paddingTop: 40 }}>
          <SubscriptionTable data={subscriptions} />
        </div>
      </WidgetWrapper>
    </div>
  );
}
