"use client";
import { useState } from "react";

interface BlockSuiteIframeProps {
  mode?: 'page' | 'edgeless';
  className?: string;
}

export function BlockSuiteIframe({ mode = 'page', className = '' }: BlockSuiteIframeProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-gray-500">Loading BlockSuite editor...</div>
        </div>
      )}
      <iframe
        src={`http://localhost:3004?mode=${mode}`}
        className="w-full h-full border-0"
        onLoad={() => setLoaded(true)}
        title="BlockSuite Editor"
      />
    </div>
  );
}
