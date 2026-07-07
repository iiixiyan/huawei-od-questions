import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Empty, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { TopLevel, Question } from '../types/question';
import { useFavorites } from '../hooks/useFavorites';
import { parseAcceptRate } from '../utils/parseAcceptRate';

const DATA_URL = '/data.json';

export default function Favorites() {
  const [data, setData] = useState<TopLevel | null>(null);
  const { favorites } = useFavorites();
  const nav = useNavigate();

  useEffect(() => {
    fetch(DATA_URL).then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return <Card loading style={{ minHeight: 400 }} />;

  const favQs = data.题目列表.filter(q => favorites.includes(q.pid));

  return (
    <div>
      <div style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>
        ❤️ 我的收藏 ({favQs.length} 题)
      </div>
      {favQs.length === 0 ? <Empty description="还没有收藏题目" /> : (
        <Row gutter={[12, 12]}>
          {favQs.map(q => {
            const rate = parseAcceptRate(q.accept_rate || '');
            const tags = q.tags || q.topics || [];
            return (
              <Col key={q.pid} xs={24} sm={12} md={8} lg={6}>
                <Card hoverable size="small" onClick={() => nav('/question/' + q.pid)} style={{ height: '100%' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{q.title}</div>
                  <div style={{ fontSize: 11, color: '#999', margin: '4px 0' }}>
                    {q.pid} · L{q.difficulty}
                  </div>
                  <div>{tags.slice(0, 3).map(t => <Tag key={t} style={{ fontSize: 10 }}>{t}</Tag>)}</div>
                  <Badge count={rate.percentage + '%'} style={{ backgroundColor: rate.percentage > 60 ? '#52c41a' : '#faad14' }} />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
