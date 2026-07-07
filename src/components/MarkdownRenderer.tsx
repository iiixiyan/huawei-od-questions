import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = String(children || '').replace(/\n$/, '');
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="code-block-wrapper">
      <button className="copy-btn" onClick={handleCopy}>{copied ? '✅ 已复制' : '📋 复制'}</button>
      <pre className={className}><code>{code}</code></pre>
    </div>
  );
}

export default function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return <p style={{ color: '#999' }}>暂无内容</p>;
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            if (match) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return <code className={className} {...props}>{children}</code>;
          },
          pre({ children }) {
            return <>{children}</>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
