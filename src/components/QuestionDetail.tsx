import { useEffect, useState } from 'react';
import { Card, Tag, Button, Radio, Space, Progress, message, Tabs } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartOutlined, HeartFilled, ArrowLeftOutlined } from '@ant-design/icons';
import type { TopLevel } from '../types/question';
import { parseAcceptRate, getDifficultyColor } from '../utils/parseAcceptRate';
import { useFavorites } from '../hooks/useFavorites';
import { useProgress } from '../hooks/useProgress';
import MarkdownRenderer from './MarkdownRenderer';

const DATA_URL = '/data.json';
const LANG_LABELS: Record<string, string> = { py: 'Python', java: 'Java', cc: 'C++', js: 'JavaScript', c: 'C' };
const LANG_KEYS = ['py', 'java', 'cc', 'js', 'c'];

export default function QuestionDetail() {
  const { pid } = useParams<{ pid: string }>();
  const nav = useNavigate();
  const [data, setData] = useState<TopLevel | null>(null);
  const [codeLang, setCodeLang] = useState('py');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getStatus, setStatus } = useProgress();
  const [tab, setTab] = useState('desc');

  useEffect(() => {
    fetch(DATA_URL).then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return <Card loading style={{ minHeight: 400 }} />;

  const q = data.题目列表.find(p => p.pid === pid);
  if (!q) return <Card><div style={{ textAlign: 'center', padding: 40, color: '#999' }}>题目不存在</div></Card>;

  const rate = parseAcceptRate(q.accept_rate || '');
  const tags = q.tags || q.topics || [];
  const fav = isFavorite(q.pid);
  const status = getStatus(q.pid);

  const ct = q.code_templates || {};
  const codeTemplate = ct[codeLang] || ct[codeLang + '.py3'] || ct[codeLang + '.cc14o2'] || '';

  return (
    <div>
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
            children: <MarkdownRenderer content={q.solution} />
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
                    <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 14, borderRadius: 8, overflowX: 'auto', fontSize: 13, lineHeight: 1.6 }}>
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
}
