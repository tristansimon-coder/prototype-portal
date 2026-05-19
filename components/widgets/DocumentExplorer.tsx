'use client';
import { useState, useMemo } from 'react';
import { Tree, Table, Tag, Space, Typography, Tooltip } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { DocumentIcon, FolderIcon } from '@/components/shared/Icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';

interface Document {
  id: number;
  fund: string;
  name: string;
  type: string;
  size: string;
  addedAt: string;
  isNew: boolean;
}

interface DocumentExplorerProps {
  documents: Document[];
}

export function DocumentExplorer({ documents }: DocumentExplorerProps) {
  const funds = useMemo(() => Array.from(new Set(documents.map(d => d.fund))), [documents]);
  const [selectedFund, setSelectedFund] = useState<string>(funds[0] ?? '');

  const treeData: DataNode[] = useMemo(() => funds.map(fund => {
    const count = documents.filter(d => d.fund === fund).length;
    return {
      key: fund,
      title: `${fund} (${count})`,
      icon: <FolderIcon size={16} />,
      isLeaf: true,
    };
  }), [funds, documents]);

  const filtered = useMemo(() =>
    documents.filter(d => d.fund === selectedFund),
    [documents, selectedFund]
  );

  const columns: ColumnsType<Document> = [
    {
      title: 'Nom',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, doc) => (
        <Space>
          <DocumentIcon size={22} />
          <div>
            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              {doc.name}
              {doc.isNew && (
                <Tag
                  style={{
                    borderRadius: 12, fontSize: 11, padding: '0 6px',
                    border: '1px solid #d9d9d9', color: 'var(--ih-text-primary)',
                    background: 'white',
                  }}
                >
                  New
                </Tag>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ih-text-secondary)' }}>{doc.type}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Ajouté le',
      dataIndex: 'addedAt',
      sorter: (a, b) => a.addedAt.localeCompare(b.addedAt),
    },
    {
      title: 'Taille',
      dataIndex: 'size',
    },
    {
      key: 'actions',
      width: 80,
      render: () => (
        <Space size={12}>
          <Tooltip title="Aperçu"><EyeOutlined style={{ color: 'var(--ih-text-secondary)', cursor: 'pointer', fontSize: 16 }} /></Tooltip>
          <Tooltip title="Télécharger"><DownloadOutlined style={{ color: 'var(--ih-text-secondary)', cursor: 'pointer', fontSize: 16 }} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Tree panel */}
      <div style={{
        width: 280, flexShrink: 0,
        background: 'var(--ih-bg-card)', borderRadius: 12,
        border: '1px solid var(--ih-border)', padding: 16,
      }}>
        <Typography.Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--ih-text-secondary)', display: 'block', marginBottom: 12 }}>
          Documents ({documents.length})
        </Typography.Text>
        <Tree
          showIcon
          defaultExpandAll
          selectedKeys={[selectedFund]}
          treeData={treeData}
          onSelect={(keys) => {
            if (keys[0]) setSelectedFund(String(keys[0]));
          }}
          style={{ background: 'transparent' }}
        />
      </div>

      {/* File list */}
      <div style={{ flex: 1, background: 'var(--ih-bg-card)', borderRadius: 12, border: '1px solid var(--ih-border)', padding: 16 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={false}
          showHeader={!!filtered.length}
          locale={{ emptyText: 'Aucun document' }}
          rowSelection={{ type: 'checkbox' }}
        />
      </div>
    </div>
  );
}
