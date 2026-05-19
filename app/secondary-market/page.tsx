'use client';
import { Alert, Tabs } from 'antd';
import { PageHeader } from '@/components/shared/PageHeader';
import { SecondaryMarketCard } from '@/components/widgets/SecondaryMarketCard';
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';
import { secondaryMarket } from '@/data/mock';

const cardCode = `interface SecondaryMarketCardProps {
  fund: string;
  part: string;
  shares: number;
  price: number;
  validUntil: string;
}

export function SecondaryMarketCard({ fund, part, shares, price, validUntil }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{fund}</div>
      <div style={{ fontSize: 13, color: '#6B7280' }}>{part}</div>
      <div>Nombre de parts : {shares}</div>
      <div>Prix de cession : {price} €</div>
      <div>Offre valable jusqu'au {validUntil}</div>
      <Button>Détails</Button>
      <Button type="primary">Acheter</Button>
    </div>
  );
}`;

export default function SecondaryMarketPage() {
  const funds = Array.from(new Set(secondaryMarket.map(s => s.fund)));

  return (
    <div>
      <PageHeader title="Marché secondaire" subtitle="Achetez et vendez des parts de fonds" />

      <Alert
        type="info"
        message="Vous pouvez vendre vos parts depuis la page souscriptions"
        showIcon
        style={{ marginBottom: 24, borderRadius: 8 }}
      />

      <WidgetWrapper title="SecondaryMarketCard" codeSource={cardCode}>
        <div style={{ paddingTop: 40 }}>
          <Tabs
            items={funds.map(fund => ({
              key: fund,
              label: fund,
              children: (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, paddingTop: 16 }}>
                  {secondaryMarket.filter(s => s.fund === fund).map(offer => (
                    <SecondaryMarketCard key={offer.id} {...offer} />
                  ))}
                </div>
              ),
            }))}
          />
        </div>
      </WidgetWrapper>
    </div>
  );
}
