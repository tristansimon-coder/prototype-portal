'use client';
import { Button } from 'antd';

interface SecondaryMarketCardProps {
  fund: string;
  part: string;
  shares: number;
  price: number;
  validUntil: string;
}

export function SecondaryMarketCard({ fund, part, shares, price, validUntil }: SecondaryMarketCardProps) {
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  }).format(price);

  return (
    <div style={{
      background: 'var(--ih-bg-card)',
      border: '1px solid var(--ih-border)',
      borderRadius: 12,
      padding: '20px 24px',
      width: 340,
    }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--ih-text-primary)' }}>{fund}</div>
        <div style={{ fontSize: 13, color: 'var(--ih-text-secondary)', fontWeight: 500, marginTop: 2 }}>{part}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: 'var(--ih-text-secondary)' }}>Nombre de parts :</span>
          <span style={{ fontWeight: 700 }}>{shares.toLocaleString('fr-FR')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <span style={{ color: 'var(--ih-text-secondary)' }}>Prix de cession :</span>
          <span style={{ fontWeight: 700 }}>{formattedPrice}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--ih-text-secondary)' }}>Offre valable jusqu&apos;au</span>
          <span style={{ fontWeight: 600 }}>{validUntil}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Button style={{ width: 120, borderRadius: 6 }}>Détails</Button>
        <Button type="primary" style={{ width: 120, borderRadius: 6, background: '#1677ff', borderColor: '#1677ff' }}>Acheter</Button>
      </div>
    </div>
  );
}
