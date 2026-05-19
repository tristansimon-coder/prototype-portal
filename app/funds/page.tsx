'use client';
import { PageHeader } from '@/components/shared/PageHeader';
import { FundCard } from '@/components/widgets/FundCard';
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';
import { funds } from '@/data/mock';

const fundCardCode = `interface FundCardProps {
  id: number;
  name: string;
  closeDate?: string;
  image: string | null;
  description: string[];
  docs?: string[];
}

export function FundCard({ name, closeDate, image, description, docs }) {
  return (
    <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ height: 160 }}>
        {image ? <img src={image} alt={name} /> : <div>Placeholder</div>}
        {closeDate && <Tag>Jusqu'au {closeDate}</Tag>}
      </div>
      <h3>{name}</h3>
      <ul>{description.map(d => <li key={d}>{d}</li>)}</ul>
      <Button type="primary" block>Voir plus ></Button>
    </Card>
  );
}`;

export default function FundsPage() {
  return (
    <div>
      <PageHeader title="Nos fonds" subtitle="Découvrez l'ensemble de nos fonds d'investissement" />
      <WidgetWrapper title="FundCard" codeSource={fundCardCode}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, paddingTop: 40 }}>
          {funds.map(fund => (
            <FundCard key={fund.id} {...fund} />
          ))}
        </div>
      </WidgetWrapper>
    </div>
  );
}
