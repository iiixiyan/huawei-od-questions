import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Tag, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { TopLevel } from '../types/question';
import { getAllTags, parseAcceptRate, getDifficultyLabel, getDifficultyColor } from '../utils/parseAcceptRate';
import MarkdownRenderer from './MarkdownRenderer';

const DATA_URL = '/data.json';

export default function HomePage() {
  const [data, setData] = useState<TopLevel | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    fetch(DATA_URL).then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return <Card loading style={{ minHeight: 400 }} />;

  const qs = data.题目列表;
  const tags = getAllTags(qs);
  const avgRate = qs.reduce((s, q) => {
    const p = parseAcceptRate(q.accept_rate || '');
    return s + p.percentage;
  }, 0) / qs.length;

  // Difficulty distribution
  const diffDist: Record<number, number> = {};
  for (const q of qs) {
    const d = q.difficulty;
    diffDist[d] = (diffDist[d] || 0) + 1;
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card><Statistic title="总题数" value={qs.length} prefix="📝" /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="考点标签" value={tags.length} prefix="🏷️" /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="含函数签名" value={data.有完整函数签名} prefix="✅" /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="平均通过率" value={Math.round(avgRate)} suffix="%" prefix="📊" /></Card></Col>
      </Row>

      <Card title="📖 考试说明" style={{ marginTop: 16 }}>
        <MarkdownRenderer content={data.题库说明} />
      </Card>

      <Card title="📊 难度分布" style={{ marginTop: 16 }}>
        <Row gutter={[12, 12]}>
          {Object.entries(diffDist).sort(([a],[b]) => Number(a)-Number(b)).map(([d, cnt]) => (
            <Col key={d} xs={12} sm={8} md={6}>
              <Card size="small">
                <div style={{ fontWeight: 600, color: getDifficultyColor(Number(d)) }}>{getDifficultyLabel(Number(d))} (L{d})</div>
                <Progress percent={Math.round(Number(cnt) / qs.length * 100)} format={() => `${cnt}题`} size="small" />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="🏷️ 标签云" style={{ marginTop: 16 }}>
        {tags.map(t => (
          <Tag key={t} color="blue" style={{ margin: 4, cursor: 'pointer' }}
            onClick={() => nav('/questions?tag=' + encodeURIComponent(t))}>
            {t}
          </Tag>
        ))}
      </Card>

      <Card title="🆕 最新题目" style={{ marginTop: 16 }}>
        <Row gutter={[12, 12]}>
          {qs.slice(0, 6).map(q => (
            <Col key={q.pid} xs={24} sm={12} md={8}>
              <Card hoverable size="small" onClick={() => nav('/question/' + q.pid)}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{q.title}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  {q.date} · {(q.tags || q.topics || []).join(', ')}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
