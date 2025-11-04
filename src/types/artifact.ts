export type ArtifactType = "code/html" | "doc/markdown" | "dataset/table";

export interface ArtifactBase {
  id: string;
  type: ArtifactType;
  title?: string;
  meta?: Record<string, unknown>;
  createdAt: number;
  updatedAt?: number;
}

export interface HtmlArtifact extends ArtifactBase {
  type: "code/html";
  payload: { html: string };
}

export interface MarkdownArtifact extends ArtifactBase {
  type: "doc/markdown";
  payload: { markdown: string };
}

export interface DatasetArtifact extends ArtifactBase {
  type: "dataset/table";
  payload: { data: (string | number)[][]; start?: { row: number; col: number } };
}

export type Artifact = HtmlArtifact | MarkdownArtifact | DatasetArtifact;
