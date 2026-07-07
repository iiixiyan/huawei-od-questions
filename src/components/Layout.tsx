import { Layout as AntLayout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOutlined, HomeOutlined, HeartOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

const { Header, Content, Footer } = AntLayout;

export default function Layout({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const key = loc.pathname === '/' ? '/' : loc.pathname.startsWith('/question') ? '/questions' : loc.pathname;

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 20px', background: '#001529' }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginRight: 30, whiteSpace: 'nowrap' }}>
          📚 OD题库
        </div>
        <Menu
          theme="dark" mode="horizontal" selectedKeys={[key]}
          items={[
            { key: '/', icon: <HomeOutlined />, label: '首页', onClick: () => nav('/') },
            { key: '/questions', icon: <BookOutlined />, label: '题目列表', onClick: () => nav('/questions') },
            { key: '/favorites', icon: <HeartOutlined />, label: '我的收藏', onClick: () => nav('/favorites') },
          ]}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ maxWidth: 1200, width: '100%', margin: '16px auto', padding: '0 16px' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center', color: '#999', padding: '16px', fontSize: 12 }}>
        华为OD 2026题库 · 数据来源 GitCode
      </Footer>
    </AntLayout>
  );
}
