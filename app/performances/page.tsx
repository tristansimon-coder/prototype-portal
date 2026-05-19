'use client';
import { Card, Typography } from 'antd';
import { PageHeader } from '@/components/shared/PageHeader';
import { PerformanceChart } from '@/components/widgets/PerformanceChart';
import { KpiCard } from '@/components/widgets/KpiCard';
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';
import { navPerformance, portfolioKpis } from '@/data/mock';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';

const chartCode = `import { LinePath } from '@visx/shape';
import { scaleLinear, scalePoint } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import { curveMonotoneX } from '@visx/curve';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';

export function PerformanceChart({ data, height = 280 }) {
  const { showTooltip, hideTooltip, tooltipData } = useTooltip();
  return (
    <ParentSize>
      {({ width }) => (
        <svg width={width} height={height}>
          <LinePath
            data={data}
            x={d => xScale(d.date)}
            y={d => yScale(d.nav)}
            stroke="#0D3D56"
            strokeWidth={2.5}
            curve={curveMonotoneX}
          />
          <AxisBottom scale={xScale} />
          <AxisLeft scale={yScale} />
        </svg>
      )}
    </ParentSize>
  );
}`;

export default function PerformancesPage() {
  const lastNav = navPerformance[navPerformance.length - 1]?.nav ?? 0;
  const firstNav = navPerformance[0]?.nav ?? 100;
  const gain = ((lastNav - firstNav) / firstNav) * 100;

  return (
    <div>
      <PageHeader title="Mes performances" subtitle="Suivi de la performance de votre portefeuille" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard
          label="NAV actuelle"
          value={lastNav}
          format="number"
          icon={<RiseOutlined />}
          trend={gain}
        />
        <KpiCard
          label="TRI net estimé"
          value={12.4}
          format="percentage"
          icon={<RiseOutlined />}
          trend={1.2}
        />
        <KpiCard
          label="DPI"
          value={0.0}
          format="number"
          icon={<FallOutlined />}
        />
      </div>

      <WidgetWrapper title="PerformanceChart" codeSource={chartCode}>
        <Card style={{ borderRadius: 12, paddingTop: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>Courbe NAV</Typography.Title>
            <Typography.Text style={{ color: 'var(--ih-text-secondary)', fontSize: 13 }}>
              Évolution mensuelle sur 24 mois
            </Typography.Text>
          </div>
          <PerformanceChart data={navPerformance} height={320} />
        </Card>
      </WidgetWrapper>
    </div>
  );
}
