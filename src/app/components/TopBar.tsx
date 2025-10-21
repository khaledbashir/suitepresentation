import { useState } from 'react';
import { useEditor } from '../editor/context';

interface TopBarProps {
  onToggleSidebar: () => void;
  onToggleAI: () => void;
  onToggleSandbox: () => void;
  onTogglePresentation: () => void;
  sidebarOpen: boolean;
  sandboxOpen: boolean;
  presentationOpen: boolean;
}

const TopBar = ({ onToggleSidebar, onToggleAI, onToggleSandbox, onTogglePresentation, sidebarOpen, sandboxOpen, presentationOpen }: TopBarProps) => {
  const { editor } = useEditor()!;
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const switchMode = () => {
    if (editor) {
      const currentMode = editor.mode;
      editor.mode = currentMode === 'page' ? 'edgeless' : 'page';
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (editor) {
      editor.setAttribute('data-theme', newTheme);
    }
  };

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
          <button className="sidebar-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
            {sidebarOpen ? '◧' : '☰'}
          </button>
          <button onClick={switchMode}>
            {editor?.mode === 'page' ? 'Page' : 'Canvas'}
          </button>
          <button onClick={toggleTheme}>
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
        </div>
        <div className="top-bar-right">
          <button onClick={onTogglePresentation} className={presentationOpen ? 'active' : ''}>
            Slide Builder
          </button>
          <button onClick={onToggleSandbox} className={sandboxOpen ? 'active' : ''}>
            Sandbox
          </button>
          <button onClick={onToggleAI}>
            AI Assistant
          </button>
        </div>
      </div>
      
      {!sidebarOpen && (
        <button 
          className="sidebar-toggle-collapsed" 
          onClick={onToggleSidebar}
          title="Open sidebar"
        >
          ☰
        </button>
      )}
    </>
  );
};

export default TopBar;
