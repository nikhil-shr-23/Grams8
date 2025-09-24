import { Settings } from "./types";

export const relationshipTypes = [
  { value: "one-to-one", label: "One-to-One" },
  { value: "one-to-many", label: "One-to-Many" },
  { value: "many-to-one", label: "Many-to-One" },
  { value: "many-to-many", label: "Many-to-Many" },
];

export const colors = {
  HIGHLIGHT: "#60a5fa",
  DEFAULT_STROKE: "#a1a1aa",
  DEFAULT_INDICATOR: "#4b5563",
  WHITE: "#FFFFFF",
  DEFAULT_TABLE_COLOR: "#60A5FA",
  DEFAULT_DIAGRAM_COLOR: "#A1A1AA",
};

export enum DbRelationship {
  ONE_TO_ONE = "one-to-one",
  ONE_TO_MANY = "one-to-many",
  MANY_TO_ONE = "many-to-one",
  MANY_TO_MANY = "many-to-many",
}

export const DbRelationShipLabel = {
  ONE: "1",
  MANY: "n",
};

export const KeyboardShortcuts = {
  SIDEBAR_TOGGLE: "b",
  UNDO_TABLE_DELETE: "z",
  ADD_NEW_TABLE: "a",
  COPY_SELECTION: "c",
  PASTE_COPIED: "v",
  SELECT_MULTIPLE: "Click",
  DELETE_ELEMENT: "Delete",
};

const isMac = navigator.userAgent.includes("Mac");
export const CtrlKey = isMac ? "⌘" : "Ctrl";

export const DEFAULT_SETTINGS: Settings = {
  rememberLastPosition: true,
  snapToGrid: false,
};
