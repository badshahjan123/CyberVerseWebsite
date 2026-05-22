import React, { useState, memo } from "react";
import { 
  CheckCircle, X, HelpCircle, Sparkles, Zap, Copy, 
  Terminal, Bug, AlertTriangle, Search, ShieldCheck, Crosshair, Globe,
  ShieldAlert, Unlock, Award, Check
} from "lucide-react";

/* ── Knowledge Check Question ── */
export const KnowledgeCheck = memo(({ 
  question, 
  index, 
  status, 
  answer, 
  showHint, 
  onAnswerChange, 
  onCheck, 
  onToggleHint 
}) => {
  return (
    <div className={`wpr-question ${status === 'correct' ? 'wpr-question--correct' : status === 'incorrect' ? 'wpr-question--incorrect' : ''}`}>
      <div className="wpr-q-header">
        <span className="wpr-q-num">Q{index + 1}</span>
        <p className="wpr-q-text">{question.text}</p>
      </div>
      <div className="wpr-q-input-row">
        <input 
          type="text" 
          className="wpr-q-input" 
          placeholder="Type your answer..." 
          value={answer || ''} 
          onChange={e => onAnswerChange(question.id, e.target.value)}
          onKeyPress={e => e.key === 'Enter' && onCheck(question.id, question.acceptableAnswers)} 
          disabled={status === 'correct'} 
        />
        <button 
          onClick={() => onCheck(question.id, question.acceptableAnswers)} 
          disabled={!answer || status === 'correct'} 
          className="wpr-q-submit"
        >
          {status === 'correct' ? <CheckCircle size={16} /> : 'Check'}
        </button>
      </div>

      {status === 'correct' && (
        <div className="wpr-q-feedback wpr-q-feedback--correct">
          <CheckCircle size={14} />
          <span>Correct! Well done.</span>
        </div>
      )}
      {status === 'incorrect' && (
        <div className="wpr-q-feedback wpr-q-feedback--incorrect">
          <X size={14} />
          <span>Incorrect — Try again!</span>
        </div>
      )}

      <div className="wpr-q-helpers">
        <button onClick={() => onToggleHint(question.id)} className="wpr-hint-btn">
          <HelpCircle size={14} />
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </button>
      </div>

      {showHint && (
        <div className="wpr-hint-box">
          <Sparkles size={14} />
          <span>{question.hint}</span>
        </div>
      )}
    </div>
  );
});

/* ── Content Block Renderer ── */
export const ContentBlock = memo(({ block, index, animations = {} }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt.replace(/^\$ /gm, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  switch (block.type) {
    case 'text':
      const text = block.value || block.text;
      return <p key={index} className="wpr-text" dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code>$1</code>') }} />;
    
    case 'image':
      return (
        <div key={index} className="wpr-image-block" style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
          <img 
            src={block.src} 
            alt={block.alt || 'Content Image'} 
            className="wpr-content-img" 
            style={{ maxWidth: block.maxWidth || '500px', width: '100%', height: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }} 
          />
        </div>
      );

    case 'heading':
      return <h3 key={index} className="wpr-heading">{block.value || block.text}</h3>;
    
    case 'list':
      return (
        <ul key={index} className="wpr-list">
          {block.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          ))}
        </ul>
      );
    
    case 'terminal':
      const terminalCode = block.code || (Array.isArray(block.content) ? block.content.join('\n') : block.content);
      const terminalLang = block.language || block.lang;
      return (
        <div key={index} className="wpr-terminal">
          <div className="wpr-terminal-head">
            <div className="wpr-terminal-dots"><span style={{ backgroundColor: '#FF5F56' }} /><span style={{ backgroundColor: '#FFBD2E' }} /><span style={{ backgroundColor: '#27C93F' }} /></div>
            <span className="wpr-terminal-lang">{terminalLang}</span>
            <button onClick={() => handleCopy(terminalCode)} className="wpr-copy-btn">{copied ? <Check size={13} /> : <Copy size={13} />}</button>
          </div>
          <pre className="wpr-terminal-body">
            {terminalCode.split('\n').map((line, i) => (
              <div key={i} className="wpr-terminal-line">
                {(line.startsWith('$') || (!line.startsWith('#') && !line.startsWith('//') && !line.includes(':') && !line.startsWith('{') && !line.startsWith(' ') && line.trim().length > 0)) && <span className="wpr-prompt">$</span>}
                <span className={line.startsWith('#') || line.startsWith('//') ? 'wpr-comment' : 'wpr-cmd'}>{line.startsWith('$ ') ? line.slice(2) : line}</span>
              </div>
            ))}
          </pre>
        </div>
      );

    case 'flow':
        return (
          <div key={index} className="wpr-flow-block">
            {animations.requestFlow || <div>Animation placeholder</div>}
            <span className="wpr-flow-caption">{block.label}</span>
          </div>
        );

    case 'callout':
        return (
          <div key={index} className={`wpr-callout wpr-callout--${block.variant}`}>
            <div className="wpr-callout-header">
              {block.variant === 'warning' ? <AlertTriangle size={16} /> : block.variant === 'info' ? <HelpCircle size={16} /> : <Sparkles size={16} />}
              <span>{block.title}</span>
            </div>
            <p>{block.text}</p>
          </div>
        );

    case 'comparison':
        return (
          <div key={index} className="wpr-comparison">
            {[block.left, block.right].map((side, i) => (
              <div key={i} className="wpr-comparison-side" style={{ '--side-color': side.color }}>
                <h4 className="wpr-comparison-title">{i === 0 ? <Search size={16} /> : <Crosshair size={16} />}{side.title}</h4>
                <ul className="wpr-comparison-list">{side.items.map((item, j) => (<li key={j}>{item}</li>))}</ul>
              </div>
            ))}
          </div>
        );

    case 'tree':
        return (
          <div key={index} className="wpr-subdomain-tree">
            <div className="wpr-tree-root"><Globe size={16} /><span>{block.root}</span></div>
            <div className="wpr-tree-children">
              {block.children.map((child, i) => (
                <div key={i} className={`wpr-tree-child wpr-tree--${child.status}`}>
                  <span className="wpr-tree-line" /><span className="wpr-tree-dot" />
                  <span className="wpr-tree-name">{child.name}</span><span className="wpr-tree-status">{child.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        );

    case 'vulnCards':
        return (
          <div key={index} className="wpr-vuln-grid">
            {block.vulns.map((v, i) => (
              <div key={i} className="wpr-vuln-card" style={{ '--vuln-color': v.color }}>
                <div className="wpr-vuln-header"><Bug size={16} /><span className="wpr-vuln-severity">{v.severity}</span></div>
                <h4 className="wpr-vuln-name">{v.name}</h4><p className="wpr-vuln-desc">{v.description}</p>
                <div className="wpr-vuln-payload"><span className="wpr-payload-label">Payload</span><code>{v.payload}</code></div>
                <div className="wpr-vuln-impact"><AlertTriangle size={12} /><span>{v.impact}</span></div>
              </div>
            ))}
          </div>
        );

    case 'codeComparison':
        return (
          <div key={index} className="wpr-code-compare">
            <div className="wpr-code-side wpr-code-side--vuln"><div className="wpr-code-label">{block.vulnerable.label}</div><ContentBlock block={{type:'terminal', code:block.vulnerable.code, language:block.vulnerable.language}} /></div>
            <div className="wpr-code-side wpr-code-side--safe"><div className="wpr-code-label">{block.secure.label}</div><ContentBlock block={{type:'terminal', code:block.secure.code, language:block.secure.language}} /></div>
          </div>
        );

    case 'exploitSim':
        return (
          <div key={index} className="wpr-exploit-sim">
            {block.steps.map((s, i) => (
              <div key={i} className={`wpr-sim-step wpr-sim--${s.status}`}><div className="wpr-sim-label"><span className="wpr-sim-num">{i + 1}</span>{s.label}</div><code className="wpr-sim-code">{s.code}</code></div>
            ))}
          </div>
        );

    case 'defenseLayer':
        return (
          <div key={index} className="wpr-defense-layers">
            {block.layers.map((layer, i) => (
              <div key={i} className="wpr-layer" style={{ '--layer-color': layer.color }}><div className="wpr-layer-icon"><ShieldCheck size={18} /></div><div className="wpr-layer-info"><h4>{layer.name}</h4><p>{layer.desc}</p></div><div className="wpr-layer-connector" /></div>
            ))}
          </div>
        );

    case 'row':
      return (
        <div key={index} className="wpr-row" style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
          <div className="wpr-row-left" style={{ flex: '1 1 300px', minWidth: '280px' }}>
            <ContentBlock block={block.left} index={0} animations={animations} />
          </div>
          <div className="wpr-row-right" style={{ flex: '1 1 200px', display: 'flex', justifyContent: 'center', minWidth: '200px' }}>
            <ContentBlock block={block.right} index={1} animations={animations} />
          </div>
        </div>
      );

    case 'table':
      return (
        <div key={index} className="wpr-table-container" style={{ overflowX: 'auto', margin: '24px 0', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <table className="wpr-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', background: '#0b0f19' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {block.headers.map((h, i) => (
                  <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#00F5FF', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '12px 16px', color: '#cbd5e1', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
});
