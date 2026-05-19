'use client';
import { useState, useMemo } from 'react';
import { Table, Select, Space, Button, Tooltip, Typography, Tag } from 'antd';
import { UserOutlined, EyeOutlined, EditOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
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
}

interface SubscriptionTableProps {
  data: Subscription[];
}

function formatEur(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}

export function SubscriptionTable({ data }: SubscriptionTableProps) {
  const [fundFilter, setFundFilter] = useState<string | undefined>(undefined);
  const [partFilter, setPartFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

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
      width: 100,
      render: (_, record) => {
        if (record.status === 'valid') {
          return (
            <Tooltip title="Plus d'actions">
              <Button type="text" icon={<EllipsisOutlined />} size="small" />
            </Tooltip>
          );
        }
        return (
          <Space size={4}>
            <Tooltip title="Voir">
              <Button type="text" icon={<EyeOutlined />} size="small" />
            </Tooltip>
            <Tooltip title="Modifier">
              <Button type="text" icon={<EditOutlined />} size="small" />
            </Tooltip>
            <Tooltip title="Supprimer">
              <Button type="text" icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Space>
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

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `${total} souscription${total > 1 ? 's' : ''}` }}
        size="middle"
        style={{ borderRadius: 12, overflow: 'hidden' }}
        summary={() => (
          <Table.Summary.Row style={{ background: 'var(--ih-bg)', fontWeight: 600 }}>
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
    </div>
  );
}
