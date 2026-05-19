'use client';
import { Alert, Tabs } from 'antd';
import { PageHeader } from '@/components/shared/PageHeader';
import { SecondaryMarketCard } from '@/components/widgets/SecondaryMarketCard';
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';
import { secondaryMarket } from '@/data/mock';
import { SECONDARY_MARKET_CARD_CODE } from '@/lib/code-sources';

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

      <WidgetWrapper title="SecondaryMarketCard" codeSource={SECONDARY_MARKET_CARD_CODE}>
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
