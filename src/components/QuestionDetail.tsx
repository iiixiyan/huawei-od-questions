import { useEffect, useState, useMemo } from 'react';
import { Card, Tag, Button, Radio, Space, Progress, message, Tabs, Input, Select } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartOutlined, HeartFilled, ArrowLeftOutlined } from '@ant-design/icons';
import type { Question } from '../types/question';
import { parseAcceptRate, getDifficultyColor, getAllTags } from '../utils/parseAcceptRate';
import { useFavorites } from '../hooks/useFavorites';
import { useProgress } from '../hooks/useProgress';
import MarkdownRenderer from './MarkdownRenderer';

const BASE = import.meta.env.BASE_URL;
const LANG_LABELS: Record<string, string> = { py: 'Python', java: 'Java', cc: 'C++', js: 'JavaScript', c: 'C' };
const LANG_KEYS = ['py', 'java', 'cc', 'js', 'c'];

const statusColors: Record<string, string> = {
  '3': '#52c41a', '4': '#73d13d', '5': '#faad14', '6': '#ff4d4f', '7': '#722ed1', '8': '#722ed1'
};

export default function QuestionDetail() {
  const { pid } = useParams<{ pid: string }>();
  const nav = useNavigate();
  const [q, setQ] = useState<Question | null>(null);
  const [codeLang, setCodeLang] = useState('py');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getStatus, setStatus } = useProgress();
  const [tab, setTab] = useState('desc');

  // Sidebar state
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarTag, setSidebarTag] = useState<string | null>(null);

  // Load question data
  useEffect(() => {
    if (!pid) return;
    fetch(BASE + 'questions/' + pid + '.json').then(r => {
      if (!r.ok) throw new Error('Not found');
      return r.json();
    }).then(setQ).catch(() => setQ(null));
  }, [pid]);

  // Load sidebar list
  useEffect(() => {
    fetch(BASE + 'index.json').then(r => r.json()).then(data => {
      const items = data.题目列表 || [];
      setAllQuestions(items);
      setAllTags(getAllTags(items));
    }).catch(() => {});
  }, []);

  // Filtered sidebar
  const filteredSidebar = useMemo(() => {
    let list = [...allQuestions];
    if (sidebarSearch) {
      const qs = sidebarSearch.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(qs) || p.pid.toLowerCase().includes(qs));
    }
    if (sidebarTag) {
      list = list.filter(p => (p.tags || p.topics || []).includes(sidebarTag));
    }
    return list;
  }, [allQuestions, sidebarSearch, sidebarTag]);

  if (!q) return <Card loading style={{ minHeight: 400 }} />;

  const rate = parseAcceptRate(q.accept_rate || '');
  const tags = q.tags || q.topics || [];
  const fav = isFavorite(q.pid);
  const status = getStatus(q.pid);

  const ct = q.code_templates || {};
  const codeTemplate = ct[codeLang] || ct[codeLang + '.py3'] || ct[codeLang + '.cc14o2'] || '';

  const renderingContent = (
    <div style={{ flex: 1, minWidth: 0 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => nav('/questions')}
        style={{ padding: 0, marginBottom: 12 }}>返回列表</Button>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{q.title} <span style={{ fontSize: 13, color: '#aaa', fontWeight: 400 }}>[{q.pid}]</span></div>
            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {tags.map(t => <Tag key={t} color="blue">{t}</Tag>)}
              <Tag color={getDifficultyColor(q.difficulty)}>L{q.difficulty}</Tag>
              <span style={{ fontSize: 12, color: '#999' }}>📅 {q.date}</span>
              {q.has_signature && <Tag color="success">✅ 含函数签名</Tag>}
            </div>
          </div>
          <Space direction="vertical" align="end" size={4}>
            <Button type={fav ? 'primary' : 'default'} danger={fav}
              icon={fav ? <HeartFilled /> : <HeartOutlined />}
              onClick={() => { toggleFavorite(q.pid); message.info(fav ? '已取消收藏' : '已收藏'); }}>
              {fav ? '已收藏' : '收藏'}
            </Button>
            <Progress type="circle" size={50}
              percent={rate.percentage}
              strokeColor={rate.percentage > 60 ? '#52c41a' : rate.percentage > 30 ? '#faad14' : '#ff4d4f'}
              format={() => rate.percentage + '%'} />
            <div style={{ fontSize: 11, color: '#999' }}>通过率 {q.accept_rate}</div>
          </Space>
        </div>

        <div style={{ marginTop: 12 }}>
          <Radio.Group value={status} onChange={e => setStatus(q.pid, e.target.value)} size="small">
            <Radio.Button value="undone">📋 未开始</Radio.Button>
            <Radio.Button value="doing">✏️ 进行中</Radio.Button>
            <Radio.Button value="done">✅ 已完成</Radio.Button>
          </Radio.Group>
        </div>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Tabs activeKey={tab} onChange={setTab} items={[
          {
            key: 'desc',
            label: '📄 题目描述',
            children: <MarkdownRenderer content={q.description_md} />
          },
          {
            key: 'solution',
            label: '📖 题解',
            children: <MarkdownRenderer content={(q.solution || '').replace(/^#code-switcher\s*$/gm, '').replace(/#hot100-card\s*\{[\s\S]*?\}/g, '')} />
          },
          {
            key: 'template',
            label: '💻 代码模板',
            children: (
              <div>
                <Space style={{ marginBottom: 12 }}>
                  {LANG_KEYS.map(k => (
                    <Button key={k} type={codeLang === k ? 'primary' : 'default'}
                      size="small" onClick={() => setCodeLang(k)}
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
                    <pre className="code-template-pre">
                      <code>{codeTemplate}</code>
                    </pre>
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
  );

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* Left sidebar: question list */}
      <Card size="small" style={{ width: 300, flexShrink: 0, position: 'sticky', top: 16, maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}
        title={<span style={{ fontSize: 14 }}>📋 题目列表 <span style={{ color: '#999', fontWeight: 400 }}>({allQuestions.length})</span></span>}>
        <div style={{ marginBottom: 8 }}>
          <Input.Search placeholder="搜索题目名/PID" size="small" value={sidebarSearch}
            onChange={e => setSidebarSearch(e.target.value)} allowClear />
        </div>
        <div style={{ marginBottom: 8 }}>
          <Select placeholder="分类筛选" size="small" allowClear style={{ width: '100%' }}
            value={sidebarTag} onChange={setSidebarTag}>
            {allTags.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
          </Select>
        </div>
        <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>
          共 {filteredSidebar.length} 题
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredSidebar.map(item => {
            const isActive = item.pid === pid;
            const itemTags = item.tags || item.topics || [];
            return (
              <div key={item.pid} onClick={() => nav('/question/' + item.pid)}
                style={{
                  padding: '6px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12,
                  background: isActive ? '#e6f4ff' : 'transparent',
                  borderLeft: isActive ? '3px solid #1677ff' : '3px solid transparent',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ fontWeight: isActive ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 2 }}>
                  <span style={{ color: '#999', fontSize: 10 }}>{item.pid}</span>
                  <Tag color={statusColors[String(item.difficulty)] || 'default'} style={{ fontSize: 9, lineHeight: '14px', padding: '0 3px', margin: 0 }}>
                    L{item.difficulty}
                  </Tag>
                  {itemTags.slice(0, 1).map((t: string) => (
                    <span key={t} style={{ color: '#bbb', fontSize: 9 }}>{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Right: question detail */}
      {renderingContent}
    </div>
  );
}
