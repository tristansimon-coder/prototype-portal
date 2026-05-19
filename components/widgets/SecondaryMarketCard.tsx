'use client';
import { Button } from 'antd';
import { PictureOutlined } from '@ant-design/icons';

interface SecondaryMarketCardProps {
  fund: string;
  part: string;
  shares: number;
  price: number;
  validUntil: string;
  image?: string | null;
  navPerShare?: number;
  navDate?: string;
  status?: 'available' | 'pending';
  pendingSince?: string;
}

function eur(v: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v);
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0', borderBottom: '1px solid var(--ih-border)' }}>
      <span style={{ color: 'var(--ih-text-secondary)', fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: highlight ? 700 : 600, fontSize: highlight ? 15 : 14, color: 'var(--ih-text-primary)' }}>{value}</span>
    </div>
  );
}

export function SecondaryMarketCard({ fund, part, shares, price, validUntil, image, navPerShare, navDate, status = 'available', pendingSince }: SecondaryMarketCardProps) {
  const totalValue = navPerShare ? navPerShare * shares : null;
  const totalToPay = price * shares;
  const isPending = status === 'pending';

  return (
    <div style={{
      background: isPending ? '#F3F4F6' : 'var(--ih-bg-card)',
      border: `1px solid ${isPending ? '#D1D5DB' : 'var(--ih-border)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      width: 360,
      display: 'flex',
      flexDirection: 'column',
      opacity: isPending ? 0.85 : 1,
      position: 'relative',
    }}>
      {/* Fund photo */}
      <div style={{ height: 140, background: '#E5E7EB', position: 'relative', flexShrink: 0 }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={fund} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isPending ? 'grayscale(60%)' : 'none' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #0D3D56, #1A5C7A)' }}>
            <PictureOutlined style={{ fontSize: 36, color: 'rgba(255,255,255,0.4)' }} />
          </div>
        )}
        {isPending && (
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(0,0,0,0.6)', color: 'white',
            fontSize: 12, fontWeight: 600, padding: '4px 10px',
            borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#faad14', display: 'inline-block' }} />
            Achat en cours{pendingSince ? ` · depuis le ${pendingSince}` : ''}
          </div>
        )}
      </div>

      {/* Header */}
      <div style={{ padding: '16px 20px 12px' }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--ih-text-primary)' }}>{fund}</div>
        <div style={{ fontSize: 12, color: 'var(--ih-text-secondary)', fontWeight: 500, marginTop: 2 }}>{part}</div>
      </div>

      {/* Info rows */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
        <Row label="Nombre de parts" value={shares.toLocaleString('fr-FR')} />
        {navPerShare && <Row label={`Valeur par part${navDate ? ` (${navDate})` : ''}`} value={eur(navPerShare)} highlight />}
        <Row label="Prix par part (cession)" value={eur(price)} />
        {totalValue   && <Row label="Valeur totale à date" value={eur(totalValue)} highlight />}
        <Row label="Montant total à payer" value={eur(totalToPay)} />
        <Row label="Offre valable jusqu'au" value={validUntil} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 20px' }}>
        <Button style={{ flex: 1 }} disabled={isPending}>Détails</Button>
        <Button type="primary" style={{ flex: 1 }} disabled={isPending}>
          {isPending ? 'Achat en cours' : 'Acheter'}
        </Button>
      </div>
    </div>
  );
}
