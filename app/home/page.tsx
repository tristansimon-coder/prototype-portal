'use client';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/widgets/KpiCard';
import { FundCard } from '@/components/widgets/FundCard';
import { PerformanceChart } from '@/components/widgets/PerformanceChart';
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';
import { portfolioKpis, funds, documents, navPerformance } from '@/data/mock';
import { Typography, List, Tag } from 'antd';
import { FileOutlined } from '@ant-design/icons';

const kpiCardCode = `interface KpiCardProps {
  label: string;
  value: number | string;
  format?: 'currency' | 'percentage' | 'number';
  trend?: number;
  icon?: ReactNode;
  loading?: boolean;
  tooltip?: string;
}`;

const fundCardCode = `interface FundCardProps {
  id: number;
  name: string;
  closeDate?: string;
  image: string | null;
  description: string[];
  docs?: string[];
}`;

const performanceCode = `interface PerformanceChartProps {
  data: { date: string; nav: number }[];
  height?: number;
}`;

export default function HomePage() {
  const featuredFunds = funds.slice(0, 3);
  const recentDocs = documents.slice(0, 3);

  return (
    <div>
      <PageHeader title="Home" />

      {/* KPI Cards */}
      <WidgetWrapper title="KPI Cards" codeSource={kpiCardCode}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32, paddingTop: 40 }}>
          <KpiCard label="Engagement total" value={portfolioKpis.totalEngagement} format="currency" tooltip="Montant total engagé" />
          <KpiCard label="Total appelé" value={portfolioKpis.totalCalled} format="currency" tooltip="Montant total appelé" />
          <KpiCard label="Total distribué" value={portfolioKpis.totalDistributed} format="currency" tooltip="Montant total distribué" />
          <KpiCard label="Valorisation" value={portfolioKpis.valuation} format="currency" tooltip="Valorisation du portefeuille" />
        </div>
      </WidgetWrapper>

      {/* Featured Funds */}
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={4} style={{ marginBottom: 16 }}>Fonds en vedette</Typography.Title>
        <WidgetWrapper title="FundCard" codeSource={fundCardCode}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, paddingTop: 40 }}>
            {featuredFunds.map(fund => (
              <FundCard key={fund.id} {...fund} />
            ))}
          </div>
        </WidgetWrapper>
      </div>

      {/* Performance Chart */}
      <div style={{ marginBottom: 32, background: 'var(--ih-bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--ih-border)' }}>
        <Typography.Title level={4} style={{ marginBottom: 4 }}>Performance du portefeuille</Typography.Title>
        <Typography.Text style={{ color: 'var(--ih-text-secondary)', fontSize: 13 }}>Évolution de la NAV sur 24 mois</Typography.Text>
        <WidgetWrapper title="PerformanceChart" codeSource={performanceCode}>
          <div style={{ marginTop: 40 }}>
            <PerformanceChart data={navPerformance} height={260} />
          </div>
        </WidgetWrapper>
      </div>

      {/* Recent Documents */}
      <div style={{ background: 'var(--ih-bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--ih-border)' }}>
        <Typography.Title level={4} style={{ marginBottom: 16 }}>Derniers documents</Typography.Title>
        <List
          dataSource={recentDocs}
          renderItem={doc => (
            <List.Item
              style={{ padding: '10px 0' }}
              extra={
                doc.isNew && <Tag color="green" style={{ borderRadius: 12 }}>New</Tag>
              }
            >
              <List.Item.Meta
                avatar={<FileOutlined style={{ fontSize: 20, color: 'var(--ih-primary)', marginTop: 2 }} />}
                title={<span style={{ fontWeight: 500 }}>{doc.name}</span>}
                description={<span style={{ fontSize: 12, color: 'var(--ih-text-secondary)' }}>{doc.type} · {doc.size} · {doc.addedAt}</span>}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
