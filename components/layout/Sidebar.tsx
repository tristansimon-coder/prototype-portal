'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
  FileTextOutlined,
  LineChartOutlined,
  BankOutlined,
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
  { key: 'funds', label: 'Our funds', icon: <BankOutlined />, path: '/funds' },
  { key: 'secondary-market', label: 'Marché secondaire', icon: <SwapOutlined />, path: '/secondary-market' },
  { key: 'design-system', label: '⚙ Design System', icon: <AppstoreOutlined />, path: '/design-system' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 0 16px 0' }}>
      {/* Search */}
      <div style={{ padding: '20px 12px 12px' }}>
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
            color: 'rgba(255,255,255,0.6)',
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
            color: 'rgba(255,255,255,0.6)',
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
