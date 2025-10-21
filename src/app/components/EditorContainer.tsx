import { useEffect, useRef, useState } from 'react';
import { useEditor } from '../editor/context';

const EditorContainer = () => {
  const { editor, collection } = useEditor()!;
  const [mountError, setMountError] = useState<string | null>(null);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorMountedRef = useRef(false);

  useEffect(() => {
    if (!editor || !editorContainerRef.current) return;
    
    // Only mount editor once
    if (editorMountedRef.current) return;
    
    try {
      // Clear container first
      editorContainerRef.current.innerHTML = '';
      
      // Append editor element to DOM with error boundary
      const appendEditorWithRetry = () => {
        try {
          editorContainerRef.current!.appendChild(editor);
          return true;
        } catch (error) {
          console.warn('Failed to append editor on first attempt:', error);
          // Try again after a short delay
          setTimeout(() => {
            try {
              editorContainerRef.current!.appendChild(editor);
              console.log('Successfully appended editor on retry');
            } catch (retryError) {
              console.error('Failed to append editor even after retry:', retryError);
              setMountError('Failed to initialize editor. Please refresh the page.');
            }
          }, 100);
          return false;
        }
      };

      const success = appendEditorWithRetry();
      if (!success) return;
      
      // Set std AFTER mounting to ensure it's available for widgets
      (editor as any).std = { awarenessStore: (collection as any).awareness };
      
      // Set theme attribute on the container AND editor
      editorContainerRef.current.setAttribute('data-theme', 'dark');
      editor.setAttribute('data-theme', 'dark');
      
      editorMountedRef.current = true;
      
      // Focus editor after brief delay to ensure rendering
      setTimeout(() => {
        try {
          editor.focus?.();
        } catch (focusError) {
          console.warn('Failed to focus editor:', focusError);
        }
      }, 200);
    } catch (error) {
      console.error('Failed to mount editor:', error);
      setMountError('Editor initialization failed. Please refresh the page.');
    }
  }, [editor]);

  if (mountError) {
    return (
      <div className="editor-container-error">
        <div className="error-content">
          <h3>⚠️ Editor Initialization Failed</h3>
          <p>{mountError}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="editor-container" 
      ref={editorContainerRef} 
      data-theme="dark"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default EditorContainer;
