import { useEffect, useState } from 'react';
import { Doc } from '@blocksuite/store';
import { useEditor } from '../editor/context';

interface DocFolder {
  id: string;
  name: string;
  docs: Doc[];
  expanded: boolean;
}

const Sidebar = () => {
  const { collection, editor } = useEditor()!;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [folders, setFolders] = useState<DocFolder[]>([
    { id: 'recent', name: 'Recent', docs: [], expanded: true },
    { id: 'archived', name: 'Archived', docs: [], expanded: false },
  ]);

  useEffect(() => {
    if (!collection || !editor) return;
    const updateDocs = () => {
      const allDocs = [...collection.docs.values()].map(blocks => blocks.getDoc());
      setDocs(allDocs);
      
      // Update folders
      setFolders(prev => prev.map(folder => {
        if (folder.id === 'recent') {
          return { ...folder, docs: allDocs };
        }
        return folder;
      }));
    };
    updateDocs();

    const disposable = [
      collection.slots.docUpdated.on(updateDocs),
      editor.slots.docLinkClicked.on(updateDocs),
    ];

    return () => disposable.forEach(d => d.dispose());
  }, [collection, editor]);

  const handleNewDoc = () => {
    if (!collection) return;
    const newDoc = collection.createDoc({ id: `doc_${Date.now()}` });
    newDoc.load(() => {
      const pageBlockId = newDoc.addBlock('affine:page', {});
      // newDoc.addBlock('affine:surface', {}, pageBlockId); // Remove surface
      const noteId = newDoc.addBlock('affine:note', {}, pageBlockId);
      newDoc.addBlock('affine:paragraph', {}, noteId);
    });
    if (newDoc.meta) {
      newDoc.meta.title = 'Untitled Document';
    }
    if (editor) editor.doc = newDoc;
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        // Create new document from imported content
        if (!collection) return;
        const newDoc = collection.createDoc({ id: `doc_${Date.now()}` });
        newDoc.load(() => {
          const pageBlockId = newDoc.addBlock('affine:page', {});
          newDoc.addBlock('affine:surface', {}, pageBlockId);
          const noteId = newDoc.addBlock('affine:note', {}, pageBlockId);
          
          // Split content into paragraphs and create blocks
          const lines = content.split('\n');
          lines.forEach((line) => {
            if (line.trim()) {
              newDoc.addBlock('affine:paragraph', {}, noteId);
            }
          });
        });
        
        if (newDoc.meta) {
          newDoc.meta.title = file.name.replace(/\.[^/.]+$/, '');
        }
        
        if (editor) editor.doc = newDoc;
        
        // Update sidebar
        const allDocs = [...collection.docs.values()].map(blocks => blocks.getDoc());
        setDocs(allDocs);
        setFolders(prev => prev.map(folder => 
          folder.id === 'recent' ? { ...folder, docs: allDocs } : folder
        ));
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId ? { ...folder, expanded: !folder.expanded } : folder
    ));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="header">All Documents</div>
        <div className="sidebar-header-buttons">
          <button className="new-doc-btn" onClick={handleNewDoc} title="New Document">
            +
          </button>
          <button className="import-btn" onClick={handleImport} title="Import Document">
            ⬆️
          </button>
        </div>
      </div>
      
      <div className="doc-list">
        {folders.map(folder => (
          <div key={folder.id} className="folder">
            <div className="folder-header" onClick={() => toggleFolder(folder.id)}>
              <span className={`folder-icon ${folder.expanded ? 'expanded' : ''}`}>▶</span>
              <span className="folder-name">{folder.name}</span>
            </div>
            {folder.expanded && (
              <div className="folder-docs">
                {folder.docs.length === 0 ? (
                  <div className="empty-folder">No documents</div>
                ) : (
                  folder.docs.map(doc => (
                    <div
                      className={`doc-item ${editor?.doc === doc ? 'active' : ''}`}
                      key={doc.id}
                      onClick={() => {
                        if (editor) editor.doc = doc;
                        const allDocs = [...collection.docs.values()].map(blocks =>
                          blocks.getDoc()
                        );
                        setDocs(allDocs);
                      }}
                    >
                      <span className="doc-icon">📄</span>
                      {doc.meta?.title || 'Untitled'}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
