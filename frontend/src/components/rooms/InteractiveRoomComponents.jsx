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

    default:
      return null;
  }
});
