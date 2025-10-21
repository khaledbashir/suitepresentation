import { AffineEditorContainer } from '@blocksuite/presets';
import { Doc, Schema } from '@blocksuite/store';
import { DocCollection } from '@blocksuite/store';
import { AffineSchemas } from '@blocksuite/blocks';
import '@blocksuite/presets/themes/affine.css';

export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
}

export function initEditor() {
  const schema = new Schema().register(AffineSchemas);
  const collection = new DocCollection({ schema });
  collection.meta.initialize();

  const doc = collection.createDoc({ id: 'page1' });

  // Initialize blocks synchronously BEFORE assigning doc to editor
  const pageBlockId = doc.addBlock('affine:page', {});
  // doc.addBlock('affine:surface', {}, pageBlockId); // Remove surface for now
  const noteId = doc.addBlock('affine:note', {}, pageBlockId);
  doc.addBlock('affine:paragraph', {}, noteId);

  const editor = new AffineEditorContainer();

  // Configure editor BEFORE mounting
  editor.mode = 'page';
  editor.doc = doc;
  editor.setAttribute('data-theme', 'dark');

  editor.slots.docLinkClicked.on(({ docId }: { docId: string }) => {
    const target = <Doc>collection.getDoc(docId);
    if (target) {
      editor.doc = target;
    }
  });

  return { editor, collection };
}
