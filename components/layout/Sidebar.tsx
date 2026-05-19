'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const navItems = [
  { key: 'home', label: 'Home', path: '/home' },
  { key: 'documents', label: 'My documents', path: '/documents' },
  { key: 'subscriptions', label: 'My subscriptions', path: '/subscriptions' },
  { key: 'performances', label: 'My Performances', path: '/performances' },
  { key: 'funds', label: 'Our funds', path: '/funds' },
  { key: 'secondary-market', label: 'Marché secondaire', path: '/secondary-market' },
  { key: 'design-system', label: '⚙ Design System', path: '/design-system' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 0 16px 0' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px' }}>
          InvestHub<sup style={{ fontSize: 10 }}>®</sup>
        </div>
        <div style={{ color: 'var(--ih-accent)', fontSize: 11, marginTop: 2, fontWeight: 500 }}>
          Portail Investisseur
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 12px 8px' }}>
        <Input
          prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
          placeholder="Rechercher"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white',
            borderRadius: 6,
          }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path !== '/home' && pathname.startsWith(item.path));
          return (
            <Link key={item.key} href={item.path} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 20px',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: 13.5,
                  transition: 'all 0.15s',
                  borderRadius: 0,
                }}
              >
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom user actions */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 20px',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: 13.5,
          }}
        >
          <span>Profil</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 20px',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: 13.5,
          }}
        >
          <span>Se déconnecter</span>
        </div>
      </div>
    </div>
  );
}
