import { z } from "zod";
import type { TamboTool } from "@tambo-ai/react";
import { useArtifactsStore } from "@/store/artifacts";
import type { Artifact } from "@/types/artifact";

const MAX_HTML_SIZE = 200 * 1024; // 200KB
const MAX_MD_SIZE = 200 * 1024; // 200KB

function generateId(prefix: string = "art"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Flexible generator: accepts multiple calling conventions for user-friendliness.
// Supported forms:
// 1) (type, payload, title?, meta?)
// 2) (title, payload, meta?)  -> type inferred from payload
// 3) (payload, title?, meta?) -> type inferred from payload
// Payload inference: { html } => code/html; { markdown } => doc/markdown; { data } => dataset/table
const generateArtifact = async (
  ...args: any[]
) => {
  console.log("🚀 generateArtifact called with args:", args);
  try {
    const id = generateId();
    const now = Date.now();
    let artifact: Artifact | undefined;

    const allowed = new Set(["code/html", "doc/markdown", "dataset/table"]);
    let _type: string | undefined;
    let _payload: any | undefined;
    let _title: string | undefined;
    let _meta: Record<string, unknown> | undefined;

    // Parse arguments flexibly
    if (args.length >= 2 && typeof args[0] === "string" && allowed.has(args[0])) {
      // Form 1: (type, payload, title?, meta?)
      _type = args[0];
      _payload = args[1];
      _title = typeof args[2] === "string" ? args[2] : undefined;
      _meta = (args[3] && typeof args[3] === "object") ? args[3] : undefined;
    } else if (args.length >= 2 && typeof args[0] === "string" && typeof args[1] === "object") {
      // Form 2: (title, payload, meta?) -> infer type from payload
      _title = args[0];
      _payload = args[1];
      _meta = (args[2] && typeof args[2] === "object") ? args[2] : undefined;
    } else if (args.length >= 1 && typeof args[0] === "object") {
      // Form 3: (payload, title?, meta?)
      _payload = args[0];
      _title = typeof args[1] === "string" ? args[1] : undefined;
      _meta = (args[2] && typeof args[2] === "object") ? args[2] : undefined;
      // Also support a single object with param1/param2 (common LLM pattern)
      if (_payload && typeof _payload === "object" && ("param1" in _payload || "param2" in _payload)) {
        const p1 = (_payload as any).param1;
        const p2 = (_payload as any).param2;
        const p3 = (_payload as any).param3;
        // If p1 is an allowed explicit type
        if (typeof p1 === "string" && allowed.has(p1)) {
          _type = p1;
          _payload = p2;
          _title = typeof p3 === "string" ? p3 : _title;
        } else if (typeof p1 === "string" && typeof p2 === "object") {
          // (title, payload)
          _title = p1;
          _payload = p2;
        } else if (typeof p1 === "object") {
          // (payload)
          _payload = p1;
        }
      }
    } else {
      return { success: false, error: "Invalid arguments. Provide (type, payload) or (title, payload) or (payload)." };
    }

    // Infer type if missing
    if (!_type) {
      if (_payload && typeof _payload === "object") {
        if (typeof _payload.html === "string") _type = "code/html";
        else if (typeof _payload.markdown === "string") _type = "doc/markdown";
        else if (Array.isArray(_payload.data)) _type = "dataset/table";
      }
    }

    if (!_type || !allowed.has(_type)) {
      return { success: false, error: "Unsupported artifact type. Use 'code/html', 'doc/markdown', or 'dataset/table'." };
    }

    // Build artifact by type
    if (_type === "code/html") {
      const html = String(_payload?.html ?? "");
      if (html.length > MAX_HTML_SIZE) return { success: false, error: "HTML payload too large" };
      artifact = { id, type: "code/html", payload: { html }, title: _title, meta: _meta, createdAt: now } as Artifact;
    } else if (_type === "doc/markdown") {
      const markdown = String(_payload?.markdown ?? "");
      if (markdown.length > MAX_MD_SIZE) return { success: false, error: "Markdown payload too large" };
      artifact = { id, type: "doc/markdown", payload: { markdown }, title: _title, meta: _meta, createdAt: now } as Artifact;
    } else if (_type === "dataset/table") {
      const data = _payload?.data as (string | number)[][];
      if (!Array.isArray(data) || (data[0] && !Array.isArray(data[0]))) {
        return { success: false, error: "dataset.table payload must be a 2D array" };
      }
      artifact = { id, type: "dataset/table", payload: { data, start: _payload?.start }, title: _title, meta: _meta, createdAt: now } as Artifact;
    }

    if (!artifact) return { success: false, error: "Failed to create artifact" };

    const store = useArtifactsStore.getState();
    console.log("📦 Adding artifact to store:", artifact.id, artifact.type);
    store.add(artifact);
    console.log("👁️ Opening preview for:", artifact.id);
    store.openPreview(artifact.id);
    console.log("✅ Store state after open:", { 
      isPreviewOpen: store.isPreviewOpen, 
      activeArtifactId: store.activeArtifactId,
      artifactExists: !!store.artifacts[artifact.id]
    });

    return { success: true, artifactId: artifact.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
};

const openArtifactPreview = async (artifactId: string) => {
  console.log("🔓 openArtifactPreview called for:", artifactId);
  const store = useArtifactsStore.getState();
  const art = store.artifacts[artifactId];
  console.log("🔍 Artifact lookup result:", { found: !!art, allArtifacts: Object.keys(store.artifacts) });
  if (!art) return { success: false, error: "Artifact not found" };
  store.openPreview(artifactId);
  console.log("✅ Preview opened. Store state:", { 
    isPreviewOpen: store.isPreviewOpen, 
    activeArtifactId: store.activeArtifactId 
  });
  return { success: true };
};

const insertArtifact = async (
  artifactId: string,
  targetSurface: "spreadsheet" | "page" | "edgeless",
  mode?: "as-code" | "as-markdown" | "as-image" | "as-text",
) => {
  // TODO: Wire real insertion adapters. For now, just acknowledge.
  const store = useArtifactsStore.getState();
  const art = store.artifacts[artifactId];
  if (!art) return { success: false, error: "Artifact not found" };
  return { success: true, message: `Queued insertion into ${targetSurface} (${mode ?? "default"}).` };
};

const saveArtifact = async (artifactId: string, as: "doc" | "block") => {
  const store = useArtifactsStore.getState();
  const art = store.artifacts[artifactId];
  if (!art) return { success: false, error: "Artifact not found" };
  return { success: true, message: `Saved artifact as ${as}.` };
};

export const generateArtifactTool: TamboTool = {
  name: "generate_artifact",
  description:
    "Create an artifact (code/html, doc/markdown, or dataset/table) and open the preview drawer."
    + " Natural language guidance: If the user says things like 'turn it into an app' or 'make a landing page',"
    + " generate a 'code/html' artifact with a complete minimal HTML page (doctype, head, body)."
    + " If the user says 'write a spec', 'document this', or 'explain how to', generate a 'doc/markdown' artifact."
    + " If the user says 'put these rows into a table' or 'export data', use 'dataset/table'."
    + " Examples:"
    + " - 'I need a landing page for ACME' -> type='code/html', payload={html: '<!doctype html>...'}"
    + " - 'Summarize our plan' -> type='doc/markdown', payload={markdown: '# Plan...'}"
    + " - 'Create a table from A1:C10' -> type='dataset/table', payload={data: [...]}.",
  tool: generateArtifact,
  toolSchema: z
    .function()
    // Accept up to four flexible arguments to support natural calls and generic param1/param2 patterns
    .args(
      z.any().optional(),
      z.any().optional(),
      z.any().optional(),
      z.any().optional(),
    )
    .returns(z.object({ success: z.boolean(), artifactId: z.string().optional(), error: z.string().optional() })),
};

export const openArtifactPreviewTool: TamboTool = {
  name: "open_artifact_preview",
  description: "Open the preview drawer for a previously created artifact by ID.",
  tool: openArtifactPreview,
  toolSchema: z
    .function()
    .args(z.string().describe("Artifact ID"))
    .returns(z.object({ success: z.boolean(), error: z.string().optional() })),
};

export const insertArtifactTool: TamboTool = {
  name: "insert_artifact",
  description:
    "Insert an artifact into a target surface (stub)."
    + " Guidance: Use 'page' for BlockSuite page content, 'spreadsheet' for data, 'edgeless' for canvas."
    + " For HTML choose mode='as-code' (fenced code block) in MVP. For Markdown choose mode='as-markdown'.",
  tool: insertArtifact,
  toolSchema: z
    .function()
    .args(
      z.string().describe("Artifact ID"),
      z.enum(["spreadsheet", "page", "edgeless"]).describe("Target surface"),
      z.enum(["as-code", "as-markdown", "as-image", "as-text"]).optional().describe("Insertion mode"),
    )
    .returns(z.object({ success: z.boolean(), message: z.string().optional(), error: z.string().optional() })),
};

export const saveArtifactTool: TamboTool = {
  name: "save_artifact",
  description: "Save an artifact as a document or block (stub).",
  tool: saveArtifact,
  toolSchema: z
    .function()
    .args(z.string().describe("Artifact ID"), z.enum(["doc", "block"]).describe("Save as"))
    .returns(z.object({ success: z.boolean(), message: z.string().optional(), error: z.string().optional() })),
};

export const artifactTools: TamboTool[] = [
  generateArtifactTool,
  openArtifactPreviewTool,
  insertArtifactTool,
  saveArtifactTool,
];
