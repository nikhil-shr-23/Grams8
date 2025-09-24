import { type Diagram } from "./types";

export function importFromJson(json: string): Diagram["data"] {
  try {
    const data = JSON.parse(json);
    if (
      data &&
      Array.isArray(data.nodes) &&
      Array.isArray(data.edges) &&
      data.viewport
    ) {
      return {
        nodes: data.nodes,
        edges: data.edges,
        notes: data.notes ?? [],
        zones: data.zones ?? [],
        viewport: data.viewport,
        isLocked: data.isLocked ?? false,
      };
    }
    throw new Error("Invalid JSON structure for diagram import.");
  } catch (e) {
    console.log(e)
    throw new Error(
      "Failed to parse JSON file. Please ensure it's a valid export from this application."
    );
  }
}