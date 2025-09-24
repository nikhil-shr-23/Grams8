import { type Edge, type Node } from "@xyflow/react";

export type DatabaseType = "mysql" | "postgres";
export type CombinedNode = AppNode | AppNoteNode | AppZoneNode;
export type ProcessedNode = (AppNode | AppNoteNode | AppZoneNode) & {
  draggable: boolean;
};
export type ProcessedEdge = Omit<AppEdge, "type"> & {
  type: string;
  selectable: boolean;
  data: {
    relationship: string;
    isHighlighted: boolean;
    isPositionLocked?: boolean;
  };
};

export interface Diagram {
  id?: number;
  name: string;
  dbType: DatabaseType;
  data: {
    nodes: AppNode[]; //tables
    edges: AppEdge[]; //relations
    notes?: AppNoteNode[];
    zones?: AppZoneNode[];
    viewport: { x: number; y: number; zoom: number };
    isLocked?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface AppState {
  key: string;
  value: string | number;
}
export interface Column {
  id: string;
  name: string;
  type: string;
  pk?: boolean | undefined;
  nullable?: boolean | undefined;
  defaultValue?: string | number | boolean | null | undefined;
  isUnique?: boolean | undefined;
  isAutoIncrement?: boolean | undefined;
  comment?: string | undefined;
  enumValues?: string | undefined;
  length?: number | undefined;
  precision?: number | undefined;
  scale?: number | undefined;
  isUnsigned?: boolean | undefined;
}

export interface Index {
  id: string;
  name: string;
  columns: string[];
  isUnique?: boolean;
}

export interface TableNodeData extends Record<string, unknown> {
  label: string;
  columns: Column[];
  indices?: Index[];
  comment?: string;
  color?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  order?: number;
  isPositionLocked?: boolean;
  onDelete?: (ids: string[]) => void;
}

export interface NoteNodeData extends Record<string, unknown> {
  text: string;
  color?: string;
  onUpdate?: (id: string, data: Partial<NoteNodeData>) => void;
  onDelete?: (ids: string[]) => void;
  isPositionLocked?: boolean;
}

export interface ZoneNodeData extends Record<string, unknown> {
  name: string;
  color?: string;
  onUpdate?: (id: string, data: Partial<ZoneNodeData>) => void;
  onDelete?: (ids: string[]) => void;
  onCreateTableAtPosition?: (position: { x: number; y: number }) => void;
  onCreateNoteAtPosition?: (position: { x: number; y: number }) => void;
  isLocked?: boolean;
}

export interface EdgeData extends Record<string, unknown> {
  relationship: string;
  isHighlighted?: boolean;
  isPositionLocked?: boolean;
}

export interface Settings {
  rememberLastPosition: boolean;
  snapToGrid: boolean;
}

export type AppNode = Node<TableNodeData, "table">;
export type AppNoteNode = Node<NoteNodeData, "note">;
export type AppZoneNode = Node<ZoneNodeData, "zone">;
export type AppEdge = Edge<EdgeData>;
