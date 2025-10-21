import { useEffect, useState } from 'react';

interface FloatingToolbarProps {
  onAskAI: (text: string, action?: string) => void;
}

const FloatingToolbar = ({ onAskAI }: FloatingToolbarProps) => {
  const [show, setShow] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        const text = selection.toString();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(text);
        setPosition({
          top: rect.top - 50,
          left: rect.left + (rect.width / 2) - 150,
        });
        setShow(true);
        setShowAIMenu(false);
      } else {
        setShow(false);
        setShowAIMenu(false);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('mouseup', handleSelection);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);

  const handleAIAction = (action: string) => {
    onAskAI(selectedText, action);
    setShow(false);
    setShowAIMenu(false);
  };

  if (!show) return null;

  return (
    <>
      <div
        className="floating-toolbar"
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 1000,
        }}
      >
        <button onClick={() => setShowAIMenu(!showAIMenu)}>✨ Ask AI</button>
      </div>

      {showAIMenu && (
        <div
          className="ai-actions-menu"
          style={{
            position: 'fixed',
            top: `${position.top + 50}px`,
            left: `${position.left}px`,
            zIndex: 1001,
          }}
        >
          <div className="ai-menu-section">
            <div className="ai-menu-label">GENERATE FROM TEXT</div>
            <button className="ai-menu-item" onClick={() => handleAIAction('summarize')}>
              <span className="ai-menu-icon">📝</span>
              <span>Summarize</span>
            </button>
            <button className="ai-menu-item" onClick={() => handleAIAction('generate-headings')}>
              <span className="ai-menu-icon">📋</span>
              <span>Generate headings</span>
              <span className="ai-menu-badge">Beta</span>
            </button>
            <button className="ai-menu-item" onClick={() => handleAIAction('generate-outline')}>
              <span className="ai-menu-icon">📄</span>
              <span>Generate outline</span>
            </button>
            <button className="ai-menu-item" onClick={() => handleAIAction('generate-image')}>
              <span className="ai-menu-icon">🖼️</span>
              <span>Generate an image</span>
            </button>
            <button className="ai-menu-item" onClick={() => handleAIAction('brainstorm')}>
              <span className="ai-menu-icon">💡</span>
              <span>Brainstorm ideas with mind map</span>
            </button>
            <button className="ai-menu-item" onClick={() => handleAIAction('presentation')}>
              <span className="ai-menu-icon">📊</span>
              <span>Generate presentation</span>
              <span className="ai-menu-badge">Beta</span>
            </button>
            <button className="ai-menu-item" onClick={() => handleAIAction('make-it-real')}>
              <span className="ai-menu-icon">🪄</span>
              <span>Make it real</span>
              <span className="ai-menu-badge">Beta</span>
            </button>
            <button className="ai-menu-item" onClick={() => handleAIAction('find-actions')}>
              <span className="ai-menu-icon">🔍</span>
              <span>Find actions</span>
              <span className="ai-menu-badge">Beta</span>
            </button>
          </div>
          <div className="ai-menu-section">
            <div className="ai-menu-label">DRAFT FROM TEXT</div>
            <button className="ai-menu-item" onClick={() => handleAIAction('draft')}>
              <span className="ai-menu-icon">✍️</span>
              <span>Continue writing</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingToolbar;
