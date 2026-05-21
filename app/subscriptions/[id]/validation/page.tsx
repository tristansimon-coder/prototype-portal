'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Modal, Input, Tag, Tooltip, Upload, Drawer } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, CheckOutlined, ArrowLeftOutlined, FileTextOutlined, FolderOutlined, WarningFilled, DownloadOutlined, MessageOutlined, UploadOutlined, CodeOutlined, LinkOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { kycValidations, kycDocuments, subscriptions } from '@/data/mock';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { VALIDATION_PAGE_CODE } from '@/lib/code-sources';

type FieldStatus = 'pending' | 'approved' | 'rejected';

interface RejectedItem {
  key: string;
  sectionTitle: string;
  label: string;
  sublabel?: string;
}

function getFieldKey(sectionId: string, index: number) { return `${sectionId}-${index}`; }

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function SectionStatusBadge({ approved, total, rejected }: { approved: number; total: number; rejected: number }) {
  if (approved === total && total > 0)
    return <Tag color="success" style={{ borderRadius: 20, fontWeight: 600, fontSize: 12 }}>Section validée</Tag>;
  if (rejected > 0)
    return <Tag color="error" style={{ borderRadius: 20, fontWeight: 600, fontSize: 12 }}>{rejected} refusée{rejected > 1 ? 's' : ''}</Tag>;
  return <Tag color="warning" style={{ borderRadius: 20, fontWeight: 600, fontSize: 12 }}>En cours</Tag>;
}

export default function ValidationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const persona = searchParams.get('persona') ?? 'lp';

  const id = Number(params.id);
  const validation = kycValidations[id];
  const docs = kycDocuments[id] ?? [];
  const subscription = subscriptions.find(s => s.id === id);

  const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>({});
  const [fieldRejectReasons, setFieldRejectReasons] = useState<Record<string, string>>({});

  // Reopen KYC modal
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReasonDrafts, setReopenReasonDrafts] = useState<Record<string, string>>({});
  const [reopenGlobalMessage, setReopenGlobalMessage] = useState('');

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [commentTarget, setCommentTarget] = useState<string | null>(null);
  const [docComments, setDocComments] = useState<Record<string, string>>({});
  const [commentDraft, setCommentDraft] = useState('');
  const [replacedDocs, setReplacedDocs] = useState<Record<string, string>>({});

  const sectionStats = useMemo(() => {
    if (!validation) return {};
    const stats: Record<string, { total: number; answered: number; approved: number; rejected: number }> = {};
    for (const section of validation.sections) {
      let approved = 0, rejected = 0;
      for (let i = 0; i < section.fields.length; i++) {
        const st = fieldStatuses[`${section.id}-${i}`] ?? 'pending';
        if (st === 'approved') approved++;
        if (st === 'rejected') rejected++;
      }
      stats[section.id] = { total: section.fields.length, answered: section.fields.length, approved, rejected };
    }
    return stats;
  }, [validation, fieldStatuses]);

  const docStats = useMemo(() => {
    let approved = 0, rejected = 0;
    for (const doc of docs) {
      const st = fieldStatuses[`doc-${doc.id}`] ?? 'pending';
      if (st === 'approved') approved++;
      if (st === 'rejected') rejected++;
    }
    return { total: docs.length, approved, rejected };
  }, [docs, fieldStatuses]);

  const totalApproved = useMemo(() => {
    if (!validation) return 0;
    return validation.sections.reduce((sum, s) => sum + (sectionStats[s.id]?.approved ?? 0), 0) + docStats.approved;
  }, [validation, sectionStats, docStats]);

  const totalFields = useMemo(() => {
    if (!validation) return 0;
    return validation.sections.reduce((sum, s) => sum + s.fields.length, 0) + docs.length;
  }, [validation, docs]);

  const rejectedItems = useMemo((): RejectedItem[] => {
    if (!validation) return [];
    const items: RejectedItem[] = [];
    for (const section of validation.sections) {
      for (let i = 0; i < section.fields.length; i++) {
        const key = getFieldKey(section.id, i);
        if ((fieldStatuses[key] ?? 'pending') === 'rejected') {
          items.push({ key, sectionTitle: section.title, label: section.fields[i].question, sublabel: section.fields[i].answer });
        }
      }
    }
    for (const doc of docs) {
      const key = `doc-${doc.id}`;
      if ((fieldStatuses[key] ?? 'pending') === 'rejected') {
        items.push({ key, sectionTitle: 'Documents', label: doc.name });
      }
    }
    return items;
  }, [validation, fieldStatuses, docs]);

  const rejectedBySectionTitle = useMemo(() => {
    const groups: Record<string, RejectedItem[]> = {};
    for (const item of rejectedItems) {
      if (!groups[item.sectionTitle]) groups[item.sectionTitle] = [];
      groups[item.sectionTitle].push(item);
    }
    return groups;
  }, [rejectedItems]);

  useEffect(() => {
    if (!validation) return;
    const observers: IntersectionObserver[] = [];
    const sectionIds = [...validation.sections.map(s => s.id), 'documents'];
    for (const sid of sectionIds) {
      const el = sectionRefs.current[sid];
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(sid); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => observers.forEach(o => o.disconnect());
  }, [validation, docs]);

  if (!validation || !subscription) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--ih-text-secondary)', marginBottom: 16 }}>Validation non trouvée.</p>
        <Button onClick={() => router.back()}>Retour</Button>
      </div>
    );
  }

  function setFieldStatus(key: string, next: FieldStatus) {
    setFieldStatuses(prev => ({ ...prev, [key]: next }));
  }

  function toggleReject(key: string) {
    const current = fieldStatuses[key] ?? 'pending';
    if (current === 'rejected') {
      setFieldStatus(key, 'pending');
      setFieldRejectReasons(prev => { const n = { ...prev }; delete n[key]; return n; });
    } else {
      setFieldStatus(key, 'rejected');
    }
  }

  function validateSection(sectionId: string, fieldCount: number) {
    const updates: Record<string, FieldStatus> = {};
    for (let i = 0; i < fieldCount; i++) updates[getFieldKey(sectionId, i)] = 'approved';
    setFieldStatuses(prev => ({ ...prev, ...updates }));
  }

  function validateAllDocs() {
    const updates: Record<string, FieldStatus> = {};
    for (const doc of docs) updates[`doc-${doc.id}`] = 'approved';
    setFieldStatuses(prev => ({ ...prev, ...updates }));
  }

  function scrollToSection(sectionId: string) {
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openReopen() {
    const drafts: Record<string, string> = {};
    for (const item of rejectedItems) drafts[item.key] = fieldRejectReasons[item.key] ?? '';
    setReopenReasonDrafts(drafts);
    setReopenGlobalMessage('');
    setReopenOpen(true);
  }

  function handleReopen() {
    setFieldRejectReasons(prev => ({ ...prev, ...reopenReasonDrafts }));
    setReopenOpen(false);
    router.push(`/subscriptions?persona=${persona}`);
  }

  function openComment(docId: string) {
    setCommentTarget(docId);
    setCommentDraft(docComments[docId] ?? '');
  }

  function saveComment() {
    if (commentTarget) setDocComments(prev => ({ ...prev, [commentTarget]: commentDraft }));
    setCommentTarget(null);
  }

  function getStepState(sectionId: string, idx: number): 'completed' | 'current' | 'upcoming' {
    if (sectionId === 'documents') {
      if (docStats.approved === docStats.total && docStats.total > 0) return 'completed';
      const allKycDone = validation.sections.every(s => {
        const ps = sectionStats[s.id] ?? { total: 0, approved: 0 };
        return ps.approved === ps.total && ps.total > 0;
      });
      return allKycDone ? 'current' : 'upcoming';
    }
    const s = validation.sections[idx];
    const stats = sectionStats[s.id] ?? { total: 0, approved: 0, rejected: 0 };
    if (stats.approved === stats.total && stats.total > 0) return 'completed';
    const prevAllDone = validation.sections.slice(0, idx).every(prev => {
      const ps = sectionStats[prev.id] ?? { total: 0, approved: 0 };
      return ps.approved === ps.total && ps.total > 0;
    });
    return prevAllDone ? 'current' : 'upcoming';
  }

  const progressPct = totalFields > 0 ? Math.round((totalApproved / totalFields) * 100) : 0;

  const allStepperItems = [
    ...validation.sections.map((s, idx) => ({ id: s.id, title: s.title, idx, isDoc: false })),
    { id: 'documents', title: 'Documents', idx: validation.sections.length, isDoc: true },
  ];

  const DOC_GRID = '3fr 1.4fr 1.4fr 110px 110px 130px';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* Top nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button
          onClick={() => router.push(`/subscriptions?persona=${persona}`)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ih-text-secondary)', fontSize: 13, fontWeight: 500, padding: 0, fontFamily: 'inherit' }}
        >
          <ArrowLeftOutlined style={{ fontSize: 12 }} />
          Retour aux souscriptions
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button
            type="text"
            size="small"
            icon={<LinkOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2000);
            }}
            style={{ color: linkCopied ? '#059669' : 'var(--ih-text-secondary)', fontSize: 12 }}
          >
            {linkCopied ? 'Lien copié !' : 'Copier le lien'}
          </Button>
          <Button type="text" size="small" icon={<CodeOutlined />} onClick={() => setCodeOpen(true)} style={{ color: 'var(--ih-text-secondary)', fontSize: 12 }}>
            Code
          </Button>
        </div>
      </div>

      {/* Header card */}
      <div style={{ background: 'var(--ih-bg-card)', border: '1px solid var(--ih-border)', borderRadius: 14, borderLeft: '4px solid var(--ih-accent)', padding: '24px 28px', marginBottom: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ih-text-primary)', lineHeight: 1.2, marginBottom: 4 }}>{validation.investorName}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ih-text-secondary)' }}>{subscription.fund} · {validation.part}</div>
          </div>
          <Tag color="purple" style={{ borderRadius: 20, fontWeight: 600, fontSize: 12.5, padding: '3px 12px', marginTop: 4 }}>Étude du dossier</Tag>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Montant souscrit', value: formatEur(validation.partValue) },
            { label: "Frais d'entrée", value: formatEur(validation.entryFees) },
            { label: 'Sections', value: `${validation.sections.length}` },
            { label: 'Champs validés', value: `${totalApproved} / ${totalFields}` },
          ].map(m => (
            <div key={m.label} style={{ flex: 1, background: 'var(--ih-bg)', border: '1px solid var(--ih-border)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ih-text-primary)' }}>{m.value}</div>
            </div>
          ))}
        </div>
        {totalFields > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ih-text-secondary)', marginBottom: 6 }}>
              <span>Progression de la validation</span>
              <span style={{ fontWeight: 600, color: 'var(--ih-text-primary)' }}>{progressPct} %</span>
            </div>
            <div style={{ height: 6, background: 'var(--ih-border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct === 100 ? '#10b981' : 'var(--ih-primary)', borderRadius: 99, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '236px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Sticky stepper */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: 'var(--ih-bg-card)', border: '1px solid var(--ih-border)', borderRadius: 14, padding: '20px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Sections du KYC</div>
            {allStepperItems.map((item, listIdx) => {
              const state = getStepState(item.id, item.idx);
              const isActive = activeSection === item.id;
              const isLast = listIdx === allStepperItems.length - 1;
              const iconBg = state === 'completed' ? 'rgba(203,255,153,0.6)' : state === 'current' ? 'rgba(255,255,255,0.15)' : 'var(--ih-bg)';
              const iconColor = state === 'completed' ? '#166834' : state === 'current' ? '#fff' : 'var(--ih-text-secondary)';
              const cardBg = state === 'completed' ? 'rgba(203,255,153,0.12)' : state === 'current' ? 'var(--ih-primary)' : 'transparent';
              const cardBorder = isActive ? '2px solid var(--ih-primary)' : state === 'completed' ? '1px solid rgba(203,255,153,0.5)' : '1px solid transparent';
              const titleColor = state === 'completed' ? '#166834' : state === 'current' ? '#fff' : 'var(--ih-text-secondary)';
              const subtitleColor = state === 'completed' ? '#4ade80' : state === 'current' ? 'rgba(255,255,255,0.65)' : '#d1d5db';
              const lineColor = state === 'completed' ? 'rgba(203,255,153,0.6)' : 'var(--ih-border)';
              return (
                <div key={item.id}>
                  <div onClick={() => scrollToSection(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: cardBg, border: cardBorder, cursor: 'pointer' }} onMouseEnter={e => { if (state === 'upcoming') (e.currentTarget as HTMLDivElement).style.background = 'var(--ih-bg)'; }} onMouseLeave={e => { if (state === 'upcoming') (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {state === 'completed' ? <CheckOutlined style={{ fontSize: 16, color: iconColor }} /> : item.isDoc ? <FolderOutlined style={{ fontSize: 16, color: iconColor }} /> : <FileTextOutlined style={{ fontSize: 16, color: iconColor }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: titleColor, lineHeight: 1.2 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: subtitleColor, marginTop: 2 }}>{item.isDoc ? `${docs.length} documents` : `Section ${listIdx + 1}/${allStepperItems.length}`}</div>
                    </div>
                  </div>
                  {!isLast && <div style={{ marginLeft: 30, width: 1, height: 16, background: lineColor }} />}
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
            const sectionIconBg = allApproved ? 'linear-gradient(135deg, rgba(203,255,153,0.35), rgba(203,255,153,0.75))' : 'linear-gradient(135deg, rgba(14,42,50,0.07), rgba(14,42,50,0.15))';
            return (
              <div key={section.id} ref={el => { sectionRefs.current[section.id] = el; }} style={{ marginBottom: 24, background: 'var(--ih-bg-card)', border: '1px solid var(--ih-border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', scrollMarginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--ih-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: sectionIconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckOutlined style={{ fontSize: 20, color: 'var(--ih-primary)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ih-text-primary)', marginBottom: 4 }}>{section.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ih-text-secondary)' }}>
                        <span><strong style={{ color: 'var(--ih-text-primary)' }}>{stats.answered}</strong>/{stats.total} réponses</span>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ih-border)', display: 'inline-block' }} />
                        <span style={{ color: '#059669' }}><strong>{stats.approved}</strong> validées</span>
                        {stats.rejected > 0 && (<><span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ih-border)', display: 'inline-block' }} /><span style={{ color: '#dc2626' }}><strong>{stats.rejected}</strong> refusées</span></>)}
                      </div>
                    </div>
                  </div>
                  <SectionStatusBadge approved={stats.approved} total={stats.total} rejected={stats.rejected} />
                </div>
                {!allApproved && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: 'rgba(14,42,50,0.04)', borderBottom: '1px solid var(--ih-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ih-primary)' }}>
                      <CheckCircleFilled style={{ color: 'var(--ih-primary)' }} />
                      <span>Vérifier toutes les réponses de cette section</span>
                    </div>
                    <Button size="small" onClick={() => validateSection(section.id, section.fields.length)} style={{ background: 'var(--ih-primary)', borderColor: 'var(--ih-primary)', color: '#fff', fontWeight: 600 }}>Valider toute la section</Button>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 140px', padding: '8px 20px', background: 'var(--ih-bg)', borderBottom: '1px solid var(--ih-border)' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Réponse</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Vérification</span>
                </div>
                <div style={{ background: 'var(--ih-bg-card)' }}>
                  {section.fields.map((field, index) => {
                    const key = getFieldKey(section.id, index);
                    const status = fieldStatuses[key] ?? 'pending';
                    const isRejected = status === 'rejected';
                    const isLast = index === section.fields.length - 1;
                    return (
                      <div key={index} style={{ borderBottom: (!isLast || isRejected) ? '1px solid var(--ih-border)' : 'none' }}>
                        {/* Field row */}
                        <div
                          style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 140px', padding: '12px 20px', alignItems: 'center', background: isRejected ? 'rgba(239,68,68,0.03)' : 'var(--ih-bg-card)', transition: 'background 0.1s' }}
                          onMouseEnter={e => { if (!isRejected) (e.currentTarget as HTMLDivElement).style.background = 'var(--ih-bg)'; }}
                          onMouseLeave={e => { if (!isRejected) (e.currentTarget as HTMLDivElement).style.background = 'var(--ih-bg-card)'; }}
                        >
                          <span style={{ fontSize: 13.5, color: isRejected ? '#dc2626' : 'var(--ih-text-secondary)' }}>{field.question}</span>
                          <span style={{ fontSize: 13.5, color: 'var(--ih-text-primary)', fontWeight: 500 }}>{field.answer}</span>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <CheckCircleFilled style={{ fontSize: 20, color: status === 'approved' ? '#10b981' : '#d1d5db', cursor: 'pointer', transition: 'color 0.15s' }} onClick={() => setFieldStatus(key, status === 'approved' ? 'pending' : 'approved')} />
                            <CloseCircleFilled style={{ fontSize: 20, color: isRejected ? '#ef4444' : '#d1d5db', cursor: 'pointer', transition: 'color 0.15s' }} onClick={() => toggleReject(key)} />
                          </div>
                        </div>
                        {/* Inline rejection reason */}
                        {isRejected && (
                          <div style={{ padding: '8px 20px 12px', background: 'rgba(239,68,68,0.03)', borderTop: '1px solid rgba(239,68,68,0.1)' }}>
                            <Input.TextArea
                              value={fieldRejectReasons[key] ?? ''}
                              onChange={e => setFieldRejectReasons(prev => ({ ...prev, [key]: e.target.value }))}
                              rows={2}
                              placeholder="Motif de refus à communiquer à l'investisseur…"
                              style={{ fontSize: 12, borderColor: 'rgba(239,68,68,0.35)', background: '#fff' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {docs.length > 0 && (() => {
            const allDocsApproved = docStats.approved === docStats.total && docStats.total > 0;
            const docsIconBg = allDocsApproved ? 'linear-gradient(135deg, rgba(203,255,153,0.35), rgba(203,255,153,0.75))' : 'linear-gradient(135deg, rgba(14,42,50,0.07), rgba(14,42,50,0.15))';
            return (
              <div ref={el => { sectionRefs.current['documents'] = el; }} style={{ marginBottom: 24, background: 'var(--ih-bg-card)', border: '1px solid var(--ih-border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', scrollMarginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--ih-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: docsIconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FolderOutlined style={{ fontSize: 20, color: 'var(--ih-primary)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ih-text-primary)', marginBottom: 4 }}>Documents justificatifs</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ih-text-secondary)' }}>
                        <span><strong style={{ color: 'var(--ih-text-primary)' }}>{docs.length}</strong> documents</span>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ih-border)', display: 'inline-block' }} />
                        <span style={{ color: '#059669' }}><strong>{docStats.approved}</strong> validés</span>
                        {docStats.rejected > 0 && (<><span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ih-border)', display: 'inline-block' }} /><span style={{ color: '#dc2626' }}><strong>{docStats.rejected}</strong> refusés</span></>)}
                      </div>
                    </div>
                  </div>
                  <SectionStatusBadge approved={docStats.approved} total={docStats.total} rejected={docStats.rejected} />
                </div>
                {!allDocsApproved && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: 'rgba(14,42,50,0.04)', borderBottom: '1px solid var(--ih-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ih-primary)' }}>
                      <CheckCircleFilled style={{ color: 'var(--ih-primary)' }} />
                      <span>Vérifier tous les documents de cette section</span>
                    </div>
                    <Button size="small" onClick={validateAllDocs} style={{ background: 'var(--ih-primary)', borderColor: 'var(--ih-primary)', color: '#fff', fontWeight: 600 }}>Valider toute la section</Button>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: DOC_GRID, padding: '8px 20px', background: 'var(--ih-bg)', borderBottom: '1px solid var(--ih-border)' }}>
                  {['Document', "Date d'envoi", 'Expiration', 'Voir', 'Action', 'Vérification'].map((h, i) => (
                    <span key={h} style={{ fontSize: 12, fontWeight: 600, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i >= 3 ? 'right' : 'left' }}>{h}</span>
                  ))}
                </div>
                <div style={{ background: 'var(--ih-bg-card)' }}>
                  {docs.map((doc, index) => {
                    const key = `doc-${doc.id}`;
                    const status = fieldStatuses[key] ?? 'pending';
                    const isRejected = status === 'rejected';
                    const hasComment = !!docComments[doc.id];
                    const replacedName = replacedDocs[doc.id];
                    const isLast = index === docs.length - 1;
                    return (
                      <div key={doc.id} style={{ borderBottom: (!isLast || isRejected) ? '1px solid var(--ih-border)' : 'none' }}>
                        {/* Doc row */}
                        <div
                          style={{ display: 'grid', gridTemplateColumns: DOC_GRID, padding: '12px 20px', alignItems: 'center', background: isRejected ? 'rgba(239,68,68,0.03)' : 'var(--ih-bg-card)', transition: 'background 0.1s' }}
                          onMouseEnter={e => { if (!isRejected) (e.currentTarget as HTMLDivElement).style.background = 'var(--ih-bg)'; }}
                          onMouseLeave={e => { if (!isRejected) (e.currentTarget as HTMLDivElement).style.background = 'var(--ih-bg-card)'; }}
                        >
                          <div style={{ paddingRight: 12 }}>
                            <span style={{ fontSize: 13.5, color: isRejected ? '#dc2626' : 'var(--ih-text-primary)', fontWeight: 500 }}>{doc.name}</span>
                            {replacedName && <div style={{ fontSize: 11.5, color: '#059669', marginTop: 2 }}>✓ Remplacé : {replacedName}</div>}
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--ih-text-secondary)' }}>{doc.sentAt}</span>
                          <span style={{ fontSize: 13, color: doc.expired ? '#dc2626' : 'var(--ih-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                            {doc.expired && <WarningFilled style={{ color: '#f59e0b', fontSize: 13 }} />}
                            {doc.expiresAt ?? '—'}
                          </span>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button size="small" icon={<DownloadOutlined />} style={{ fontSize: 12, color: 'var(--ih-primary)', borderColor: 'var(--ih-border)', background: 'var(--ih-bg)' }}>Télécharger</Button>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Upload beforeUpload={file => { setReplacedDocs(prev => ({ ...prev, [doc.id]: file.name })); return false; }} showUploadList={false} accept="*/*">
                              <Button size="small" icon={<UploadOutlined />} style={{ fontSize: 12, color: 'var(--ih-primary)', borderColor: 'var(--ih-border)', background: 'var(--ih-bg)' }}>Remplacer</Button>
                            </Upload>
                          </div>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Tooltip title={hasComment ? docComments[doc.id] : 'Ajouter un commentaire'}>
                              <MessageOutlined style={{ fontSize: 17, color: hasComment ? 'var(--ih-primary)' : '#d1d5db', cursor: 'pointer' }} onClick={() => openComment(doc.id)} />
                            </Tooltip>
                            <CheckCircleFilled style={{ fontSize: 20, color: status === 'approved' ? '#10b981' : '#d1d5db', cursor: 'pointer', transition: 'color 0.15s' }} onClick={() => setFieldStatus(key, status === 'approved' ? 'pending' : 'approved')} />
                            <CloseCircleFilled style={{ fontSize: 20, color: isRejected ? '#ef4444' : '#d1d5db', cursor: 'pointer', transition: 'color 0.15s' }} onClick={() => toggleReject(key)} />
                          </div>
                        </div>
                        {/* Inline rejection reason */}
                        {isRejected && (
                          <div style={{ padding: '8px 20px 12px', background: 'rgba(239,68,68,0.03)', borderTop: '1px solid rgba(239,68,68,0.1)' }}>
                            <Input.TextArea
                              value={fieldRejectReasons[key] ?? ''}
                              onChange={e => setFieldRejectReasons(prev => ({ ...prev, [key]: e.target.value }))}
                              rows={2}
                              placeholder="Motif de refus à communiquer à l'investisseur…"
                              style={{ fontSize: 12, borderColor: 'rgba(239,68,68,0.35)', background: '#fff' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Button onClick={openReopen} style={{ background: '#e05c6a', borderColor: '#e05c6a', color: '#fff', fontWeight: 600 }}>Rouvrir le KYC</Button>
            <Button onClick={() => router.push(`/subscriptions?persona=${persona}`)} style={{ background: 'linear-gradient(62deg, var(--ih-primary) 10%, var(--ih-primary-light) 89%)', borderColor: 'transparent', color: '#fff', fontWeight: 600 }}>Valider le KYC</Button>
          </div>
        </div>
      </div>

      {/* Modal Rouvrir le KYC */}
      <Modal open={reopenOpen} onCancel={() => setReopenOpen(false)} footer={null} title="Rouvrir le KYC" width={640}>
        <div style={{ paddingTop: 8 }}>
          {rejectedItems.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ih-text-secondary)', fontSize: 13 }}>
              Aucun champ refusé. Marquez des champs comme refusés avant de rouvrir le KYC.
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--ih-text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                Un email sera envoyé à l&apos;investisseur avec le détail des corrections attendues.
                Vous pouvez ajuster les motifs de refus avant envoi.
              </p>
              <div style={{ maxHeight: 380, overflowY: 'auto', marginBottom: 20, paddingRight: 4 }}>
                {Object.entries(rejectedBySectionTitle).map(([sectionTitle, items]) => (
                  <div key={sectionTitle} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ih-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--ih-border)' }}>
                      {sectionTitle} · {items.length} refus
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {items.map(item => (
                        <div key={item.key} style={{ padding: '12px 14px', background: 'var(--ih-bg)', borderRadius: 8, border: '1px solid var(--ih-border)' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', marginBottom: 2 }}>{item.label}</div>
                          {item.sublabel && <div style={{ fontSize: 12, color: 'var(--ih-text-secondary)', marginBottom: 8 }}>{item.sublabel}</div>}
                          <Input.TextArea
                            value={reopenReasonDrafts[item.key] ?? ''}
                            onChange={e => setReopenReasonDrafts(prev => ({ ...prev, [item.key]: e.target.value }))}
                            rows={2}
                            placeholder="Motif de refus…"
                            style={{ fontSize: 12, marginTop: item.sublabel ? 0 : 8 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--ih-bg)', borderRadius: 8, border: '1px solid var(--ih-border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ih-text-primary)', marginBottom: 8 }}>Message général (optionnel)</div>
                <Input.TextArea value={reopenGlobalMessage} onChange={e => setReopenGlobalMessage(e.target.value)} rows={3} placeholder="Message d'accompagnement général pour l'investisseur…" />
              </div>
              <Button type="primary" onClick={handleReopen} style={{ width: '100%', background: '#e05c6a', borderColor: '#e05c6a', fontWeight: 600, height: 44 }}>
                Envoyer la demande de correction ({rejectedItems.length} point{rejectedItems.length > 1 ? 's' : ''})
              </Button>
            </>
          )}
        </div>
      </Modal>

      {/* Per-document comment modal */}
      <Modal open={commentTarget !== null} onCancel={() => setCommentTarget(null)} footer={null} title="Commentaire sur le document" width={480}>
        <div style={{ paddingTop: 8 }}>
          <div style={{ fontSize: 13, color: 'var(--ih-text-secondary)', marginBottom: 12 }}>{docs.find(d => d.id === commentTarget)?.name}</div>
          <Input.TextArea value={commentDraft} onChange={e => setCommentDraft(e.target.value)} rows={4} placeholder="Votre commentaire sur ce document…" style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setCommentTarget(null)}>Annuler</Button>
            <Button type="primary" onClick={saveComment} style={{ background: 'var(--ih-primary)', borderColor: 'var(--ih-primary)' }}>Enregistrer</Button>
          </div>
        </div>
      </Modal>

      {/* Code viewer drawer */}
      <Drawer open={codeOpen} onClose={() => setCodeOpen(false)} title="Code — ValidationPage" width={720}>
        <SyntaxHighlighter language="tsx" style={oneLight} customStyle={{ fontSize: 12 }}>
          {VALIDATION_PAGE_CODE}
        </SyntaxHighlighter>
      </Drawer>
    </div>
  );
}
