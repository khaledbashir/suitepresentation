import { useEditor } from '../editor/context';
import { useState, useRef, useEffect } from 'react';

interface Version {
  id: string;
  timestamp: number;
  content: string;
  comment?: string;
  author?: string;
}

const EditorToolbar = () => {
  const { editor, collection } = useEditor()!;
  const [versions, setVersions] = useState<Version[]>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportDocument = async () => {
    if (!editor?.doc) return;
    
    const blocks = editor.doc.root?.children || [];
    let docContent = '<?xml version="1.0" encoding="UTF-8"?>';
    docContent += '<document>';
    
    blocks.forEach((block: any) => {
      const text = block.text?.toString() || '';
      if (text) {
        docContent += `<paragraph>${escapeXml(text)}</paragraph>`;
      }
    });
    
    docContent += '</document>';
    
    // Create a blob in Office Open XML format (simplified)
    const blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportMarkdown = async () => {
    if (!editor?.doc) return;
    
    const blocks = editor.doc.root?.children || [];
    let markdown = '';
    
    blocks.forEach((block: any) => {
      const text = block.text?.toString() || '';
      if (text) {
        markdown += `${text}\n\n`;
      }
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportHTML = async () => {
    if (!editor?.doc) return;
    
    const blocks = editor.doc.root?.children || [];
    let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body { font-family: system-ui, sans-serif; line-height: 1.6; }</style></head><body>';
    
    blocks.forEach((block: any) => {
      const text = block.text?.toString() || '';
      if (text) {
        html += `<p>${escapeXml(text)}</p>`;
      }
    });
    
    html += '</body></html>';
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportPDF = async () => {
    if (!editor?.doc) return;
    
    const blocks = editor.doc.root?.children || [];
    let pdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    pdfContent += '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
    
    let text = '';
    blocks.forEach((block: any) => {
      const blockText = block.text?.toString() || '';
      if (blockText) {
        text += blockText + '\n';
      }
    });
    
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleComment = () => {
    if (!commentText.trim()) {
      setShowCommentInput(false);
      return;
    }

    const newVersion: Version = {
      id: `v-${Date.now()}`,
      timestamp: Date.now(),
      content: 'snapshot', // Store version snapshot identifier
      comment: commentText,
      author: 'Current User',
    };

    setVersions([...versions, newVersion]);
    setCommentText('');
    setShowCommentInput(false);
  };

  const handleCopy = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        navigator.clipboard.writeText(selection.toString()).then(() => {
          // Visual feedback
          const btn = document.activeElement as HTMLElement;
          if (btn) {
            btn.textContent = '✓ Copied!';
            setTimeout(() => {
              btn.textContent = '📋 Copy';
            }, 2000);
          }
        });
      }
    }
  };

  const escapeXml = (str: string) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return str.replace(/[&<>"']/g, (c) => map[c]);
  };

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        {/* Export Dropdown Menu */}
        <div className="export-dropdown" ref={exportMenuRef}>
          <button
            className="toolbar-btn export-menu-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export document in various formats"
          >
            � Export {showExportMenu ? '▲' : '▼'}
          </button>
          {showExportMenu && (
            <div className="export-menu">
              <button className="export-menu-item" onClick={handleExportDocument}>
                📄 Document (.docx)
              </button>
              <button className="export-menu-item" onClick={handleExportMarkdown}>
                📝 Markdown (.md)
              </button>
              <button className="export-menu-item" onClick={handleExportHTML}>
                🌐 HTML (.html)
              </button>
              <button className="export-menu-item" onClick={handleExportPDF}>
                📕 PDF (.pdf)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-group">
        <button 
          className="toolbar-btn" 
          onClick={handleCopy} 
          title="Copy selected text"
        >
          📋 Copy
        </button>
        <button 
          className="toolbar-btn" 
          onClick={() => setShowCommentInput(!showCommentInput)} 
          title="Add comment for versioning"
        >
          💬 Comment
        </button>
        <button 
          className="toolbar-btn" 
          onClick={() => setShowVersions(!showVersions)} 
          title={`View versions (${versions.length})`}
        >
          ⏱️ Versions ({versions.length})
        </button>
      </div>

      {showCommentInput && (
        <div className="comment-input-container">
          <input
            type="text"
            className="comment-input"
            placeholder="Add a version comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            autoFocus
          />
          <button className="comment-confirm-btn" onClick={handleComment}>
            Save
          </button>
          <button 
            className="comment-cancel-btn" 
            onClick={() => setShowCommentInput(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {showVersions && versions.length > 0 && (
        <div className="versions-list">
          <div className="versions-header">Version History</div>
          {versions.map((version) => (
            <div key={version.id} className="version-item">
              <div className="version-time">
                {new Date(version.timestamp).toLocaleString()}
              </div>
              {version.comment && (
                <div className="version-comment">💭 {version.comment}</div>
              )}
              {version.author && (
                <div className="version-author">by {version.author}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditorToolbar;
