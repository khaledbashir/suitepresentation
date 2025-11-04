"use client";
import { useEffect, useRef, useState } from 'react';

export default function BlockSuiteEditorPage() {
  const [mode, setMode] = useState<'page' | 'edgeless'>('page');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // BlockSuite will be imported dynamically here
    console.log('BlockSuite editor mode:', mode);
    
    // TODO: Initialize BlockSuite editor
    // This will be isolated from the main app
  }, [mode]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Mode switcher */}
      <div className="p-4 border-b flex gap-4">
        <button
          onClick={() => setMode('page')}
          className={`px-4 py-2 rounded ${mode === 'page' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          📝 Page Editor
        </button>
        <button
          onClick={() => setMode('edgeless')}
          className={`px-4 py-2 rounded ${mode === 'edgeless' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          🎨 Canvas
        </button>
      </div>

      {/* Editor container */}
      <div ref={editorRef} className="flex-1 p-4">
        <div className="text-center text-gray-500 mt-20">
          BlockSuite {mode} editor will load here
          <br />
          <span className="text-sm">Isolated from main app - no build conflicts!</span>
        </div>
      </div>
    </div>
  );
}
