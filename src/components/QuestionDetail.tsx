import { useEffect, useState, useMemo } from 'react';
import { Card, Tag, Button, Radio, Space, Progress, message, Tabs, Input, Select } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartOutlined, HeartFilled, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import type { Question, IndexData } from '../types/question';
import { parseAcceptRate, getDifficultyColor, getAllTags } from '../utils/parseAcceptRate';
import { useFavorites } from '../hooks/useFavorites';
import { useProgress } from '../hooks/useProgress';
import MarkdownRenderer from './MarkdownRenderer';

const BASE = import.meta.env.BASE_URL;
const LANG_LABELS: Record<string, string> = { py: 'Python', java: 'Java', cc: 'C++', js: 'JavaScript', c: 'C' };
const LANG_KEYS = ['py', 'java', 'cc', 'js', 'c'];

export default function QuestionDetail() {
  const { pid } = useParams<{ pid: string }>();
  const nav = useNavigate();
  const [q, setQ] = useState<Question | null>(null);
  const [codeLang, setCodeLang] = useState('py');
  const [tab, setTab] = useState('desc');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getStatus, setStatus } = useProgress();

  // Sidebar
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarTag, setSidebarTag] = useState<string | null>(null);

  useEffect(() => {
    if (!pid) return;
    fetch(BASE + 'questions/' + pid + '.json').then(r => {
      if (!r.ok) throw new Error('Not found');
      return r.json();
    }).then(setQ).catch(() => setQ(null));
  }, [pid]);

  useEffect(() => {
    fetch(BASE + 'index.json').then(r => r.json()).then(setIndexData).catch(() => {});
  }, []);

  if (!q) return <Card loading style={{ minHeight: 400 }} />;

  const rate = parseAcceptRate(q.accept_rate || '');
  const tags = q.tags || q.topics || [];
  const fav = isFavorite(q.pid);
  const status = getStatus(q.pid);
  const ct = q.code_templates || {};
  const codeTemplate = ct[codeLang] || ct[codeLang + '.py3'] || ct[codeLang + '.cc14o2'] || '';

  // Sidebar filtered list
  const allTags = indexData ? getAllTags(indexData.题目列表) : [];
  const sidebarList = useMemo(() => {
    if (!indexData) return [];
    let list = [...indexData.题目列表];
    if (sidebarSearch) {
      const qs = sidebarSearch.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(qs) || p.pid.toLowerCase().includes(qs));
    }
    if (sidebarTag) {
      list = list.filter(p => {
        const t = p.tags || p.topics || [];
        return t.includes(sidebarTag);
      });
    }
    return list;
  }, [indexData, sidebarSearch, sidebarTag]);

  const statusColors: Record<string, string> = {
    '3': '#52c41a', '4': '#73d13d', '5': '#faad14', '6': '#ff4d4f', '7': '#722ed1', '8': '#722ed1'
  };

  return (
    <div className="detail-layout">
      {/* Left Sidebar */}
      <div className="detail-sidebar">
        <div className="sidebar-header">
          题目列表 <span className="sidebar-count">{sidebarList.length}</span>
        </div>
        <div className="sidebar-filters">
          <Input
            placeholder="搜索题目名/PID"
            prefix={<SearchOutlined />}
            value={sidebarSearch}
            onChange={e => setSidebarSearch(e.target.value)}
            allowClear
            size="small"
            style={{ marginBottom: 8 }}
          />
          <Select
            placeholder="按分类筛选"
            value={sidebarTag}
            onChange={setSidebarTag}
            allowClear
            size="small"
            style={{ width: '100%' }}
          >
            {allTags.map(t => (
              <Select.Option key={t} value={t}>{t}</Select.Option>
            ))}
          </Select>
        </div>
        <div className="sidebar-list">
          {sidebarList.map(item => {
            const isActive = item.pid === q.pid;
            const itemTags = item.tags || item.topics || [];
            return (
              <div
                key={item.pid}
                className={`sidebar-item${isActive ? ' active' : ''}`}
                onClick={() => nav('/question/' + item.pid)}
              >
                <div className="sidebar-item-title">
                  {item.title.length > 50 ? item.title.slice(0, 50) + '…' : item.title}
                </div>
                <div className="sidebar-item-meta">
                  <span className="sidebar-item-pid">{item.pid}</span>
                  <Tag
                    color={statusColors[String(item.difficulty)] || 'default'}
                    style={{ fontSize: 10, lineHeight: '16px', padding: '0 5px', margin: 0, borderRadius: 3 }}
                  >
                    L{item.difficulty}
                  </Tag>
                  {itemTags.length > 0 && (
                    <span className="sidebar-item-tags">
                      {itemTags[0]}{itemTags.length > 1 ? ` +${itemTags.length - 1}` : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Main Content */}
      <div className="detail-main">
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => nav('/questions')}
          style={{ padding: 0, marginBottom: 10, fontSize: 13 }}>返回列表</Button>

        <Card styles={{ body: { padding: '14px 18px' } }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>
                {q.title}
                <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400, marginLeft: 6 }}>[{q.pid}]</span>
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {tags.map(t => <Tag key={t} color="blue" style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>{t}</Tag>)}
                <Tag color={getDifficultyColor(q.difficulty)} style={{ fontSize: 11, lineHeight: '18px', margin: 0 }}>L{q.difficulty}</Tag>
                <span style={{ fontSize: 12, color: '#999' }}>📅 {q.date}</span>
                {q.has_signature && <Tag color="success" style={{ fontSize: 11, margin: 0 }}>✅ 含函数签名</Tag>}
              </div>
            </div>
            <Space direction="vertical" align="end" size={4}>
              <Button type={fav ? 'primary' : 'default'} danger={fav} size="small"
                icon={fav ? <HeartFilled /> : <HeartOutlined />}
                onClick={() => { toggleFavorite(q.pid); message.info(fav ? '已取消收藏' : '已收藏'); }}>
                {fav ? '已收藏' : '收藏'}
              </Button>
              <Progress type="circle" size={44} percent={rate.percentage}
                strokeColor={rate.percentage > 60 ? '#52c41a' : rate.percentage > 30 ? '#faad14' : '#ff4d4f'}
                format={() => rate.percentage + '%'} />
              <div style={{ fontSize: 11, color: '#999' }}>通过率 {q.accept_rate}</div>
            </Space>
          </div>

          <div style={{ marginTop: 10 }}>
            <Radio.Group value={status} onChange={e => setStatus(q.pid, e.target.value)} size="small">
              <Radio.Button value="undone" style={{ fontSize: 12 }}>📋 未开始</Radio.Button>
              <Radio.Button value="doing" style={{ fontSize: 12 }}>✏️ 进行中</Radio.Button>
              <Radio.Button value="done" style={{ fontSize: 12 }}>✅ 已完成</Radio.Button>
            </Radio.Group>
          </div>
        </Card>

        <Card style={{ marginTop: 10 }} styles={{ body: { padding: '12px 16px' } }}>
          <Tabs activeKey={tab} onChange={setTab} size="small" items={[
            {
              key: 'desc',
              label: <span style={{ fontSize: 13 }}>📄 题目描述</span>,
              children: <MarkdownRenderer content={q.description_md} />
            },
            {
              key: 'solution',
              label: <span style={{ fontSize: 13 }}>📖 题解</span>,
              children: <MarkdownRenderer content={q.solution} />
            },
            {
              key: 'template',
              label: <span style={{ fontSize: 13 }}>💻 代码模板</span>,
              children: (
                <div>
                  <Space style={{ marginBottom: 10 }}>
                    {LANG_KEYS.map(k => (
                      <Button key={k} type={codeLang === k ? 'primary' : 'default'}
                        size="small" style={{ fontSize: 12 }} onClick={() => setCodeLang(k)}
                        disabled={!(ct[k] || ct[k+'.py3'] || ct[k+'.cc14o2'])}>
                        {LANG_LABELS[k] || k}
                      </Button>
                    ))}
                  </Space>
                  {codeTemplate ? (
                    <div className="code-block-wrapper">
                      <button className="copy-btn" onClick={() => {
                        navigator.clipboard.writeText(codeTemplate);
                        message.success('已复制');
                      }}>📋 复制</button>
                      <pre className="code-template-pre"><code>{codeTemplate}</code></pre>
                    </div>
                  ) : (
                    <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无此语言模板</div>
                  )}
                </div>
              )
            }
          ]} />
        </Card>
      </div>
    </div>
  );
}
