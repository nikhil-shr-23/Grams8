import { type AppZoneNode, type CombinedNode } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
interface MigrationFile {
  filename: string;
  content: string;
}

export async function downloadZip(
  files: MigrationFile[],
  zipName: string
): Promise<void> {
  if (files.length === 0) {
    throw new Error("No files to download");
  }

  const zip = new JSZip();
  files.forEach((file) => {
    zip.file(file.filename, file.content);
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, zipName);
}

/**
 * Check if a point is inside a rectangle
 */
function isPointInRect(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Check if a node is completely inside a zone
 */
export function isNodeInsideZone(
  node: CombinedNode,
  zone: AppZoneNode
): boolean {
  if (!node.position || !zone.position) return false;

  // Get node dimensions (use defaults if not specified)
  const nodeWidth =
    node.width ||
    (node.type === "table" ? 288 : node.type === "note" ? 192 : 300);
  const nodeHeight =
    node.height ||
    (node.type === "table" ? 100 : node.type === "note" ? 192 : 300);

  const zoneWidth = zone.width || 300;
  const zoneHeight = zone.height || 300;

  // Check if all four corners of the node are inside the zone
  const topLeft = { x: node.position.x, y: node.position.y };
  const topRight = { x: node.position.x + nodeWidth, y: node.position.y };
  const bottomLeft = { x: node.position.x, y: node.position.y + nodeHeight };
  const bottomRight = {
    x: node.position.x + nodeWidth,
    y: node.position.y + nodeHeight,
  };

  const zoneRect = {
    x: zone.position.x,
    y: zone.position.y,
    width: zoneWidth,
    height: zoneHeight,
  };

  return (
    isPointInRect(topLeft, zoneRect) &&
    isPointInRect(topRight, zoneRect) &&
    isPointInRect(bottomLeft, zoneRect) &&
    isPointInRect(bottomRight, zoneRect)
  );
}

/**
 * Find all locked zones that contain a node
 */
export function getLockedZonesForNode(
  node: CombinedNode,
  zones: AppZoneNode[]
): AppZoneNode[] {
  return zones.filter(
    (zone) => zone.data.isLocked && isNodeInsideZone(node, zone)
  );
}

/**
 * Check if a node is inside any locked zone
 */
export function isNodeInLockedZone(
  node: CombinedNode,
  zones: AppZoneNode[]
): boolean {
  return zones.some(
    (zone) => zone.data.isLocked && isNodeInsideZone(node, zone)
  );
}
