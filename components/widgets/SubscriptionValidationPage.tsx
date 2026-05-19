'use client';
import { useState } from 'react';
import { Button, Modal, Input, Table } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { distributorSubscriptions, kycSections } from '@/data/mock';
import { StatusBadge } from '@/components/shared/StatusBadge';

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);
}

const allQuestionIds = kycSections.flatMap(s => s.questions.map(q => q.id));

export function SubscriptionValidationPage({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const persona = searchParams.get('persona') ?? 'distributor';

  const subscription = distributorSubscriptions.find(s => s.id === Number(id));

  const [validations, setValidations] = useState<Record<string, 'valid' | 'invalid' | null>>({});
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenMessage, setReopenMessage] = useState('');

  if (!subscription) {
    return (
      <div style={{ padding: 40, color: 'var(--ih-text-secondary)' }}>Souscription introuvable.</div>
    );
  }

  const allValidated = allQuestionIds.every(qid => validations[qid] === 'valid');

  function setQuestionState(qid: string, state: 'valid' | 'invalid') {
    setValidations(prev => ({ ...prev, [qid]: prev[qid] === state ? null : state }));
  }

  function validateSection(sectionQuestionIds: string[]) {
    setValidations(prev => {
      const next = { ...prev };
      sectionQuestionIds.forEach(qid => { next[qid] = 'valid'; });
      return next;
    });
  }

  function handleValidateKyc() {
    router.push(`/subscriptions?persona=${persona}`);
  }

  function handleReopen() {
    setReopenModalOpen(false);
    setReopenMessage('');
    router.push(`/subscriptions?persona=${persona}`);
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      {/* Back */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 24, color: 'var(--ih-text-secondary)', paddingLeft: 0 }}
        onClick={() => router.push(`/subscriptions?persona=${persona}`)}
      >
        Retour aux souscriptions
      </Button>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ih-text-primary)', margin: 0 }}>
            Validation #{subscription.id} / {subscription.investorName}
          </h1>
          <StatusBadge status={subscription.status} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--ih-text-secondary)' }}>
          {subscription.part ?? subscription.fund} — {formatEur(subscription.amount)} — Frais d&apos;entrée : 0,00 €
        </div>
      </div>

      {/* KYC sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 32 }}>
        {kycSections.map((section) => {
          const sectionQids = section.questions.map(q => q.id);
          const allSectionValid = sectionQids.every(qid => validations[qid] === 'valid');

          return (
            <div key={section.title}>
              {/* Section header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--ih-primary)',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '8px 8px 0 0',
                fontWeight: 700,
                fontSize: 14,
              }}>
                <span>{section.title}</span>
                <Button
                  size="small"
                  disabled={allSectionValid}
                  onClick={() => validateSection(sectionQids)}
                  style={{
                    background: allSectionValid ? 'rgba(255,255,255,0.3)' : '#fff',
                    color: allSectionValid ? 'rgba(255,255,255,0.7)' : 'var(--ih-primary)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Valider toute la section
                </Button>
              </div>

              {/* Questions table */}
              <div style={{ border: '1px solid var(--ih-border)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textAlign: 'left', width: '35%' }}>Question</th>
                      <th style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textAlign: 'left' }}>Réponse</th>
                      <th style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textAlign: 'center', width: 120 }}>Vérification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.questions.map((q, idx) => {
                      const state = validations[q.id] ?? null;
                      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
                      return (
                        <tr key={q.id} style={{ background: rowBg, borderTop: '1px solid var(--ih-border)' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ih-text-secondary)', fontWeight: 500 }}>{q.label}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ih-text-primary)', fontWeight: 600 }}>{q.answer}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <button
                                onClick={() => setQuestionState(q.id, 'valid')}
                                style={{
                                  width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                                  background: state === 'valid' ? '#16a34a' : '#e5e7eb',
                                  color: state === 'valid' ? '#fff' : '#6b7280',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <CheckOutlined style={{ fontSize: 13 }} />
                              </button>
                              <button
                                onClick={() => setQuestionState(q.id, 'invalid')}
                                style={{
                                  width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                                  background: state === 'invalid' ? '#dc2626' : '#e5e7eb',
                                  color: state === 'invalid' ? '#fff' : '#6b7280',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <CloseOutlined style={{ fontSize: 13 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 40, justifyContent: 'flex-end' }}>
        <Button
          danger
          onClick={() => setReopenModalOpen(true)}
          style={{ fontWeight: 600 }}
        >
          Rouvrir le KYC
        </Button>
        <Button
          type="primary"
          disabled={!allValidated}
          onClick={handleValidateKyc}
          style={{ fontWeight: 600 }}
        >
          Valider le KYC
        </Button>
      </div>

      {/* Reopen modal */}
      <Modal
        open={reopenModalOpen}
        onCancel={() => { setReopenModalOpen(false); setReopenMessage(''); }}
        footer={null}
        title="Rouvrir le KYC"
        width={480}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <div style={{ fontSize: 13, color: 'var(--ih-text-secondary)', lineHeight: 1.6 }}>
            En rouvrant le KYC, l&apos;investisseur sera notifié et pourra corriger ou compléter les informations manquantes.
            Veuillez indiquer le motif de réouverture ci-dessous.
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ih-text-primary)', marginBottom: 6 }}>Message :</div>
            <Input.TextArea
              rows={4}
              value={reopenMessage}
              onChange={e => setReopenMessage(e.target.value)}
              placeholder="Expliquez les corrections attendues…"
            />
          </div>
          <Button
            type="primary"
            onClick={handleReopen}
            disabled={!reopenMessage.trim()}
            style={{
              background: '#0d9488',
              borderColor: '#0d9488',
              fontWeight: 600,
            }}
          >
            Rouvrir le KYC
          </Button>
        </div>
      </Modal>
    </div>
  );
}
