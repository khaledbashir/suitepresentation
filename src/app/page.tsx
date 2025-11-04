"use client";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import SpreadsheetTabs from "@/components/ui/spreadsheet-tabs";
import { InteractableTabs } from "@/components/ui/interactable-tabs";
import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { components, tools } from "@/lib/tambo";
import { spreadsheetContextHelper } from "@/lib/spreadsheet-context-helper";
import { spreadsheetSelectionContextHelper } from "@/lib/spreadsheet-selection-context";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";
import { useState } from "react";
import { PanelLeftIcon, PanelRightIcon, Table2Icon, FileTextIcon, PenLineIcon } from "lucide-react";
import { BlockSuiteIframe } from "@/components/blocksuite/BlockSuiteIframe";

type ViewMode = "spreadsheet" | "page" | "edgeless";

export default function Home() {
  const mcpServers = useMcpServers();
  const [showSpreadsheet, setShowSpreadsheet] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("spreadsheet");

  // You can customize default suggestions via MessageThreadFull internals

  return (
    <ApiKeyCheck>
      <div className="h-screen flex flex-col overflow-hidden relative">
        {process.env.NEXT_PUBLIC_TAMBO_API_KEY && (
          <TamboProvider
            apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY}
            components={components}
            tools={tools}
            contextHelpers={{
              spreadsheet: spreadsheetContextHelper,
              selection: spreadsheetSelectionContextHelper,
            }}
          >
            <TamboMcpProvider mcpServers={mcpServers}>
              {/* View Mode Switcher - Fixed at top */}
              <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                {/* 3-way mode switcher: Spreadsheet | Page | Edgeless */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-background/95 backdrop-blur-sm shadow-lg border border-border">
                  <button
                    onClick={() => setViewMode("spreadsheet")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === "spreadsheet"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    aria-label="Spreadsheet view"
                    title="Spreadsheet mode - Excel-like grid"
                  >
                    <Table2Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">Spreadsheet</span>
                  </button>
                  <button
                    onClick={() => setViewMode("page")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === "page"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    aria-label="Page editor view"
                    title="Page mode - Notion-like document editor"
                  >
                    <FileTextIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Page</span>
                  </button>
                  <button
                    onClick={() => setViewMode("edgeless")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewMode === "edgeless"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    aria-label="Edgeless canvas view"
                    title="Edgeless mode - Infinite whiteboard canvas"
                  >
                    <PenLineIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Edgeless</span>
                  </button>
                </div>

                {/* Mobile toggle button for chat panel */}
                <button
                  onClick={() => setShowSpreadsheet(!showSpreadsheet)}
                  className="md:hidden p-2 rounded-lg bg-background/95 backdrop-blur-sm hover:bg-accent shadow-lg border border-border"
                  aria-label={showSpreadsheet ? "Show chat" : "Show content"}
                >
                  {showSpreadsheet ? <PanelLeftIcon className="h-5 w-5" /> : <PanelRightIcon className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex h-full overflow-hidden">
                {/* Chat panel - hidden on mobile when content is shown */}
                <div className={`${showSpreadsheet ? 'hidden md:flex' : 'flex'} flex-1 overflow-hidden`}>
                  <MessageThreadFull contextKey="tambo-template" />
                </div>

                {/* Content panel - switches between 3 modes */}
                <div className={`${showSpreadsheet ? 'flex' : 'hidden md:flex'} w-full md:w-[60%] overflow-auto`}>
                  {viewMode === "spreadsheet" && (
                    <>
                      {/* Tab metadata interactable for AI */}
                      <InteractableTabs interactableId="TabsState" />

                      {/* Visual spreadsheet tabs UI */}
                      <SpreadsheetTabs className="h-full" />
                    </>
                  )}
                  
                  {viewMode === "page" && (
                    <BlockSuiteIframe mode="page" className="w-full h-full" />
                  )}
                  
                  {viewMode === "edgeless" && (
                    <BlockSuiteIframe mode="edgeless" className="w-full h-full" />
                  )}
                </div>
              </div>
            </TamboMcpProvider>
          </TamboProvider>
        ) || (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Please configure Tambo API credentials to use the chat interface.</p>
          </div>
        )}
      </div>
    </ApiKeyCheck>
  );
}
