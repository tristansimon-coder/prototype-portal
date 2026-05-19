import type { ThemeConfig } from 'antd';

export const investHubTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0D3D56',
    colorPrimaryHover: '#1A5C7A',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    borderRadius: 8,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
  },
  components: {
    Button: {
      // Primary: navy filled, no shadow
      colorPrimary: '#0D3D56',
      colorPrimaryHover: '#1A5C7A',
      colorPrimaryActive: '#0a2e40',
      primaryColor: '#ffffff',
      primaryShadow: 'none',
      // Default (secondary): white + border, no shadow
      defaultBorderColor: '#D1D5DB',
      defaultColor: '#1A1A2E',
      defaultBg: '#ffffff',
      defaultHoverBorderColor: '#0D3D56',
      defaultHoverColor: '#0D3D56',
      defaultHoverBg: '#ffffff',
      defaultShadow: 'none',
      boxShadow: 'none',
      dangerShadow: 'none',
    },
  },
};
