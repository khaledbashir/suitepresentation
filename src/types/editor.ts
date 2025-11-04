export type EditorMode = "spreadsheet" | "page" | "edgeless";

export interface EditorContent {
  mode: EditorMode;
  content: any;
  outline?: Array<{
    id: string;
    type: string;
    text: string;
    level?: number;
  }>;
}

export interface EditorState {
  currentMode: EditorMode;
  content: Record<EditorMode, EditorContent>;
  selection?: any;
}

export interface SurfaceSwitchParams {
  target: EditorMode;
}

export interface InsertArtifactParams {
  artifactId: string;
  targetSurface: EditorMode;
  mode?: "as-code" | "as-markdown" | "as-image" | "as-text";
}

export interface BlockSuiteInsertParams {
  target: "page" | "edgeless";
  text?: string;
  block?: any;
  blocks?: any[];
  position?: "atSelection" | "end" | "afterSelection";
}

export interface SpreadsheetUpdateRangeParams {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  data: (string | number)[][];
}

export interface SpreadsheetUpdateCellParams {
  row: number;
  col: number;
  value: string;
  type?: string;
}