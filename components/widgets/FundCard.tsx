'use client';
import { Button, Card, Tag } from 'antd';
import { CalendarOutlined, DownloadOutlined, PictureOutlined } from '@ant-design/icons';

interface FundCardProps {
  id: number;
  name: string;
  closeDate?: string;
  image: string | null;
  description: string[];
  docs?: string[];
}

export function FundCard({ name, closeDate, image, description, docs }: FundCardProps) {
  return (
    <Card
      style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--ih-border)', height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 160, background: '#E5E7EB', overflow: 'hidden', flexShrink: 0 }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #0D3D56 0%, #1A5C7A 100%)' }}>
            <PictureOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.4)' }} />
          </div>
        )}
        {closeDate && (
          <Tag
            icon={<CalendarOutlined />}
            style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.95)', border: 'none', fontWeight: 500, fontSize: 12 }}
          >
            Jusqu&apos;au {closeDate}
          </Tag>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: 'var(--ih-text-primary)' }}>{name}</h3>
        {description.length > 0 && (
          <ul style={{ margin: '0 0 12px', paddingLeft: 18, color: 'var(--ih-text-secondary)', fontSize: 13.5, lineHeight: 1.6 }}>
            {description.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        )}
        {docs && docs.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            {docs.map((doc) => (
              <Button key={doc} size="small" icon={<DownloadOutlined />} style={{ borderRadius: 6, fontSize: 11.5 }}>
                {doc}
              </Button>
            ))}
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 4 }}>
          <Button
            type="primary"
            style={{ background: 'var(--ih-primary)', border: 'none', fontWeight: 600, fontSize: 13, borderRadius: 6 }}
          >
            Voir plus &gt;
          </Button>
        </div>
      </div>
    </Card>
  );
}
