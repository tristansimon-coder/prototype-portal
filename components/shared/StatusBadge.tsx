import { Tag } from 'antd';

const statusConfig: Record<string, { label: string; color: string }> = {
  to_sign:       { label: 'Souscription à envoyer en signature', color: 'orange' },
  in_progress:   { label: 'Souscription en cours',               color: 'processing' },
  valid:         { label: 'Valide',                              color: 'success' },
  rejected:      { label: 'Refusée',                            color: 'error' },
  draft:         { label: 'Brouillon',                          color: 'default' },
  study:         { label: 'Étude du dossier',                   color: 'blue' },
  pre_validated: { label: 'Prévalidé',                          color: 'cyan' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, color: 'default' };
  return <Tag color={config.color}>{config.label}</Tag>;
}
