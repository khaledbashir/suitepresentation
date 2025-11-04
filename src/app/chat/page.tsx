"use client";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import SpreadsheetTabs from "@/components/ui/spreadsheet-tabs";
import { InteractableTabs } from "@/components/ui/interactable-tabs";
import { components, tools } from "@/lib/tambo";
import { spreadsheetContextHelper } from "@/lib/spreadsheet-context-helper";
import { spreadsheetSelectionContextHelper } from "@/lib/spreadsheet-selection-context";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";
import { useState } from "react";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";

export default function Home() {
  const mcpServers = useMcpServers();
  const [showSpreadsheet, setShowSpreadsheet] = useState(true);

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        components={components}
        tools={tools}
        contextHelpers={{
          spreadsheet: spreadsheetContextHelper,
          selection: spreadsheetSelectionContextHelper,
        }}
      >
        <TamboMcpProvider mcpServers={mcpServers}>
          {/* Mobile toggle button */}
          <button
            onClick={() => setShowSpreadsheet(!showSpreadsheet)}
            className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-accent hover:bg-accent/80 shadow-lg border border-border"
            aria-label={showSpreadsheet ? "Show chat" : "Show spreadsheet"}
          >
            {showSpreadsheet ? <PanelLeftIcon className="h-5 w-5" /> : <PanelRightIcon className="h-5 w-5" />}
          </button>

          <div className="flex h-full overflow-hidden">
            {/* Chat panel - left side */}
            <div className={`${showSpreadsheet ? 'hidden md:flex' : 'flex'} flex-1 overflow-hidden`}>
              <MessageThreadFull contextKey="tambo-template" />
            </div>

            {/* Spreadsheet panel - right side */}
            <div className={`${showSpreadsheet ? 'flex' : 'hidden md:flex'} w-full md:w-[60%] overflow-auto flex flex-col`}>
              <InteractableTabs interactableId="TabsState" />
              <SpreadsheetTabs className="h-full" />
            </div>
          </div>
        </TamboMcpProvider>
      </TamboProvider>
    </div>
  );
}
