import { useState, useEffect } from 'react';

interface WelcomeBlockProps {
  onDismiss: () => void;
}

const WelcomeBlock = ({ onDismiss }: WelcomeBlockProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onDismiss, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setShow(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div className={`welcome-overlay ${show ? 'show' : ''}`}>
      <div className={`welcome-block ${show ? 'show' : ''}`}>
        <div className="welcome-glow"></div>
        <div className="welcome-content">
          <div className="welcome-icon">✨</div>
          <h1>Welcome to BlockSuite</h1>
          <p>A powerful block-based editor with AI capabilities</p>
          
          <div className="welcome-features">
            <div className="feature">
              <span className="feature-icon">📝</span>
              <div>
                <strong>Rich Editing</strong>
                <p>Type / for commands, select text for formatting</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🎨</span>
              <div>
                <strong>Edgeless Canvas</strong>
                <p>Switch to canvas mode for whiteboard drawing</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">✨</span>
              <div>
                <strong>AI Assistant</strong>
                <p>Select text and ask AI, or open the side panel</p>
              </div>
            </div>
          </div>

          <button className="welcome-start" onClick={handleDismiss}>
            🚀 Start Creating
          </button>
          
          <div className="welcome-hint">
            Click anywhere or press ESC to dismiss
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBlock;
