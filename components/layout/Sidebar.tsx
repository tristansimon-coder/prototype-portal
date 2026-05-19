'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
  FileTextOutlined,
  LineChartOutlined,
  TeamOutlined,
  BankOutlined,
  ContactsOutlined,
  ReadOutlined,
  GlobalOutlined,
  QuestionCircleOutlined,
  SwapOutlined,
  AppstoreOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const navItems = [
  { key: 'home', label: 'Home', icon: <HomeOutlined />, path: '/home' },
  { key: 'documents', label: 'My documents', icon: <FolderOutlined />, path: '/documents' },
  { key: 'subscriptions', label: 'My subscriptions', icon: <FileTextOutlined />, path: '/subscriptions' },
  { key: 'performances', label: 'My Performances', icon: <LineChartOutlined />, path: '/performances' },
  { key: 'contacts', label: 'My contacts', icon: <TeamOutlined />, path: '/contacts' },
  { key: 'funds', label: 'Our funds', icon: <BankOutlined />, path: '/funds' },
  { key: 'ih-contacts', label: 'InvestHub contacts', icon: <ContactsOutlined />, path: '/ih-contacts' },
  { key: 'news', label: 'News', icon: <ReadOutlined />, path: '/news' },
  { key: 'external-news', label: 'External News', icon: <GlobalOutlined />, path: '/external-news' },
  { key: 'faq', label: 'FAQ', icon: <QuestionCircleOutlined />, path: '/faq' },
  { key: 'secondary-market', label: 'Marché secondaire', icon: <SwapOutlined />, path: '/secondary-market' },
  { key: 'design-system', label: '⚙ Design System', icon: <AppstoreOutlined />, path: '/design-system', devOnly: true },
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
          placeholder="Rechercher..."
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
                  color: isActive ? 'var(--ih-accent)' : 'rgba(255,255,255,0.85)',
                  background: isActive ? 'rgba(203,255,153,0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--ih-accent)' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: 13.5,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
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
            color: 'rgba(255,255,255,0.85)',
            cursor: 'pointer',
            fontSize: 13.5,
          }}
        >
          <UserOutlined />
          <span>Profil</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 20px',
            color: 'rgba(255,255,255,0.85)',
            cursor: 'pointer',
            fontSize: 13.5,
          }}
        >
          <LogoutOutlined />
          <span>Se déconnecter</span>
        </div>
      </div>
    </div>
  );
}
