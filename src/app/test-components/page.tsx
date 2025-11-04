"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { MessageInput, MessageInputTextarea, MessageInputSubmitButton, MessageInputFileButton, MessageInputMcpConfigButton, MessageInputToolbar } from "@/components/tambo/message-input";
import { MessageSuggestions, MessageSuggestionsList, MessageSuggestionsStatus } from "@/components/tambo/message-suggestions";
import { ThreadHistory, ThreadHistoryHeader, ThreadHistoryNewButton, ThreadHistorySearch, ThreadHistoryList } from "@/components/tambo/thread-history";
import { ThreadContent, ThreadContentMessages } from "@/components/tambo/thread-content";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { Graph } from "@/components/tambo/graph";
import { Spreadsheet } from "@/components/tambo/spreadsheet";
import { markdownComponents } from "@/components/tambo/markdown-components";
import { McpConfigModal } from "@/components/tambo/mcp-config-modal";
import { MessageGenerationStage } from "@/components/tambo/message-generation-stage";
import { Message, MessageContent } from "@/components/tambo/message";
import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { components, tools } from "@/lib/tambo";
import { spreadsheetContextHelper } from "@/lib/spreadsheet-context-helper";
import { spreadsheetSelectionContextHelper } from "@/lib/spreadsheet-selection-context";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";
import { useState } from "react";
import DataCard from "@/components/ui/card-data";
import { InteractableTabs } from "@/components/ui/interactable-tabs";
 

export default function TestComponentsPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [showMcpModal, setShowMcpModal] = useState(false);
  

  // Sample data for graph testing
  const sampleGraphData = {
    tabId: "test-tab",
    labelsRange: "A1:A5",
    dataSets: [
      { range: "B1:B5", color: "#3b82f6" },
      { range: "C1:C5", color: "#10b981" }
    ]
  };

  return (
    <ApiKeyCheck>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Tambo Components Test Page</h1>
          <p className="text-muted-foreground">Test and explore all Tambo components</p>

          {/* Simple Tab Navigation */}
          <div className="flex space-x-2 mb-6 border-b">
            {["chat", "input", "thread", "data", "visualization", "config"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Chat Components Tab */}
          {activeTab === "chat" && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">MessageThreadFull Component</h2>
                <p className="text-muted-foreground mb-4">Complete chat interface with all features</p>
                <div className="h-96 border rounded-lg">
                  <MessageThreadFull contextKey="test-chat" />
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Individual Message Component</h2>
                <p className="text-muted-foreground mb-4">Single message display with markdown support</p>
                <div className="space-y-4">
                  <Message role="assistant" message={{
                    id: "test-1",
                    content: [{ type: "text", text: "This is a **test message** with *markdown* formatting and `code` blocks." }],
                    role: "assistant",
                    createdAt: new Date().toISOString(),
                    isStreaming: false
                  }}>
                    <MessageContent />
                  </Message>
                  <Message role="assistant" message={{
                    id: "test-2",
                    content: [{ type: "text", text: "```javascript\nconst hello = 'world';\nconsole.log(hello);\n```" }],
                    role: "assistant",
                    createdAt: new Date().toISOString(),
                    isStreaming: false
                  }}>
                    <MessageContent />
                  </Message>
                </div>
              </div>
            </div>
          )}

          {/* Input Components Tab */}
          {activeTab === "input" && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Complete MessageInput</h2>
                <p className="text-muted-foreground mb-4">Full input with toolbar and all features</p>
                <MessageInput contextKey="test-input">
                  <MessageInputTextarea placeholder="Type your test message here..." />
                  <MessageInputToolbar>
                    <MessageInputFileButton />
                    <MessageInputMcpConfigButton />
                    <MessageInputSubmitButton />
                  </MessageInputToolbar>
                </MessageInput>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Message Suggestions</h2>
                <p className="text-muted-foreground mb-4">Pre-defined suggestions for users</p>
                <MessageSuggestions 
                  initialSuggestions={[
                    { id: "1", title: "Test Chat", detailedSuggestion: "Start a test conversation", messageId: "test-chat" },
                    { id: "2", title: "Data Analysis", detailedSuggestion: "Analyze some sample data", messageId: "data-analysis" },
                    { id: "3", title: "Code Help", detailedSuggestion: "Get help with coding", messageId: "code-help" }
                  ]}
                >
                  <MessageSuggestionsStatus />
                  <MessageSuggestionsList />
                </MessageSuggestions>
              </div>
            </div>
          )}

          {/* Thread Components Tab */}
          {activeTab === "thread" && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Thread Management</h2>
                <p className="text-muted-foreground mb-4">Thread history and management components</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Thread History</h3>
                    <ThreadHistory contextKey="test-thread" position="left">
                      <ThreadHistoryHeader />
                      <ThreadHistoryNewButton />
                      <ThreadHistorySearch />
                      <ThreadHistoryList />
                    </ThreadHistory>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Thread Content</h3>
                    <div className="h-64 border rounded-lg p-4">
                      <ThreadContent>
                        <ThreadContentMessages />
                      </ThreadContent>
                    </div>
                    </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Scrollable Message Container</h2>
                <p className="text-muted-foreground mb-4">Auto-scrolling container for messages</p>
                <div className="h-64 border rounded-lg">
                  <ScrollableMessageContainer className="p-4">
                    <div className="space-y-4">
                      <Message role="user" message={{
                        id: "scroll-1",
                        content: [{ type: "text", text: "First message in container" }],
                        role: "user",
                        createdAt: new Date().toISOString()
                      }}>
                        <MessageContent />
                      </Message>
                      <Message role="assistant" message={{
                        id: "scroll-2",
                        content: [{ type: "text", text: "Second message that should be visible" }],
                        role: "assistant",
                        createdAt: new Date().toISOString()
                      }}>
                        <MessageContent />
                      </Message>
                    </div>
                  </ScrollableMessageContainer>
                </div>
              </div>
            </div>
          )}

          {/* Data Components Tab */}
          {activeTab === "data" && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Spreadsheet Component</h2>
                <p className="text-muted-foreground mb-4">Interactive spreadsheet with data editing</p>
                <div className="h-96 border rounded-lg overflow-hidden">
                  <Spreadsheet
                    tabId="test-spreadsheet"
                    initialData={[
                      ["Product", "Q1 Sales", "Q2 Sales", "Total"],
                      ["Product A", "1000", "1500", "=B2+C2"],
                      ["Product B", "800", "1200", "=B3+C3"],
                      ["Product C", "1500", "1800", "=B4+C4"]
                    ]}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Message Generation Stage</h2>
                <p className="text-muted-foreground mb-4">Streaming message generation display</p>
                <MessageGenerationStage
                  isGenerating={true}
                  generatedText="This is a test of the message generation component with streaming text..."
                />
              </div>
            </div>
          )}

          {/* Visualization Tab */}
          {activeTab === "visualization" && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Graph Components</h2>
                <p className="text-muted-foreground mb-4">Data visualization with different chart types</p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Bar Chart</h3>
                    <Graph
                      type="bar"
                      spreadsheetData={sampleGraphData}
                      title="Sales Data - Bar"
                      variant="default"
                      size="default"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Line Chart</h3>
                    <Graph
                      type="line"
                      spreadsheetData={sampleGraphData}
                      title="Sales Data - Line"
                      variant="solid"
                      size="default"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pie Chart</h3>
                    <Graph
                      type="pie"
                      spreadsheetData={sampleGraphData}
                      title="Sales Data - Pie"
                      variant="bordered"
                      size="default"
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Markdown Components</h2>
                <p className="text-muted-foreground mb-4">Custom markdown rendering examples</p>
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <markdownComponents>
                      {`
# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

- List item 1
- List item 2
- List item 3

\`\`\`javascript
// Code block example
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> This is a blockquote
> It can span multiple lines

[Link example](https://example.com)
                      `}
                    </markdownComponents>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === "config" && (
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">MCP Configuration Modal</h2>
                <p className="text-muted-foreground mb-4">Model Context Protocol server configuration</p>
                <button
                  onClick={() => setShowMcpModal(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Open MCP Configuration
                </button>
                <McpConfigModal
                  isOpen={showMcpModal}
                  onClose={() => setShowMcpModal(false)}
                />
              </div>

              

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Tambo Provider Setup</h2>
                <p className="text-muted-foreground mb-4">Complete Tambo context with all features</p>
                <div className="h-96 border rounded-lg">
                  {process.env.NEXT_PUBLIC_TAMBO_API_KEY && process.env.NEXT_PUBLIC_TAMBO_URL ? (
                    <TamboProvider
                      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY}
                      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
                      components={components}
                      tools={tools}
                      contextHelpers={{
                        spreadsheet: spreadsheetContextHelper,
                        selection: spreadsheetSelectionContextHelper,
                      }}
                    >
                      <TamboMcpProvider mcpServers={[]}>
                        <div className="p-4">
                          <p className="text-center text-green-600 font-medium">
                            ✅ Tambo Provider is configured and working!
                          </p>
                          <p className="text-center text-muted-foreground mt-2">
                            All Tambo components are now available for testing.
                          </p>
                        </div>
                      </TamboMcpProvider>
                    </TamboProvider>
                  ) : (
                    <div className="p-4">
                      <p className="text-center text-red-600 font-medium">
                        ❌ Tambo API credentials not configured
                      </p>
                      <p className="text-center text-muted-foreground mt-2">
                        Please run \`npx tambo init\` to configure API credentials.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Data Card Component</h2>
                <p className="text-muted-foreground mb-4">Interactive data selection component</p>
                <DataCard
                  title="Sample Data Options"
                  options={[
                    { id: "1", label: "Option 1", value: "option1", description: "First sample option" },
                    { id: "2", label: "Option 2", value: "option2", description: "Second sample option" },
                    { id: "3", label: "Option 3", value: "option3", description: "Third sample option" }
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
    </ApiKeyCheck>
  );
}
