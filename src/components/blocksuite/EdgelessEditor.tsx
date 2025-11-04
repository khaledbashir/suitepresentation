"use client";

import { useEffect, useRef, useState } from "react";

// Dynamically import BlockSuite to ensure client-side only loading
const loadBlockSuite = async () => {
  const { EdgelessEditor } = await import("@blocksuite/presets");
  const { AffineSchemas } = await import("@blocksuite/blocks");
  const { Workspace } = await import("@blocksuite/store");
  
  return { EdgelessEditor, AffineSchemas, Workspace };
};

interface EdgelessEditorProps {
  className?: string;
  onContentChange?: (content: any) => void;
}

export function EdgelessEditorWrapper({ className, onContentChange }: EdgelessEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initEditor = async () => {
      try {
        const { EdgelessEditor, AffineSchemas, Workspace } = await loadBlockSuite();
        
        if (!mounted || !containerRef.current) return;

        // Create a new workspace with Affine schemas
        const workspace = new Workspace({ 
          id: "edgeless-editor",
          isTemporary: true,
          schemas: AffineSchemas
        });
        
        // Create a new page
        const page = workspace.createPage("edgeless-1");
        
        // Initialize the editor
        const editor = new EdgelessEditor();
        editor.page = page;
        
        // Mount the editor
        if (containerRef.current) {
          containerRef.current.appendChild(editor);
          editorRef.current = editor;
        }

        // Set up content change listener
        if (onContentChange) {
          page.slots.blockUpdated.on(() => {
            const blocks = page.getBlocksByFlavour("affine:surface");
            const content = blocks.map(block => ({
              id: block.id,
              type: block.flavour,
              content: block.props
            }));
            onContentChange({ content, outline: page.getOutline() });
          });
        }

        if (mounted) {
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Failed to initialize BlockSuite EdgelessEditor:", error);
      }
    };

    initEditor();

    return () => {
      mounted = false;
      if (editorRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(editorRef.current);
        } catch (error) {
          // Element might already be removed
        }
      }
    };
  }, [onContentChange]);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading Edgeless Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}