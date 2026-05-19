'use client';
import { useState, useMemo } from 'react';
import { Button, Modal, Input, Tag } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, CheckOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { kycValidations, subscriptions } from '@/data/mock';

type FieldStatus = 'pending' | 'approved' | 'rejected';

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function SectionStatusBadge({ approved, total, rejected }: { approved: number; total: number; rejected: number }) {
  if (approved === total && total > 0) {
    return <Tag color="success" style={{ borderRadius: 20, fontWeight: 600, fontSize: 12 }}>Section validée</Tag>;
  }
  if (rejected > 0) {
    return <Tag color="error" style={{ borderRadius: 20, fontWeight: 600, fontSize: 12 }}>{rejected} refusée{rejected > 1 ? 's' : ''}</Tag>;
  }
  return <Tag color="warning" style={{ borderRadius: 20, fontWeight: 600, fontSize: 12 }}>En cours</Tag>;
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

  const sectionStats = useMemo(() => {
    if (!validation) return {};
    const stats: Record<string, { total: number; answered: number; approved: number; rejected: number }> = {};
    for (const section of validation.sections) {
      let approved = 0;
      let rejected = 0;
      for (let i = 0; i < section.fields.length; i++) {
        const key = `${section.id}-${i}`;
        const st = fieldStatuses[key] ?? 'pending';
        if (st === 'approved') approved++;
        if (st === 'rejected') rejected++;
      }
      stats[section.id] = {
        total: section.fields.length,
        answered: section.fields.length,
        approved,
        rejected,
      };
    }
    return stats;
  }, [validation, fieldStatuses]);

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
    setFieldStatuses(prev => ({ ...prev, [getFieldKey(sectionId, index)]: next }));
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
          {validation.part} - {formatEur(validation.partValue)} - Frais d&apos;entrée : {formatEur(validation.entryFees)}
        </div>
      </div>

      {/* KYC Sections */}
      {validation.sections.map((section) => {
        const stats = sectionStats[section.id] ?? { total: 0, answered: 0, approved: 0, rejected: 0 };
        const allApproved = stats.approved === stats.total && stats.total > 0;
        const sectionIconBg = allApproved
          ? 'linear-gradient(135deg, #d1fae5, #99f6e4)'
          : 'linear-gradient(135deg, #dbeafe, #e0e7ff)';
        const sectionIconColor = allApproved ? '#059669' : '#4f46e5';

        return (
          <div
            key={section.id}
            style={{
              marginBottom: 24,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            {/* Section header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: sectionIconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CheckOutlined style={{ fontSize: 20, color: sectionIconColor }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ih-text-primary)', marginBottom: 4 }}>
                    {section.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ih-text-secondary)' }}>
                    <span><strong style={{ color: 'var(--ih-text-primary)' }}>{stats.answered}</strong>/{stats.total} réponses</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db', display: 'inline-block' }} />
                    <span style={{ color: '#059669' }}><strong>{stats.approved}</strong> validées</span>
                    {stats.rejected > 0 && (
                      <>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db', display: 'inline-block' }} />
                        <span style={{ color: '#dc2626' }}><strong>{stats.rejected}</strong> refusées</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <SectionStatusBadge approved={stats.approved} total={stats.total} rejected={stats.rejected} />
            </div>

            {/* Validate all bar — hidden once fully approved */}
            {!allApproved && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 20px',
                background: '#eff6ff',
                borderBottom: '1px solid #dbeafe',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1d4ed8' }}>
                  <CheckCircleFilled style={{ color: '#3b82f6' }} />
                  <span>Vérifier toutes les réponses de cette section</span>
                </div>
                <Button
                  size="small"
                  onClick={() => validateSection(section.id, section.fields.length)}
                  style={{ background: '#2563eb', borderColor: '#2563eb', color: '#fff', fontWeight: 600 }}
                >
                  Valider toute la section
                </Button>
              </div>
            )}

            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 3fr 140px',
              padding: '8px 20px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Réponse</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Vérification</span>
            </div>

            {/* Rows */}
            <div style={{ background: '#fff' }}>
              {section.fields.map((field, index) => {
                const key = getFieldKey(section.id, index);
                const status = fieldStatuses[key] ?? 'pending';
                const isRejected = status === 'rejected';
                return (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 3fr 140px',
                      padding: '12px 20px',
                      borderBottom: index < section.fields.length - 1 ? '1px solid #f3f4f6' : 'none',
                      alignItems: 'center',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >
                    <span style={{ fontSize: 13.5, color: isRejected ? '#dc2626' : 'var(--ih-text-secondary)' }}>{field.question}</span>
                    <span style={{ fontSize: 13.5, color: 'var(--ih-text-primary)', fontWeight: 500 }}>{field.answer}</span>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <CheckCircleFilled
                        style={{
                          fontSize: 20,
                          color: status === 'approved' ? '#10b981' : '#d1d5db',
                          cursor: 'pointer',
                          transition: 'color 0.15s',
                        }}
                        onClick={() => setFieldStatus(section.id, index, status === 'approved' ? 'pending' : 'approved')}
                      />
                      <CloseCircleFilled
                        style={{
                          fontSize: 20,
                          color: status === 'rejected' ? '#ef4444' : '#d1d5db',
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
          </div>
        );
      })}

      {/* Footer actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <Button
          onClick={() => setReopenOpen(true)}
          style={{ background: '#e05c6a', borderColor: '#e05c6a', color: '#fff', fontWeight: 600 }}
        >
          Rouvrir le KYC
        </Button>
        <Button
          onClick={handleValidate}
          style={{
            background: 'linear-gradient(62deg, #000 10%, #0F323D 89%)',
            borderColor: 'transparent',
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
            <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>Message :</div>
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
