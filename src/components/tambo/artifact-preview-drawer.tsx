"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useArtifactsStore } from "@/store/artifacts";
import { Copy, Download, Save, Plus, X } from "lucide-react";
import type { Artifact } from "@/types/artifact";
import { cn } from "@/lib/utils";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ArtifactPreviewDrawer(): JSX.Element | null {
  // CRITICAL: Subscribe to each piece of state individually to ensure proper reactivity
  const isPreviewOpen = useArtifactsStore((state) => state.isPreviewOpen);
  const activeArtifactId = useArtifactsStore((state) => state.activeArtifactId);
  const artifacts = useArtifactsStore((state) => state.artifacts);
  const closePreview = useArtifactsStore((state) => state.closePreview);
  
  const artifact: Artifact | undefined = activeArtifactId ? artifacts[activeArtifactId] : undefined;
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Track current editor mode
  const [currentEditorMode, setCurrentEditorMode] = useState<"spreadsheet" | "page" | "edgeless">("spreadsheet");

  // Debug: log state changes
  useEffect(() => {
    console.log("🎨 ArtifactPreviewDrawer render with state:", {
      isPreviewOpen,
      activeArtifactId,
      hasArtifact: !!artifact,
      artifactType: artifact?.type,
      currentEditorMode
    });
  }, [isPreviewOpen, activeArtifactId, artifact, currentEditorMode]);

  // Force re-check store state every second to catch any missed updates
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = useArtifactsStore.getState();
      if (currentState.isPreviewOpen !== isPreviewOpen) {
        console.log("⚠️ DETECTED STALE STATE! Store says:", currentState.isPreviewOpen, "but component has:", isPreviewOpen);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPreviewOpen]);

  // Action handlers
  const handleCopy = async () => {
    if (!artifact) return;
    
    let textToCopy = "";
    if (artifact.type === "code/html") {
      textToCopy = artifact.payload.html;
    } else if (artifact.type === "doc/markdown") {
      textToCopy = artifact.payload.markdown;
    } else if (artifact.type === "dataset/table") {
      textToCopy = JSON.stringify(artifact.payload, null, 2);
    }
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      console.log("✅ Artifact copied to clipboard");
    } catch (error) {
      console.error("Failed to copy artifact:", error);
    }
  };

  const handleDownload = () => {
    if (!artifact) return;
    
    let content = "";
    let filename = "";
    let mimeType = "";
    
    if (artifact.type === "code/html") {
      content = artifact.payload.html;
      filename = `${artifact.title || artifact.id}.html`;
      mimeType = "text/html";
    } else if (artifact.type === "doc/markdown") {
      content = artifact.payload.markdown;
      filename = `${artifact.title || artifact.id}.md`;
      mimeType = "text/markdown";
    } else if (artifact.type === "dataset/table") {
      content = JSON.stringify(artifact.payload, null, 2);
      filename = `${artifact.title || artifact.id}.json`;
      mimeType = "application/json";
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInsert = () => {
    if (!artifact) return;
    
    console.log(`Inserting artifact ${artifact.id} into ${currentEditorMode} editor`);
    
    // Trigger custom event to handle insertion
    const event = new CustomEvent("insertArtifact", {
      detail: {
        artifactId: artifact.id,
        targetSurface: currentEditorMode,
        mode: artifact.type === "doc/markdown" ? "as-markdown" : "as-text"
      }
    });
    window.dispatchEvent(event);
    
    closePreview();
  };

  const handleSave = () => {
    if (!artifact) return;
    
    console.log(`Saving artifact ${artifact.id} as document`);
    
    // Trigger custom event to handle saving
    const event = new CustomEvent("saveArtifact", {
      detail: {
        artifactId: artifact.id,
        as: "doc"
      }
    });
    window.dispatchEvent(event);
    
    closePreview();
  };

  // Minimal code view text based on type
  const codeText = useMemo(() => {
    if (!artifact) return "";
    if (artifact.type === "code/html") return artifact.payload.html;
    if (artifact.type === "doc/markdown") return artifact.payload.markdown;
    if (artifact.type === "dataset/table") return JSON.stringify(artifact.payload, null, 2);
    return "";
  }, [artifact]);

  useEffect(() => {
    if (!artifact) return;
    if (!isPreviewOpen) return;
    if (artifact.type !== "code/html") return; // Only HTML uses iframe for now

    const iframe = iframeRef.current;
    if (!iframe) return;

    const onReady = (evt: MessageEvent) => {
      try {
        if (evt.origin !== window.location.origin) return;
        if (evt.source !== iframe.contentWindow) return;
        if (evt.data && evt.data.type === "artifact:ready") {
          iframe.contentWindow?.postMessage(
            { type: "artifact:html", html: artifact.payload.html },
            window.location.origin,
          );
        }
      } catch {}
    };

    window.addEventListener("message", onReady);
    // In case the iframe is already loaded, still attempt a post after a tick
    const t = setTimeout(() => {
      try {
        iframe.contentWindow?.postMessage(
          { type: "artifact:html", html: artifact.payload.html },
          window.location.origin,
        );
      } catch {}
    }, 300);

    return () => {
      window.removeEventListener("message", onReady);
      clearTimeout(t);
    };
  }, [artifact, isPreviewOpen]);

  if (!isPreviewOpen) {
    console.log("❌ Drawer hidden: isPreviewOpen is false");
    return null;
  }

  if (!artifact) {
    console.log("❌ Drawer hidden: no artifact found for ID", activeArtifactId);
    return null;
  }

  console.log("✅ Drawer rendering for artifact:", artifact.id, artifact.type);

  return (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'auto' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => closePreview()}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[720px] bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {artifact?.title || "Artifact Preview"}
            </h2>
            <p className="text-xs text-neutral-500 mt-1">{artifact?.type}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              className="px-3 py-1.5 text-sm rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              onClick={() => setTab("code")}
            >
              Code
            </button>
            <button
              className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => closePreview()}
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="px-4 sm:px-6 py-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex gap-2 text-sm">
              <button
                className={classNames(
                  "px-2 py-1 rounded-md",
                  tab === "preview"
                    ? "bg-neutral-200 dark:bg-neutral-800"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                )}
                onClick={() => setTab("preview")}
              >
                Preview
              </button>
              <button
                className={classNames(
                  "px-2 py-1 rounded-md",
                  tab === "code"
                    ? "bg-neutral-200 dark:bg-neutral-800"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                )}
                onClick={() => setTab("code")}
              >
                Code
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            {tab === "preview" ? (
              <div className="h-full w-full">
                {artifact?.type === "code/html" ? (
                  <iframe
                    ref={iframeRef}
                    title="Artifact HTML Preview"
                    src="/artifact-container.html"
                    sandbox="allow-same-origin allow-scripts"
                    className="w-full h-full border-0"
                  />
                ) : artifact?.type === "doc/markdown" ? (
                  <div className="p-4">
                    <pre className="text-sm whitespace-pre-wrap break-words">{artifact.payload.markdown}</pre>
                  </div>
                ) : artifact?.type === "dataset/table" ? (
                  <div className="p-4">
                    <pre className="text-sm whitespace-pre-wrap break-words">{JSON.stringify(artifact.payload, null, 2)}</pre>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="p-4">
                <textarea
                  className="w-full h-[calc(100vh-220px)] text-sm font-mono border rounded-md p-3 bg-neutral-50 dark:bg-neutral-900"
                  readOnly
                  value={codeText}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
