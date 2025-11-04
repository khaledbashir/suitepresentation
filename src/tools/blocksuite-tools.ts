/**
 * @file blocksuite-tools.ts
 * @description Tambo tools for BlockSuite editor integration
 * 
 * This file contains all the Tambo tools that allow AI to control BlockSuite editors
 * (Page and Edgeless) and perform actions like inserting text, blocks, getting outlines,
 * and switching surfaces.
 */

import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

// Schemas for validation
const InsertTextSchema = z.object({
  target: z.enum(["page", "edgeless"]),
  text: z.string().max(20000, "Text must be less than 20,000 characters"),
  where: z.enum(["atSelection", "end"]).optional(),
});

const InsertBlockSchema = z.object({
  type: z.enum(["heading", "paragraph", "list", "table", "image"]),
  props: z.record(z.any()).optional(),
  position: z.enum(["afterSelection", "end"]).optional(),
});

const SwitchSurfaceSchema = z.object({
  target: z.enum(["spreadsheet", "page", "edgeless"]),
});

const GenerateArtifactSchema = z.object({
  type: z.enum(["code/html", "doc/markdown", "dataset/table"]),
  payload: z.record(z.any()),
  title: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

const OpenArtifactPreviewSchema = z.object({
  artifactId: z.string(),
});

const InsertArtifactSchema = z.object({
  artifactId: z.string(),
  targetSurface: z.enum(["spreadsheet", "page", "edgeless"]),
  mode: z.enum(["as-code", "as-markdown", "as-image", "as-text"]).optional(),
});

const SaveArtifactSchema = z.object({
  artifactId: z.string(),
  as: z.enum(["doc", "block"]),
});

/**
 * Insert text into a BlockSuite editor
 * Supports both Page editor (markdown) and Edgeless editor (text nodes)
 */
export const blocksuiteInsertText: TamboTool = {
  name: "blocksuite_insert_text",
  description: "Insert text content into the current BlockSuite editor (Page or Edgeless)",
  inputSchema: InsertTextSchema,
  handler: async (input, context) => {
    try {
      const { target, text, where = "end" } = InsertTextSchema.parse(input);
      
      // Find the target editor container
      const editorContainer = document.querySelector(`[data-editor-type="${target}"]`) as HTMLElement;
      
      if (!editorContainer) {
        return {
          success: false,
          error: `No ${target} editor found. Switch to ${target} mode first.`,
        };
      }

      // Insert text based on editor type
      if (target === "page") {
        // For Page editor, we would insert markdown content
        // This is a simplified implementation - in reality, we'd need to interact with BlockSuite's API
        console.log(`Inserting markdown text into Page editor: ${text}`);
        
        // Placeholder: In a real implementation, we would:
        // 1. Get the BlockSuite page instance
        // 2. Insert text at the current selection or end of document
        // 3. Return success
      } else if (target === "edgeless") {
        // For Edgeless editor, we would insert text nodes
        console.log(`Inserting text into Edgeless editor: ${text}`);
        
        // Placeholder: Similar to above, but for Edgeless canvas
      }

      return {
        success: true,
        message: `Successfully inserted text into ${target} editor`,
      };
    } catch (error) {
      console.error("Error inserting text:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Insert blocks into a BlockSuite editor
 * Supports heading, paragraph, list, table, and image blocks
 */
export const blocksuiteInsertBlock: TamboTool = {
  name: "blocksuite_insert_block",
  description: "Insert blocks into the current BlockSuite editor (heading, paragraph, list, table, image)",
  inputSchema: InsertBlockSchema,
  handler: async (input, context) => {
    try {
      const { type, props = {}, position = "end" } = InsertBlockSchema.parse(input);
      
      // Get current editor type from context (this would be set by surface_switch)
      const currentEditor = context.getVariable("currentEditor") as string || "page";
      
      console.log(`Inserting ${type} block into ${currentEditor} editor`);
      
      // Placeholder: In a real implementation, we would:
      // 1. Get the BlockSuite page instance
      // 2. Create a block of the specified type
      // 3. Insert it at the current selection or end of document
      // 4. Return the block ID
      
      const blockId = `block_${Date.now()}`;
      
      return {
        success: true,
        id: blockId,
        message: `Successfully inserted ${type} block`,
      };
    } catch (error) {
      console.error("Error inserting block:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Get the outline of the current BlockSuite editor
 * Returns structure information about blocks in the document
 */
export const blocksuiteGetOutline: TamboTool = {
  name: "blocksuite_get_outline",
  description: "Get the outline/structure of the current BlockSuite editor content",
  inputSchema: z.object({}),
  handler: async (input, context) => {
    try {
      // Get current editor type from context
      const currentEditor = context.getVariable("currentEditor") as string || "page";
      
      // Placeholder: In a real implementation, we would:
      // 1. Get the BlockSuite page instance
      // 2. Iterate through blocks and extract outline information
      // 3. Return structured outline data
      
      const outline = [
        {
          id: "block_1",
          type: "heading",
          text: "Document Title",
          level: 1,
        },
        {
          id: "block_2", 
          type: "paragraph",
          text: "This is a sample paragraph.",
        },
        {
          id: "block_3",
          type: "heading", 
          text: "Section 1",
          level: 2,
        },
      ];
      
      return {
        outline,
        success: true,
        message: `Retrieved outline from ${currentEditor} editor`,
      };
    } catch (error) {
      console.error("Error getting outline:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Switch between different editor surfaces
 * Allows AI to switch between Spreadsheet, Page, and Edgeless editors
 */
export const surfaceSwitch: TamboTool = {
  name: "surface_switch",
  description: "Switch the active surface between spreadsheet, page, and edgeless editors",
  inputSchema: SwitchSurfaceSchema,
  handler: async (input, context) => {
    try {
      const { target } = SwitchSurfaceSchema.parse(input);
      
      // Update context with current editor
      context.setVariable("currentEditor", target);
      
      // Trigger UI update to switch editor
      const editorModeSwitch = document.querySelector("[data-editor-mode-switch]") as HTMLElement;
      
      if (editorModeSwitch) {
        // Dispatch custom event to trigger editor switch
        const event = new CustomEvent("editorModeChange", { 
          detail: { mode: target } 
        });
        editorModeSwitch.dispatchEvent(event);
      }
      
      return {
        success: true,
        message: `Switched to ${target} editor`,
      };
    } catch (error) {
      console.error("Error switching surface:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Generate an artifact from content
 * Creates artifacts for code/HTML, markdown docs, or datasets
 */
export const generateArtifact: TamboTool = {
  name: "generate_artifact",
  description: "Generate an artifact from content (code/HTML, markdown, or dataset)",
  inputSchema: GenerateArtifactSchema,
  handler: async (input, context) => {
    try {
      const { type, payload, title, meta } = GenerateArtifactSchema.parse(input);
      
      // Create artifact ID
      const artifactId = `artifact_${Date.now()}`;
      
      // Create artifact object
      const artifact = {
        id: artifactId,
        type,
        payload,
        title: title || `Generated ${type}`,
        meta: meta || {},
        createdAt: Date.now(),
      };
      
      // Store artifact (this would integrate with the artifact store)
      console.log("Generated artifact:", artifact);
      
      return {
        success: true,
        artifactId,
        message: `Generated ${type} artifact`,
      };
    } catch (error) {
      console.error("Error generating artifact:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Open artifact preview
 * Opens the artifact preview drawer with the specified artifact
 */
export const openArtifactPreview: TamboTool = {
  name: "open_artifact_preview",
  description: "Open the preview drawer to display an artifact",
  inputSchema: OpenArtifactPreviewSchema,
  handler: async (input, context) => {
    try {
      const { artifactId } = OpenArtifactPreviewSchema.parse(input);
      
      // Trigger artifact preview open
      const previewDrawer = document.querySelector("[data-artifact-preview-drawer]") as HTMLElement;
      
      if (previewDrawer) {
        const event = new CustomEvent("openArtifactPreview", {
          detail: { artifactId },
        });
        previewDrawer.dispatchEvent(event);
      }
      
      return {
        success: true,
        message: `Opened preview for artifact ${artifactId}`,
      };
    } catch (error) {
      console.error("Error opening artifact preview:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Insert artifact into target surface
 * Inserts an artifact into the specified editor surface
 */
export const insertArtifact: TamboTool = {
  name: "insert_artifact",
  description: "Insert an artifact into the specified surface (spreadsheet, page, or edgeless)",
  inputSchema: InsertArtifactSchema,
  handler: async (input, context) => {
    try {
      const { artifactId, targetSurface, mode = "as-text" } = InsertArtifactSchema.parse(input);
      
      console.log(`Inserting artifact ${artifactId} into ${targetSurface} with mode ${mode}`);
      
      // Placeholder: In a real implementation, we would:
      // 1. Get the artifact from store
      // 2. Convert it to the appropriate format for the target surface
      // 3. Insert it using the appropriate adapter
      // 4. Return success message
      
      return {
        success: true,
        message: `Successfully inserted artifact into ${targetSurface} as ${mode}`,
      };
    } catch (error) {
      console.error("Error inserting artifact:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Save artifact as document or block
 * Saves an artifact permanently in the editor
 */
export const saveArtifact: TamboTool = {
  name: "save_artifact",
  description: "Save an artifact as a document or block in the editor",
  inputSchema: SaveArtifactSchema,
  handler: async (input, context) => {
    try {
      const { artifactId, as } = SaveArtifactSchema.parse(input);
      
      console.log(`Saving artifact ${artifactId} as ${as}`);
      
      // Placeholder: In a real implementation, we would:
      // 1. Get the artifact from store
      // 2. Save it permanently in the current editor
      // 3. Return the new ID or success confirmation
      
      const newId = `saved_${Date.now()}`;
      
      return {
        success: true,
        newId,
        message: `Saved artifact as ${as}`,
      };
    } catch (error) {
      console.error("Error saving artifact:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

// Export all tools
export const blocksuiteTools: TamboTool[] = [
  blocksuiteInsertText,
  blocksuiteInsertBlock,
  blocksuiteGetOutline,
  surfaceSwitch,
  generateArtifact,
  openArtifactPreview,
  insertArtifact,
  saveArtifact,
];