import { useEditor } from '../editor/context';
import { useEffect, useState } from 'react';

const PreviewPane = () => {
  const { editor } = useEditor()!;
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!editor?.doc) return;

    // Extract content from BlockSuite doc
    const updatePreview = () => {
      try {
        const blocks = editor.doc.root?.children || [];
        let content = '';
        
        blocks.forEach((block: any) => {
          const text = block.text?.toString() || '';
          if (text) {
            content += `<p>${text}</p>`;
          }
        });

        setHtml(content || '<div class="preview-empty">Start typing in the editor to see preview...</div>');
      } catch (e) {
        setHtml('<div class="preview-error">Preview not available</div>');
      }
    };

    updatePreview();
    
    const disposable = editor.doc.slots.blockUpdated.on(updatePreview);
    return () => disposable.dispose();
  }, [editor]);

  return (
    <div className="preview-pane">
      <div className="preview-content" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default PreviewPane;
