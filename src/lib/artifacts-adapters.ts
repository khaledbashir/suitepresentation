"use client";

import type { Artifact } from "@/types/artifact";

export interface InsertionResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Spreadsheet Adapter
export class SpreadsheetAdapter {
  static async insertArtifact(
    artifact: Artifact, 
    selection?: { startRow: number; startCol: number }
  ): Promise<InsertionResult> {
    try {
      if (artifact.type === "dataset/table") {
        // Insert as spreadsheet range update
        const { data, start } = artifact.payload;
        const insertRange = {
          startRow: start?.row || selection?.startRow || 0,
          startCol: start?.col || selection?.startCol || 0,
          endRow: (start?.row || selection?.startRow || 0) + data.length - 1,
          endCol: (start?.col || selection?.startCol || 0) + data[0]?.length - 1
        };

        // Trigger spreadsheet update
        window.dispatchEvent(new CustomEvent("spreadsheetUpdateRange", {
          detail: {
            startRow: insertRange.startRow,
            startCol: insertRange.startCol,
            endRow: insertRange.endRow,
            endCol: insertRange.endCol,
            data: data
          }
        }));

        return {
          success: true,
          message: `Table with ${data.length}x${data[0]?.length || 0} cells inserted successfully`
        };
      } else if (artifact.type === "doc/markdown" || artifact.type === "code/html") {
        // Insert as text into selected cell or create new cell
        const textContent = artifact.type === "doc/markdown" 
          ? artifact.payload.markdown 
          : artifact.payload.html;

        window.dispatchEvent(new CustomEvent("spreadsheetUpdateCell", {
          detail: {
            row: selection?.startRow || 0,
            col: selection?.startCol || 0,
            value: textContent.substring(0, 1000), // Limit cell content
            type: artifact.type === "doc/markdown" ? "text" : "html"
          }
        }));

        return {
          success: true,
          message: "Text content inserted into spreadsheet cell"
        };
      }

      return {
        success: false,
        error: "Unsupported artifact type for spreadsheet insertion"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to insert artifact"
      };
    }
  }
}

// Page Adapter (BlockSuite Page Editor)
export class PageAdapter {
  static async insertArtifact(
    artifact: Artifact,
    position: "atSelection" | "end" = "atSelection"
  ): Promise<InsertionResult> {
    try {
      if (artifact.type === "doc/markdown") {
        // Insert markdown as paragraphs and headings
        const markdown = artifact.payload.markdown;
        const blocks = this.parseMarkdownToBlocks(markdown);
        
        window.dispatchEvent(new CustomEvent("blocksuiteInsertBlocks", {
          detail: {
            target: "page",
            blocks: blocks,
            position: position
          }
        }));

        return {
          success: true,
          message: `Markdown content inserted as ${blocks.length} blocks`
        };
      } else if (artifact.type === "code/html") {
        // Insert as fenced code block
        const codeBlock = {
          type: "code",
          language: "html",
          content: artifact.payload.html
        };

        window.dispatchEvent(new CustomEvent("blocksuiteInsertBlock", {
          detail: {
            target: "page",
            block: codeBlock,
            position: position
          }
        }));

        return {
          success: true,
          message: "HTML code block inserted successfully"
        };
      } else if (artifact.type === "dataset/table") {
        // Insert as markdown table
        const { data } = artifact.payload;
        const markdown = this.convertTableToMarkdown(data);
        
        const tableBlock = {
          type: "markdown",
          content: markdown
        };

        window.dispatchEvent(new CustomEvent("blocksuiteInsertBlock", {
          detail: {
            target: "page",
            block: tableBlock,
            position: position
          }
        }));

        return {
          success: true,
          message: `Table with ${data.length} rows inserted as markdown`
        };
      }

      return {
        success: false,
        error: "Unsupported artifact type for page insertion"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to insert artifact into page"
      };
    }
  }

  private static parseMarkdownToBlocks(markdown: string) {
    const lines = markdown.split('\n');
    const blocks: any[] = [];
    let currentBlock: any = null;

    for (const line of lines) {
      if (line.startsWith('#')) {
        // Heading
        const level = line.match(/^#+/)?.[0].length || 1;
        const text = line.replace(/^#+\s*/, '');
        blocks.push({
          type: "heading",
          level: Math.min(level, 6),
          text: text
        });
      } else if (line.trim() === '') {
        // Paragraph break
        currentBlock = null;
      } else {
        // Paragraph
        if (!currentBlock || currentBlock.type !== "paragraph") {
          currentBlock = {
            type: "paragraph",
            text: line
          };
          blocks.push(currentBlock);
        } else {
          currentBlock.text += '\n' + line;
        }
      }
    }

    return blocks;
  }

  private static convertTableToMarkdown(data: (string | number)[][]): string {
    if (!data.length) return '';

    const header = data[0].map(cell => String(cell)).join(' | ');
    const separator = data[0].map(() => '---').join(' | ');
    const rows = data.slice(1).map(row => 
      row.map(cell => String(cell)).join(' | ')
    );

    return `| ${header} |\n| ${separator} |\n${rows.map(row => `| ${row} |`).join('\n')}`;
  }
}

// Edgeless Adapter (BlockSuite Edgeless Editor)
export class EdgelessAdapter {
  static async insertArtifact(
    artifact: Artifact
  ): Promise<InsertionResult> {
    try {
      if (artifact.type === "code/html") {
        // For Edgeless, we typically insert as image snapshot or embed card
        // Since we can't easily render HTML in canvas, create an image snapshot
        
        window.dispatchEvent(new CustomEvent("blocksuiteInsertElement", {
          detail: {
            target: "edgeless",
            element: {
              type: "embed",
              url: `data:text/html;base64,${btoa(artifact.payload.html)}`,
              title: artifact.title || "HTML Artifact"
            }
          }
        }));

        return {
          success: true,
          message: "HTML artifact inserted as embed element"
        };
      } else if (artifact.type === "doc/markdown") {
        // Insert as text note or sticky
        window.dispatchEvent(new CustomEvent("blocksuiteInsertElement", {
          detail: {
            target: "edgeless",
            element: {
              type: "text",
              text: artifact.payload.markdown,
              style: "note"
            }
          }
        }));

        return {
          success: true,
          message: "Markdown content inserted as text note"
        };
      } else if (artifact.type === "dataset/table") {
        // Convert table to visual elements or embed as image
        const { data } = artifact.payload;
        
        window.dispatchEvent(new CustomEvent("blocksuiteInsertElement", {
          detail: {
            target: "edgeless",
            element: {
              type: "embed",
              url: `data:application/json;base64,${btoa(JSON.stringify(data))}`,
              title: artifact.title || "Data Table"
            }
          }
        }));

        return {
          success: true,
          message: `Table with ${data.length} rows inserted as data element`
        };
      }

      return {
        success: false,
        error: "Unsupported artifact type for edgeless insertion"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to insert artifact into edgeless"
      };
    }
  }
}

// Main artifact insertion handler
export class ArtifactInserter {
  static async insertArtifact(
    artifactId: string,
    targetSurface: "spreadsheet" | "page" | "edgeless",
    mode?: "as-code" | "as-markdown" | "as-image" | "as-text"
  ): Promise<InsertionResult> {
    // Get artifact from store
    const artifact = this.getArtifactById(artifactId);
    if (!artifact) {
      return {
        success: false,
        error: "Artifact not found"
      };
    }

    // Select appropriate adapter
    switch (targetSurface) {
      case "spreadsheet":
        return await SpreadsheetAdapter.insertArtifact(artifact);
      case "page":
        return await PageAdapter.insertArtifact(artifact);
      case "edgeless":
        return await EdgelessAdapter.insertArtifact(artifact);
      default:
        return {
          success: false,
          error: `Unknown target surface: ${targetSurface}`
        };
    }
  }

  private static getArtifactById(id: string): Artifact | null {
    // Get from global artifacts store
    try {
      // This would typically import the store, but we need to avoid circular imports
      // In a real implementation, this would use the useArtifactsStore hook
      const artifactsStore = (window as any).__artifactsStore;
      return artifactsStore?.artifacts[id] || null;
    } catch (error) {
      console.error("Failed to get artifact by ID:", error);
      return null;
    }
  }
}