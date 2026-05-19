'use client';
import { useState, useMemo } from 'react';
import { Table, Select, Button, Typography, ConfigProvider, Modal, InputNumber, DatePicker, Dropdown, Upload } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, ShoppingOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface Subscription {
  id: number;
  fund: string;
  part: string | null;
  date: string;
  amount: number;
  called: number;
  distributed: number;
  valuation: number | null;
  status: string;
  navPerShare?: number;
  navDate?: string;
  shares?: number;
}

interface SubscriptionTableProps {
  data: Subscription[];
}

function formatEur(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}

function SellModal({ subscription, open, onClose }: { subscription: Subscription | null; open: boolean; onClose: () => void }) {
  const [salePrice, setSalePrice] = useState<number | null>(null);
  const [partsCount, setPartsCount] = useState<number | null>(null);
  const [ribFile, setRibFile] = useState<File | null>(null);

  if (!subscription) return null;

  const nav = subscription.navPerShare ?? null;
  const totalShares = subscription.shares ?? null;
  const minPrice = nav ? Math.round(nav * 0.90 * 100) / 100 : null;
  const maxPrice = nav ? Math.round(nav * 1.15 * 100) / 100 : null;
  const totalSale = salePrice && partsCount ? salePrice * partsCount : null;

  function handleSubmit() {
    onClose();
    setSalePrice(null);
    setPartsCount(null);
    setRibFile(null);
  }

  function handleCancel() {
    onClose();
    setSalePrice(null);
    setPartsCount(null);
    setRibFile(null);
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      title={
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ih-text-primary)' }}>
            Vente de parts — {subscription.fund}{subscription.part ? ` (${subscription.part})` : ''}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ih-text-secondary)', fontWeight: 400, marginTop: 2 }}>
            Montant total souscrit : {formatEur(subscription.amount)}
          </div>
        </div>
      }
      width={520}
      styles={{ header: { paddingBottom: 12, borderBottom: '1px solid var(--ih-border)' } }}
    >
      <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* NAV info */}
        {nav && (
          <div style={{ background: 'var(--ih-bg)', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ fontSize: 12, color: 'var(--ih-text-secondary)', marginBottom: 4 }}>
              Valeur actuelle d&apos;une part
              {subscription.navDate && (
                <span style={{ marginLeft: 6, fontStyle: 'italic' }}>
                  — Basée sur la dernière valorisation en date du {subscription.navDate}
                </span>
              )}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ih-text-primary)' }}>
              {formatEur(nav)} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ih-text-secondary)' }}>/ part</span>
            </div>
          </div>
        )}

        {/* Price per share */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ih-text-primary)', display: 'block', marginBottom: 6 }}>
            Prix de vente souhaité (par part)
          </label>
          {minPrice && maxPrice && (
            <div style={{ fontSize: 12, color: 'var(--ih-text-secondary)', marginBottom: 8 }}>
              Fourchette autorisée : entre {formatEur(minPrice)} et {formatEur(maxPrice)}
              <span style={{ marginLeft: 4 }}>(-10% / +15% de la valeur de la part)</span>
            </div>
          )}
          <InputNumber
            style={{ width: '100%' }}
            min={minPrice ?? 0}
            max={maxPrice ?? undefined}
            value={salePrice}
            onChange={setSalePrice}
            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            addonAfter="€"
            placeholder={nav ? `ex. ${nav}` : 'Prix par part'}
          />
        </div>

        {/* Number of shares */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ih-text-primary)', display: 'block', marginBottom: 6 }}>
            Nombre de parts à vendre
          </label>
          {totalShares && (
            <div style={{ fontSize: 12, color: 'var(--ih-text-secondary)', marginBottom: 8 }}>
              Maximum disponible : {totalShares.toLocaleString('fr-FR')} parts
            </div>
          )}
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            max={totalShares ?? undefined}
            value={partsCount}
            onChange={setPartsCount}
            placeholder="Nombre de parts"
          />
        </div>

        {/* Validity date */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ih-text-primary)', display: 'block', marginBottom: 6 }}>
            Date de fin de validité de l&apos;offre
          </label>
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="JJ/MM/AAAA" />
        </div>

        {/* RIB */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ih-text-primary)', display: 'block', marginBottom: 6 }}>
            RIB du vendeur
          </label>
          <div style={{ fontSize: 12, color: 'var(--ih-text-secondary)', marginBottom: 8 }}>
            Document bancaire pour la transmission des fonds suite à la cession (PDF, JPG…)
          </div>
          <Upload
            maxCount={1}
            beforeUpload={file => { setRibFile(file); return false; }}
            onRemove={() => setRibFile(null)}
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
              {ribFile ? ribFile.name : 'Déposer votre RIB'}
            </Button>
          </Upload>
        </div>

        {/* Calculated total */}
        {totalSale !== null && (
          <div style={{ background: '#EEF9E6', borderRadius: 8, padding: '12px 16px', border: '1px solid #c6efb1' }}>
            <div style={{ fontSize: 12, color: '#4a7c2e', marginBottom: 4 }}>Montant total estimé de la vente</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ih-text-primary)' }}>{formatEur(totalSale)}</div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid var(--ih-border)' }}>
          <Button onClick={handleCancel}>Annuler</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={!salePrice || !partsCount || !ribFile}
          >
            Mettre en vente
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function SubscriptionTable({ data }: SubscriptionTableProps) {
  const [fundFilter, setFundFilter] = useState<string | undefined>(undefined);
  const [partFilter, setPartFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sellTarget, setSellTarget] = useState<Subscription | null>(null);

  const funds = useMemo(() => Array.from(new Set(data.map(d => d.fund))), [data]);
  const parts = useMemo(() => Array.from(new Set(data.map(d => d.part).filter(Boolean) as string[])), [data]);

  const filtered = useMemo(() => data.filter(d => {
    if (fundFilter && d.fund !== fundFilter) return false;
    if (partFilter && d.part !== partFilter) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  }), [data, fundFilter, partFilter, statusFilter]);

  const totals = useMemo(() => ({
    amount: filtered.reduce((s, d) => s + d.amount, 0),
    called: filtered.reduce((s, d) => s + d.called, 0),
    distributed: filtered.reduce((s, d) => s + d.distributed, 0),
  }), [filtered]);

  const columns: ColumnsType<Subscription> = [
    {
      title: 'Type',
      key: 'type',
      width: 60,
      render: () => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ih-bg)', border: '1px solid var(--ih-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserOutlined style={{ fontSize: 14, color: 'var(--ih-primary)' }} />
          </div>
        </div>
      ),
    },
    {
      title: 'Fonds',
      key: 'fund',
      sorter: (a, b) => a.fund.localeCompare(b.fund),
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ih-text-primary)' }}>{record.fund}</div>
          {record.part && <div style={{ fontSize: 12, color: 'var(--ih-text-secondary)' }}>{record.part}</div>}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => a.date.localeCompare(b.date),
      render: v => <span style={{ fontSize: 13, color: 'var(--ih-text-secondary)', whiteSpace: 'nowrap' }}>{v}</span>,
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: v => <span style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap' }}>{formatEur(v)}</span>,
    },
    {
      title: 'Appelé',
      dataIndex: 'called',
      key: 'called',
      align: 'right',
      render: v => <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{formatEur(v)}</span>,
    },
    {
      title: 'Distribué',
      dataIndex: 'distributed',
      key: 'distributed',
      align: 'right',
      render: v => <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{formatEur(v)}</span>,
    },
    {
      title: 'Valorisation',
      dataIndex: 'valuation',
      key: 'valuation',
      align: 'right',
      render: v => <span style={{ fontSize: 13, color: v ? 'inherit' : 'var(--ih-text-secondary)', whiteSpace: 'nowrap' }}>{formatEur(v)}</span>,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: v => <StatusBadge status={v} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 60,
      align: 'right' as const,
      render: (_, record) => {
        const validItems: MenuProps['items'] = [
          { key: 'sell', label: 'Vendre', icon: <ShoppingOutlined />, onClick: () => setSellTarget(record) },
          { key: 'view', label: 'Voir', icon: <EyeOutlined /> },
        ];
        const otherItems: MenuProps['items'] = [
          { key: 'view', label: 'Voir', icon: <EyeOutlined /> },
          { key: 'edit', label: 'Modifier', icon: <EditOutlined /> },
          { key: 'delete', label: 'Supprimer', icon: <DeleteOutlined />, danger: true },
        ];
        return (
          <Dropdown menu={{ items: record.status === 'valid' ? validItems : otherItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          placeholder="Tous les fonds"
          allowClear
          style={{ minWidth: 180 }}
          value={fundFilter}
          onChange={setFundFilter}
          options={funds.map(f => ({ value: f, label: f }))}
        />
        <Select
          placeholder="Toutes les parts"
          allowClear
          style={{ minWidth: 160 }}
          value={partFilter}
          onChange={setPartFilter}
          options={parts.map(p => ({ value: p, label: p }))}
        />
        <Select
          placeholder="Tous les statuts"
          allowClear
          style={{ minWidth: 180 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'to_sign', label: 'À envoyer en signature' },
            { value: 'in_progress', label: 'En cours' },
            { value: 'valid', label: 'Valide' },
          ]}
        />
        <div style={{ marginLeft: 'auto' }}>
          <Typography.Text style={{ fontSize: 13, color: 'var(--ih-text-secondary)' }}>
            Souscriptions ({filtered.length}/{data.length})
          </Typography.Text>
        </div>
      </div>

      <ConfigProvider theme={{ token: { colorFillAlter: '#ffffff' } }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `${total} souscription${total > 1 ? 's' : ''}` }}
          size="middle"
          style={{ borderRadius: 12, overflow: 'hidden', background: '#fff' }}
          summary={() => (
            <Table.Summary.Row style={{ background: '#fff', fontWeight: 600 }}>
              <Table.Summary.Cell index={0} colSpan={3}>
                <span style={{ fontSize: 13, color: 'var(--ih-text-secondary)' }}>Total</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                <span style={{ fontWeight: 700 }}>{formatEur(totals.amount)}</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                <span>{formatEur(totals.called)}</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                <span>{formatEur(totals.distributed)}</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} colSpan={3} />
            </Table.Summary.Row>
          )}
        />
      </ConfigProvider>

      <SellModal
        subscription={sellTarget}
        open={sellTarget !== null}
        onClose={() => setSellTarget(null)}
      />
    </div>
  );
}
