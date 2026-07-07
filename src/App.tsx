import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import QuestionList from './components/QuestionList';
import QuestionDetail from './components/QuestionDetail';
import Favorites from './components/Favorites';

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{
      token: { borderRadius: 8, colorPrimary: '#1677ff' }
    }}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/questions/" element={<QuestionList />} />
            <Route path="/question/:pid" element={<QuestionDetail />} />
            <Route path="/favorites/" element={<Favorites />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}
