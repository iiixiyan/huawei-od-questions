import { useEffect, useState, useMemo } from 'react';
import { Card, Input, Select, Row, Col, Tag, Empty, Badge } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { TopLevel, Question } from '../types/question';
import { getAllTags, parseAcceptRate } from '../utils/parseAcceptRate';

const DATA_URL = '/data.json';

export default function QuestionList() {
  const [data, setData] = useState<TopLevel | null>(null);
  const [searchParams] = useSearchParams();
  const initTag = searchParams.get('tag') || '';
  const nav = useNavigate();

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState<string[]>(initTag ? [initTag] : []);
  const [sort, setSort] = useState<'default' | 'rate' | 'date'>('default');

  useEffect(() => {
    fetch(DATA_URL).then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return <Card loading style={{ minHeight: 400 }} />;

  const allTags = getAllTags(data.题目列表);

  const filtered = useMemo(() => {
    let list = [...data.题目列表];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.pid.toLowerCase().includes(q));
    }
    if (difficulty) list = list.filter(p => p.difficulty === difficulty);
    if (tagFilter.length) list = list.filter(p => {
      const tags = p.tags || p.topics || [];
      return tagFilter.some(t => tags.includes(t));
    });

    if (sort === 'rate') {
      list.sort((a, b) => {
        const ra = parseAcceptRate(a.accept_rate || '');
        const rb = parseAcceptRate(b.accept_rate || '');
        return ra.percentage - rb.percentage;
      });
    } else if (sort === 'date') {
      list.sort((a, b) => b.date.localeCompare(a.date));
    }

    return list;
  }, [data, search, difficulty, tagFilter, sort]);

  const statusColors: Record<string, string> = {
    '3': '#52c41a', '4': '#73d13d', '5': '#faad14', '6': '#ff4d4f', '7': '#722ed1', '8': '#722ed1'
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8}>
            <Input.Search placeholder="搜索题目名/PID" value={search} onChange={e => setSearch(e.target.value)} allowClear />
          </Col>
          <Col xs={12} sm={5}>
            <Select placeholder="难度筛选" value={difficulty} onChange={setDifficulty} allowClear style={{ width: '100%' }}>
              {[3,4,5,6,7,8].map(d => <Select.Option key={d} value={d}>L{d} 难度</Select.Option>)}
            </Select>
          </Col>
          <Col xs={12} sm={5}>
            <Select placeholder="排序" value={sort} onChange={setSort} style={{ width: '100%' }}>
              <Select.Option value="default">默认顺序</Select.Option>
              <Select.Option value="rate">通过率升序</Select.Option>
              <Select.Option value="date">日期最新</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select mode="multiple" placeholder="标签筛选" value={tagFilter} onChange={setTagFilter}
              style={{ width: '100%' }} maxTagCount={2} allowClear>
              {allTags.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
            </Select>
          </Col>
        </Row>
      </Card>

      <div style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>
        共 {filtered.length} / {data.题目列表.length} 题
      </div>

      {filtered.length === 0 ? <Empty description="无匹配题目" /> : (
        <Row gutter={[12, 12]}>
          {filtered.map(q => {
            const rate = parseAcceptRate(q.accept_rate || '');
            const tags = q.tags || q.topics || [];
            return (
              <Col key={q.pid} xs={24} sm={12} md={8} lg={6}>
                <Card hoverable size="small" onClick={() => nav('/question/' + q.pid)}
                  style={{ height: '100%' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    {q.title.length > 30 ? q.title.slice(0, 30) + '...' : q.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                    {q.pid} · {q.date} · 
                    <Tag color={statusColors[String(q.difficulty)] || 'default'} style={{ fontSize: 10, marginLeft: 4 }}>
                      L{q.difficulty}
                    </Tag>
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    {tags.slice(0, 3).map(t => <Tag key={t} style={{ fontSize: 10, margin: 1 }}>{t}</Tag>)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: rate.percentage > 60 ? '#52c41a' : rate.percentage > 30 ? '#faad14' : '#ff4d4f' }}>
                      通过率 {rate.percentage}%
                    </span>
                    <Badge count={rate.percentage + '%'} style={{ backgroundColor: rate.percentage > 60 ? '#52c41a' : rate.percentage > 30 ? '#faad14' : '#ff4d4f' }} />
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
