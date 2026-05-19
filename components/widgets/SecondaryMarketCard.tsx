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
      overflow: 'hidden',
      width: 340,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Content */}
      <div style={{ padding: '20px 20px 16px', flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--ih-text-primary)', marginBottom: 2 }}>{fund}</div>
        <div style={{ fontSize: 13, color: 'var(--ih-text-secondary)', fontWeight: 500, marginBottom: 16 }}>{part}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--ih-text-secondary)' }}>Nombre de parts :</span>
            <span style={{ fontWeight: 600 }}>{shares.toLocaleString('fr-FR')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--ih-text-secondary)' }}>Prix de cession :</span>
            <span style={{ fontWeight: 600 }}>{formattedPrice}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--ih-text-secondary)' }}>Offre valable jusqu&apos;au</span>
            <span style={{ fontWeight: 600 }}>{validUntil}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 16px' }}>
        <Button style={{ flex: 1 }}>Détails</Button>
        <Button type="primary" style={{ flex: 1 }}>Acheter</Button>
      </div>
    </div>
  );
}
