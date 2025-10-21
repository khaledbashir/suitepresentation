import { useState, useEffect } from 'react';
import { EditorProvider } from './components/EditorProvider';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import EditorContainer from './components/EditorContainer';
import EditorToolbar from './components/EditorToolbar';
import FloatingToolbar from './components/FloatingToolbar';
import AIPanel from './components/AIPanel';
import CodeSandbox from './components/CodeSandbox';
import SlideBuilder from './components/SlideBuilder';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [slideBuilderOpen, setSlideBuilderOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sandboxOpen) setSandboxOpen(false);
        if (slideBuilderOpen) setSlideBuilderOpen(false);
        if (aiOpen) setAiOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sandboxOpen, slideBuilderOpen, aiOpen]);

  const handleAIGenerateCode = (code: string) => {
    setGeneratedCode(code);
    setSandboxOpen(true);
  };

  const handleAIAction = (text: string, action?: string) => {
    setSelectedText(`${action ? `[${action}] ` : ''}${text}`);
    
    // Close all panels first
    setSandboxOpen(false);
    setSlideBuilderOpen(false);
    setAiOpen(false);
    
    // Special handling for slide builder action
    if (action === 'presentation' || action === 'make-it-real' || action === 'slides') {
      setSlideBuilderOpen(true);
    } else {
      setAiOpen(true);
    }
  };

  return (
    <EditorProvider>
      <div className="app">
        <ErrorBoundary>
          <div className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
            <Sidebar />
          </div>
        </ErrorBoundary>
        
        <div className="main-content">
          <ErrorBoundary>
            <TopBar 
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onToggleAI={() => {
                setAiOpen(!aiOpen);
                if (!aiOpen) {
                  setSandboxOpen(false);
                  setSlideBuilderOpen(false);
                }
              }}
              onToggleSandbox={() => {
                setSandboxOpen(!sandboxOpen);
                if (!sandboxOpen) {
                  setAiOpen(false);
                  setSlideBuilderOpen(false);
                }
              }}
              onTogglePresentation={() => {
                setSlideBuilderOpen(!slideBuilderOpen);
                if (!slideBuilderOpen) {
                  setAiOpen(false);
                  setSandboxOpen(false);
                }
              }}
              sidebarOpen={sidebarOpen}
              sandboxOpen={sandboxOpen}
              presentationOpen={slideBuilderOpen}
            />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <EditorToolbar />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <EditorContainer />
          </ErrorBoundary>
        </div>
        
        <ErrorBoundary>
          <FloatingToolbar 
            onAskAI={handleAIAction}
          />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <AIPanel 
            isOpen={aiOpen} 
            onClose={() => setAiOpen(false)}
            selectedText={selectedText}
            onGenerateCode={handleAIGenerateCode}
          />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <CodeSandbox 
            isOpen={sandboxOpen}
            onClose={() => setSandboxOpen(false)}
            initialCode={generatedCode}
          />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <SlideBuilder
            isOpen={slideBuilderOpen}
            onClose={() => setSlideBuilderOpen(false)}
            selectedText={selectedText.replace('[presentation] ', '').replace('[make-it-real] ', '').replace('[slides] ', '')}
          />
        </ErrorBoundary>
      </div>
    </EditorProvider>
  );
}

export default App;
