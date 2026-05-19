'use client';
import { useState, useMemo } from 'react';
import { Button, Modal, Input, Tag } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, CheckOutlined, ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { kycValidations, subscriptions } from '@/data/mock';

type FieldStatus = 'pending' | 'approved' | 'rejected';

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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
      stats[section.id] = { total: section.fields.length, answered: section.fields.length, approved, rejected };
    }
    return stats;
  }, [validation, fieldStatuses]);

  const totalApproved = useMemo(() => {
    if (!validation) return 0;
    return validation.sections.reduce((sum, s) => sum + (sectionStats[s.id]?.approved ?? 0), 0);
  }, [validation, sectionStats]);

  const totalFields = useMemo(() => {
    if (!validation) return 0;
    return validation.sections.reduce((sum, s) => sum + s.fields.length, 0);
  }, [validation]);

  if (!validation || !subscription) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--ih-text-secondary)', marginBottom: 16 }}>Validation non trouvée.</p>
        <Button onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  function getFieldKey(sectionId: string, index: number) { return `${sectionId}-${index}`; }

  function setFieldStatus(sectionId: string, index: number, next: FieldStatus) {
    setFieldStatuses(prev => ({ ...prev, [getFieldKey(sectionId, index)]: next }));
  }

  function validateSection(sectionId: string, fieldCount: number) {
    const updates: Record<string, FieldStatus> = {};
    for (let i = 0; i < fieldCount; i++) updates[getFieldKey(sectionId, i)] = 'approved';
    setFieldStatuses(prev => ({ ...prev, ...updates }));
  }

  function handleReopen() {
    setReopenOpen(false);
    setReopenMessage('');
    router.push(`/subscriptions?persona=${persona}`);
  }

  function handleValidate() { router.push(`/subscriptions?persona=${persona}`); }

  const progressPct = totalFields > 0 ? Math.round((totalApproved / totalFields) * 100) : 0;

  // Determine step state for each section
  function getStepState(idx: number): 'completed' | 'current' | 'upcoming' {
    const s = validation.sections[idx];
    const stats = sectionStats[s.id] ?? { total: 0, approved: 0, rejected: 0 };
    if (stats.approved === stats.total && stats.total > 0) return 'completed';
    const prevAllDone = validation.sections.slice(0, idx).every(prev => {
      const ps = sectionStats[prev.id] ?? { total: 0, approved: 0 };
      return ps.approved === ps.total && ps.total > 0;
    });
    return prevAllDone ? 'current' : 'upcoming';
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* Back link */}
      <button
        onClick={() => router.push(`/subscriptions?persona=${persona}`)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ih-text-secondary)', fontSize: 13, fontWeight: 500,
          padding: '0 0 20px 0', fontFamily: 'inherit',
        }}
      >
        <ArrowLeftOutlined style={{ fontSize: 12 }} />
        Retour aux souscriptions
      </button>

      {/* Header card */}
      <div style={{
        background: 'var(--ih-bg-card)', border: '1px solid var(--ih-border)',
        borderRadius: 14, borderLeft: '4px solid var(--ih-accent)',
        padding: '24px 28px', marginBottom: 32,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: 'var(--ih-primary)', color: 'var(--ih-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, fontWeight: 700, flexShrink: 0, letterSpacing: '0.02em',
            }}>
              {getInitials(validation.investorName)}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ih-text-primary)', lineHeight: 1.2, marginBottom: 4 }}>
                {validation.investorName}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ih-text-secondary)' }}>
                {subscription.fund} · {validation.part}
              </div>
            </div>
          </div>
          <Tag color="purple" style={{ borderRadius: 20, fontWeight: 600, fontSize: 12.5, padding: '3px 12px', marginTop: 4 }}>
            Étude du dossier
          </Tag>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Montant souscrit', value: formatEur(validation.partValue) },
            { label: "Frais d'entrée", value: formatEur(validation.entryFees) },
            { label: 'Sections', value: `${validation.sections.length}` },
            { label: 'Champs validés', value: `${totalApproved} / ${totalFields}` },
          ].map(m => (
            <div key={m.label} style={{
              flex: 1, background: 'var(--ih-bg)', border: '1px solid var(--ih-border)',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ih-text-primary)' }}>{m.value}</div>
            </div>
          ))}
        </div>
        {totalFields > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ih-text-secondary)', marginBottom: 6 }}>
              <span>Progression de la validation</span>
              <span style={{ fontWeight: 600, color: 'var(--ih-text-primary)' }}>{progressPct} %</span>
            </div>
            <div style={{ height: 6, background: 'var(--ih-border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: progressPct === 100 ? '#10b981' : 'var(--ih-primary)',
                borderRadius: 99, transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Main layout: stepper sidebar + section cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '236px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Sections stepper */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{
            background: 'var(--ih-bg-card)', border: '1px solid var(--ih-border)',
            borderRadius: 14, padding: '20px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Sections du KYC
            </div>

            {validation.sections.map((section, idx) => {
              const state = getStepState(idx);
              const isLast = idx === validation.sections.length - 1;

              const iconBg =
                state === 'completed' ? 'rgba(203,255,153,0.6)'
                : state === 'current' ? 'rgba(255,255,255,0.15)'
                : 'var(--ih-bg)';
              const iconColor =
                state === 'completed' ? '#166534'
                : state === 'current' ? '#fff'
                : 'var(--ih-text-secondary)';
              const cardBg =
                state === 'completed' ? 'rgba(203,255,153,0.12)'
                : state === 'current' ? 'var(--ih-primary)'
                : 'transparent';
              const cardBorder =
                state === 'completed' ? '1px solid rgba(203,255,153,0.5)'
                : state === 'current' ? '1px solid transparent'
                : '1px solid transparent';
              const titleColor =
                state === 'completed' ? '#166534'
                : state === 'current' ? '#fff'
                : 'var(--ih-text-secondary)';
              const subtitleColor =
                state === 'completed' ? '#4ade80'
                : state === 'current' ? 'rgba(255,255,255,0.65)'
                : '#d1d5db';
              const lineColor =
                state === 'completed' ? 'rgba(203,255,153,0.6)'
                : 'var(--ih-border)';

              return (
                <div key={section.id}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 12,
                    background: cardBg, border: cardBorder,
                    transition: 'background 0.2s',
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {state === 'completed'
                        ? <CheckOutlined style={{ fontSize: 16, color: iconColor }} />
                        : <FileTextOutlined style={{ fontSize: 16, color: iconColor }} />
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: titleColor, lineHeight: 1.2 }}>
                        {section.title}
                      </div>
                      <div style={{ fontSize: 12, color: subtitleColor, marginTop: 2 }}>
                        Section {idx + 1}/{validation.sections.length}
                      </div>
                    </div>
                  </div>
                  {!isLast && (
                    <div style={{
                      marginLeft: 30, width: 1, height: 16,
                      background: lineColor,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section cards */}
        <div>
          {validation.sections.map((section) => {
            const stats = sectionStats[section.id] ?? { total: 0, answered: 0, approved: 0, rejected: 0 };
            const allApproved = stats.approved === stats.total && stats.total > 0;
            const sectionIconBg = allApproved
              ? 'linear-gradient(135deg, rgba(203,255,153,0.35), rgba(203,255,153,0.75))'
              : 'linear-gradient(135deg, rgba(14,42,50,0.07), rgba(14,42,50,0.15))';

            return (
              <div
                key={section.id}
                style={{
                  marginBottom: 24, background: 'var(--ih-bg-card)',
                  border: '1px solid var(--ih-border)', borderRadius: 12,
                  overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderBottom: '1px solid var(--ih-border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, background: sectionIconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <CheckOutlined style={{ fontSize: 20, color: 'var(--ih-primary)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ih-text-primary)', marginBottom: 4 }}>{section.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ih-text-secondary)' }}>
                        <span><strong style={{ color: 'var(--ih-text-primary)' }}>{stats.answered}</strong>/{stats.total} réponses</span>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ih-border)', display: 'inline-block' }} />
                        <span style={{ color: '#059669' }}><strong>{stats.approved}</strong> validées</span>
                        {stats.rejected > 0 && (
                          <>
                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ih-border)', display: 'inline-block' }} />
                            <span style={{ color: '#dc2626' }}><strong>{stats.rejected}</strong> refusées</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <SectionStatusBadge approved={stats.approved} total={stats.total} rejected={stats.rejected} />
                </div>

                {!allApproved && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 20px', background: 'rgba(14,42,50,0.04)',
                    borderBottom: '1px solid var(--ih-border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ih-primary)' }}>
                      <CheckCircleFilled style={{ color: 'var(--ih-primary)' }} />
                      <span>Vérifier toutes les réponses de cette section</span>
                    </div>
                    <Button
                      size="small"
                      onClick={() => validateSection(section.id, section.fields.length)}
                      style={{ background: 'var(--ih-primary)', borderColor: 'var(--ih-primary)', color: '#fff', fontWeight: 600 }}
                    >
                      Valider toute la section
                    </Button>
                  </div>
                )}

                <div style={{
                  display: 'grid', gridTemplateColumns: '2fr 3fr 140px',
                  padding: '8px 20px', background: 'var(--ih-bg)',
                  borderBottom: '1px solid var(--ih-border)',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Réponse</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Vérification</span>
                </div>

                <div style={{ background: 'var(--ih-bg-card)' }}>
                  {section.fields.map((field, index) => {
                    const key = getFieldKey(section.id, index);
                    const status = fieldStatuses[key] ?? 'pending';
                    const isRejected = status === 'rejected';
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'grid', gridTemplateColumns: '2fr 3fr 140px',
                          padding: '12px 20px',
                          borderBottom: index < section.fields.length - 1 ? '1px solid var(--ih-border)' : 'none',
                          alignItems: 'center', transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--ih-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--ih-bg-card)')}
                      >
                        <span style={{ fontSize: 13.5, color: isRejected ? '#dc2626' : 'var(--ih-text-secondary)' }}>{field.question}</span>
                        <span style={{ fontSize: 13.5, color: 'var(--ih-text-primary)', fontWeight: 500 }}>{field.answer}</span>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <CheckCircleFilled
                            style={{ fontSize: 20, color: status === 'approved' ? '#10b981' : '#d1d5db', cursor: 'pointer', transition: 'color 0.15s' }}
                            onClick={() => setFieldStatus(section.id, index, status === 'approved' ? 'pending' : 'approved')}
                          />
                          <CloseCircleFilled
                            style={{ fontSize: 20, color: status === 'rejected' ? '#ef4444' : '#d1d5db', cursor: 'pointer', transition: 'color 0.15s' }}
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
                background: 'linear-gradient(62deg, var(--ih-primary) 10%, var(--ih-primary-light) 89%)',
                borderColor: 'transparent', color: '#fff', fontWeight: 600,
              }}
            >
              Valider le KYC
            </Button>
          </div>
        </div>
      </div>

      {/* Reopen modal */}
      <Modal open={reopenOpen} onCancel={() => setReopenOpen(false)} footer={null} closable={false} width={580}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--ih-text-secondary)', marginBottom: 20, lineHeight: 1.7 }}>
            Les questions et documents non valides seront repris dans le courriel envoyé à l&apos;investisseur.
            Vous pouvez ajouter un message général et un message spécifique par question
            pour favoriser la correction du dossier.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>Message :</div>
            <Input.TextArea value={reopenMessage} onChange={e => setReopenMessage(e.target.value)} rows={4} style={{ width: '100%' }} />
          </div>
          <Button
            type="primary"
            onClick={handleReopen}
            style={{ width: '100%', background: 'var(--ih-primary)', borderColor: 'var(--ih-primary)', fontWeight: 600, height: 44 }}
          >
            Rouvrir le KYC
          </Button>
        </div>
      </Modal>
    </div>
  );
}
