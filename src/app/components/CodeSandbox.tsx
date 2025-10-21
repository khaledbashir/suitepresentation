import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

interface CodeSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

const CodeSandbox = ({ isOpen, onClose, initialCode = '' }: CodeSandboxProps) => {
  const [activeView, setActiveView] = useState<'code' | 'preview'>('preview');
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, sans-serif;
      background: #0a0a0a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e3e3e3;
    }
    .hero {
      text-align: center;
      padding: 40px;
    }
    h1 {
      font-size: 48px;
      margin: 0 0 20px;
      font-weight: 600;
      animation: fadeIn 0.8s ease;
    }
    p {
      font-size: 20px;
      opacity: 0.7;
      animation: fadeIn 1s ease 0.2s both;
    }
    button {
      margin-top: 30px;
      padding: 12px 32px;
      background: #e3e3e3;
      color: #0a0a0a;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      animation: fadeIn 1.2s ease 0.4s both;
      transition: transform 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Welcome</h1>
    <p>AI-generated interface</p>
    <button onclick="alert('Hello!')">Get Started</button>
  </div>
</body>
</html>`);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  return (
    <div className={`code-sandbox-panel ${isOpen ? 'open' : ''}`}>
      <div className="sandbox-panel-header">
        <div className="sandbox-panel-title">
          <span>Sandbox</span>
        </div>
        <div className="sandbox-tabs">
          <button 
            className={`sandbox-tab ${activeView === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveView('preview')}
          >
            Preview
          </button>
          <button 
            className={`sandbox-tab ${activeView === 'code' ? 'active' : ''}`}
            onClick={() => setActiveView('code')}
          >
            Code
          </button>
        </div>
        <button className="sandbox-close" onClick={onClose}>×</button>
      </div>
      
      <div className="sandbox-content">
        {activeView === 'code' ? (
          <div className="sandbox-editor-full">
            <div className="sandbox-actions">
              <button 
                className="sandbox-action-btn"
                onClick={() => setCode('')}
              >
                Clear
              </button>
              <button 
                className="sandbox-action-btn"
                onClick={() => {
                  const blob = new Blob([code], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'index.html';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export
              </button>
            </div>
            <CodeMirror
              value={code}
              height="calc(100% - 40px)"
              theme={vscodeDark}
              extensions={[html()]}
              onChange={(value) => setCode(value)}
              className="sandbox-codemirror"
            />
          </div>
        ) : (
          <div className="sandbox-preview-full">
            <iframe
              className="sandbox-iframe"
              srcDoc={code}
              title="preview"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeSandbox;
