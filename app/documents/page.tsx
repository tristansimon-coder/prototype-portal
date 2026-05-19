'use client';
import { useState } from 'react';
import { Input } from 'antd';
import { PageHeader } from '@/components/shared/PageHeader';
import { DocumentExplorer } from '@/components/widgets/DocumentExplorer';
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';
import { documents } from '@/data/mock';

const docCode = `interface Document {
  id: number; fund: string; name: string;
  type: string; size: string; addedAt: string; isNew: boolean;
}`;

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Mes documents" />

      <div style={{ marginBottom: 20 }}>
        <Input.Search
          placeholder="Rechercher un document"
          allowClear
          style={{ width: 400 }}
          onSearch={setSearch}
          onChange={e => !e.target.value && setSearch('')}
        />
      </div>

      <WidgetWrapper title="DocumentExplorer" codeSource={docCode}>
        <div style={{ paddingTop: 40 }}>
          <DocumentExplorer documents={filtered} />
        </div>
      </WidgetWrapper>
    </div>
  );
}
