'use client';
import { useState } from 'react';
import { Button, Modal, Input } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { kycValidations, subscriptions } from '@/data/mock';

type FieldStatus = 'pending' | 'approved' | 'rejected';

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export default function ValidationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const persona = searchParams.get('persona') ?? 'lp';

  const id = Number(params.id);
  const validation = kycValidations[id];
  const subscription = subscriptions.find(s => s.id === id);

  const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>({});
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenMessage, setReopenMessage] = useState('');

  if (!validation || !subscription) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--ih-text-secondary)', marginBottom: 16 }}>Validation non trouvée.</p>
        <Button onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  function getFieldKey(sectionId: string, index: number) {
    return `${sectionId}-${index}`;
  }

  function setFieldStatus(sectionId: string, index: number, next: FieldStatus) {
    const key = getFieldKey(sectionId, index);
    setFieldStatuses(prev => ({ ...prev, [key]: next }));
  }

  function validateSection(sectionId: string, fieldCount: number) {
    const updates: Record<string, FieldStatus> = {};
    for (let i = 0; i < fieldCount; i++) {
      updates[getFieldKey(sectionId, i)] = 'approved';
    }
    setFieldStatuses(prev => ({ ...prev, ...updates }));
  }

  function handleReopen() {
    setReopenOpen(false);
    setReopenMessage('');
    router.push(`/subscriptions?persona=${persona}`);
  }

  function handleValidate() {
    router.push(`/subscriptions?persona=${persona}`);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ih-text-primary)', marginBottom: 8 }}>
          Validation {id} / {validation.investorName}
        </h1>
        <div style={{ fontSize: 14, color: 'var(--ih-text-secondary)' }}>
          {validation.part} - {formatEur(validation.partValue)} - Frais d&apos;entrée : {formatEur(validation.entryFees)}
        </div>
      </div>

      {/* KYC Sections */}
      {validation.sections.map((section) => (
        <div
          key={section.id}
          style={{ marginBottom: 32, border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}
        >
          {/* Section header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: '#fff',
            borderBottom: '1px solid #e0e0e0',
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--ih-text-primary)',
              textDecoration: 'underline',
            }}>
              {section.title}
            </span>
            <Button
              onClick={() => validateSection(section.id, section.fields.length)}
              icon={<CheckCircleFilled style={{ color: '#1677ff' }} />}
              style={{ borderColor: '#1677ff', color: '#1677ff' }}
            >
              Valider toute la section
            </Button>
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 3fr 120px',
            padding: '8px 20px',
            background: '#f5f6fa',
            borderBottom: '1px solid #e0e0e0',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ih-text-secondary)' }}>Question</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ih-text-secondary)' }}>Réponse</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ih-text-secondary)', textAlign: 'right' }}>Vérification</span>
          </div>

          {/* Rows */}
          {section.fields.map((field, index) => {
            const key = getFieldKey(section.id, index);
            const status = fieldStatuses[key] ?? 'pending';
            return (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 3fr 120px',
                  padding: '12px 20px',
                  background: index % 2 === 0 ? '#fff' : '#f9f9fb',
                  borderBottom: index < section.fields.length - 1 ? '1px solid #f0f0f0' : 'none',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13.5, color: 'var(--ih-text-secondary)' }}>{field.question}</span>
                <span style={{ fontSize: 13.5, color: 'var(--ih-text-primary)' }}>{field.answer}</span>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <CheckCircleFilled
                    style={{
                      fontSize: 20,
                      color: status === 'approved' ? '#52c41a' : '#d9d9d9',
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}
                    onClick={() => setFieldStatus(section.id, index, status === 'approved' ? 'pending' : 'approved')}
                  />
                  <CloseCircleFilled
                    style={{
                      fontSize: 20,
                      color: status === 'rejected' ? '#ff4d4f' : '#d9d9d9',
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}
                    onClick={() => setFieldStatus(section.id, index, status === 'rejected' ? 'pending' : 'rejected')}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Footer actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <Button
          onClick={() => setReopenOpen(true)}
          style={{
            background: '#e05c6a',
            borderColor: '#e05c6a',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          Rouvrir le KYC
        </Button>
        <Button
          onClick={handleValidate}
          style={{
            background: '#6aad3a',
            borderColor: '#6aad3a',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          Valider le KYC
        </Button>
      </div>

      {/* Reopen modal */}
      <Modal
        open={reopenOpen}
        onCancel={() => setReopenOpen(false)}
        footer={null}
        closable={false}
        width={580}
      >
        <div>
          <p style={{ fontSize: 13, color: 'var(--ih-text-secondary)', marginBottom: 20, lineHeight: 1.7 }}>
            Les questions et documents non valides seront repris dans le courriel envoyé à l&apos;investisseur.
            Vous pouvez ajouter un message général et un message spécifique par question
            pour favoriser la correction du dossier.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>Message :</div>
            <Input.TextArea
              value={reopenMessage}
              onChange={e => setReopenMessage(e.target.value)}
              rows={4}
              style={{ width: '100%' }}
            />
          </div>
          <Button
            type="primary"
            onClick={handleReopen}
            style={{
              width: '100%',
              background: '#3dbfa5',
              borderColor: '#3dbfa5',
              fontWeight: 600,
              height: 44,
            }}
          >
            Rouvrir le KYC
          </Button>
        </div>
      </Modal>
    </div>
  );
}
