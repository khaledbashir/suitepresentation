"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  FileSpreadsheet, 
  FileText, 
  Edit3, 
  LayoutGrid
} from "lucide-react";

export type EditorMode = "spreadsheet" | "page" | "edgeless";

interface EditorModeSwitchProps {
  className?: string;
  value: EditorMode;
  onChange: (mode: EditorMode) => void;
  disabled?: boolean;
}

export function EditorModeSwitch({ 
  className, 
  value, 
  onChange, 
  disabled = false 
}: EditorModeSwitchProps) {
  const [currentMode, setCurrentMode] = useState<EditorMode>(value);

  useEffect(() => {
    setCurrentMode(value);
  }, [value]);

  const handleModeChange = (mode: EditorMode) => {
    if (disabled) return;
    
    setCurrentMode(mode);
    onChange(mode);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent("editorModeChange", {
      detail: { mode }
    }));
    
    // Update data attribute for accessibility
    document.querySelector("[data-editor-mode-container]")?.setAttribute("data-editor-mode", mode);
  };

  const modes = [
    {
      id: "spreadsheet" as EditorMode,
      label: "Spreadsheet",
      icon: FileSpreadsheet,
      description: "Data tables and calculations"
    },
    {
      id: "page" as EditorMode,
      label: "Page",
      icon: FileText,
      description: "Rich text and documents"
    },
    {
      id: "edgeless" as EditorMode,
      label: "Edgeless",
      icon: LayoutGrid,
      description: "Canvas and visual editing"
    }
  ];

  return (
    <div 
      className={cn(
        "inline-flex rounded-lg border border-border bg-background p-1",
        className
      )}
      data-editor-mode-container
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        const isDisabled = disabled;
        
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => handleModeChange(mode.id)}
            disabled={isDisabled}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              "min-w-[120px] justify-center",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
            title={mode.description}
            aria-pressed={isActive}
            aria-label={`Switch to ${mode.label} editor`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Hook to get current editor mode
export function useEditorMode(): EditorMode {
  const [mode, setMode] = useState<EditorMode>("spreadsheet");

  useEffect(() => {
    const handleModeChange = (event: CustomEvent) => {
      setMode(event.detail.mode);
    };

    window.addEventListener("editorModeChange", handleModeChange as EventListener);
    
    // Check initial mode from data attribute
    const editorModeAttr = document.querySelector("[data-editor-mode-container]")?.getAttribute("data-editor-mode") as EditorMode;
    if (editorModeAttr && ["spreadsheet", "page", "edgeless"].includes(editorModeAttr)) {
      setMode(editorModeAttr);
    }

    return () => {
      window.removeEventListener("editorModeChange", handleModeChange as EventListener);
    };
  }, []);

  return mode;
}