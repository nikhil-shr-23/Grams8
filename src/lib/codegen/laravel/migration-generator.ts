import {
  type AppEdge,
  type AppNode,
  type Column,
  type Diagram,
  type Index,
} from "@/lib/types";
import {
  escapeString,
  generateTimestamp,
  getLaravelColumnType,
  isLaravelTimestampColumn,
  toLaravelTableName,
} from "./laravel-helpers";

export interface LaravelMigrationOptions {
  tableName?: string;
  className?: string;
  timestamp?: string;
}

export interface LaravelMigrationFile {
  filename: string;
  content: string;
}

export function generateLaravelMigration(
  diagram: Diagram,
  options: LaravelMigrationOptions = {}
): LaravelMigrationFile[] {
  const { nodes, edges } = diagram.data;
  const timestamp = options.timestamp || generateTimestamp();

  const migrationFiles: LaravelMigrationFile[] = [];

  // Generate migrations for each table (each file is independent with all constraints)
  // Sort nodes by their order property to respect table serial from inspector
  const sortedNodes = nodes
    .filter((n) => !n.data.isDeleted)
    .sort((a, b) => {
      const orderA = a.data.order ?? 0;
      const orderB = b.data.order ?? 0;
      return orderA - orderB;
    });

  sortedNodes.forEach((node, index) => {
    const tableName = toLaravelTableName(node.data.label.trim());
    const migrationTimestamp = timestamp + String(index).padStart(2, "0");
    const filename = `${migrationTimestamp}_create_${tableName}_table.php`;
    const content = generateSingleTableMigration(node, tableName, edges, nodes);

    migrationFiles.push({ filename, content });
  });

  return migrationFiles;
}

// Legacy function for backward compatibility - returns combined string
export function generateLaravelMigrationString(
  diagram: Diagram,
  options: LaravelMigrationOptions = {}
): string {
  const files = generateLaravelMigration(diagram, options);

  if (files.length === 0) {
    return "// No tables found to generate migrations";
  }

  const output = `/*
 * Laravel Migration Files Generated from grams8
 * Generated on: ${new Date().toLocaleString()}
 *
 * Instructions:
 * 1. Copy each migration block below into separate files in your Laravel project
 * 2. Place them in the database/migrations/ directory
 * 3. Use the filename format shown in each comment
 * 4. Run 'php artisan migrate' to execute the migrations
 *
 * Note: Each migration file is independent and includes all constraints
 */

`;

  return (
    output +
    files
      .map((f) => `// File: ${f.filename}\n${f.content}`)
      .join("\n\n" + "=".repeat(80) + "\n\n")
  );
}

function generateSingleTableMigration(
  node: AppNode,
  tableName: string,
  edges: AppEdge[],
  nodes: AppNode[]
): string {
  const columns = node.data.columns || [];
  const indices = node.data.indices || [];
  const comment = node.data.comment?.trim();

  let migration = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('${tableName}', function (Blueprint $table) {
`;

  // Check if we have a primary key column
  const hasPrimaryKey = columns.some((col) => col.pk);
  const hasTimestamps = columns.some((col) =>
    isLaravelTimestampColumn(col.name.trim())
  );

  // Add id() if no primary key is defined
  if (!hasPrimaryKey) {
    migration += `            $table->id();\n`;
  }

  // Generate columns (skip primary key if we added id())
  columns.forEach((col) => {
    if (!hasPrimaryKey || !col.pk) {
      migration += generateColumnDefinition(col, edges, nodes, "            ");
    } else if (col.pk) {
      // Handle custom primary key
      migration += generateColumnDefinition(col, edges, nodes, "            ");
    }
  });

  // Add timestamps if not present
  if (!hasTimestamps) {
    migration += `            $table->timestamps();\n`;
  }

  // Generate indices
  indices.forEach((index) => {
    migration += generateIndexDefinition(index, columns, "            ");
  });

  // Add table comment if exists
  if (comment) {
    migration += `            $table->comment('${escapeString(comment)}');\n`;
  }

  migration += `        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('${tableName}');
    }
};`;

  return migration;
}

function generateColumnDefinition(
  col: Column,
  edges: AppEdge[],
  nodes: AppNode[],
  indent: string
): string {
  let definition = `${indent}$table`;
  const columnName = col.name.trim().toLowerCase();
  const trimmedColName = col.name.trim();

  // Handle foreign key columns with modern Laravel syntax
  if (columnName.endsWith("_id") && !col.pk) {
    // Use foreignId() for foreign key columns
    definition += `->foreignId('${trimmedColName}')`;

    // Find the actual referenced table from edges
    const referencedTable = findReferencedTable(col.id, edges, nodes);
    if (referencedTable) {
      definition += `->constrained('${referencedTable}')`;
    } else {
      // Fallback to convention-based naming
      const conventionTable = columnName.replace("_id", "");
      const pluralTable = conventionTable.endsWith("s")
        ? conventionTable
        : `${conventionTable}s`;
      definition += `->constrained('${pluralTable}')`;
    }
  } else if (col.pk && columnName === "id") {
    // Use id() for primary key id columns
    definition += `->id()`;
  } else {
    // Handle other column types
    const laravelType = getLaravelColumnType(col.type, col.name);

    switch (laravelType) {
      case "string":
        if (columnName === "email") {
          definition += col.length
            ? `->string('${trimmedColName}', ${col.length})`
            : `->string('${trimmedColName}')`;
        } else if (columnName.includes("phone")) {
          definition += `->string('${trimmedColName}', 20)`;
        } else {
          definition += col.length
            ? `->string('${trimmedColName}', ${col.length})`
            : `->string('${trimmedColName}')`;
        }
        break;
      case "char":
        definition += col.length
          ? `->char('${trimmedColName}', ${col.length})`
          : `->char('${trimmedColName}')`;
        break;
      case "decimal":
        if (col.precision && col.scale) {
          definition += `->decimal('${trimmedColName}', ${col.precision}, ${col.scale})`;
        } else if (col.precision) {
          definition += `->decimal('${trimmedColName}', ${col.precision})`;
        } else {
          definition += `->decimal('${trimmedColName}')`;
        }
        break;
      case "enum":
        if (col.enumValues) {
          const values = col.enumValues
            .split(",")
            .map((v) => `'${v.trim()}'`)
            .join(", ");
          definition += `->enum('${trimmedColName}', [${values}])`;
        } else {
          definition += `->string('${trimmedColName}')`;
        }
        break;
      case "set":
        if (col.enumValues) {
          const values = col.enumValues
            .split(",")
            .map((v) => `'${v.trim()}'`)
            .join(", ");
          definition += `->set('${trimmedColName}', [${values}])`;
        } else {
          definition += `->string('${trimmedColName}')`;
        }
        break;
      default:
        definition += `->${laravelType}('${trimmedColName}')`;
    }
  }

  // Add column modifiers (but not for id() or foreignId()->constrained())
  if (
    !definition.includes("->id()") &&
    !definition.includes("->constrained(")
  ) {
    if (col.isUnsigned) {
      definition += "->unsigned()";
    }

    if (col.isAutoIncrement) {
      definition += "->autoIncrement()";
    }

    if (col.pk && !definition.includes("->id()")) {
      definition += "->primary()";
    }

    if (col.isUnique && !col.pk) {
      definition += "->unique()";
    }
  }

  // Add nullable for all column types
  if (col.nullable) {
    definition += "->nullable()";
  }

  // Add default value
  if (
    col.defaultValue !== undefined &&
    col.defaultValue !== null &&
    col.defaultValue !== ""
  ) {
    const defaultVal =
      typeof col.defaultValue === "string"
        ? col.defaultValue.trim()
        : col.defaultValue;
    if (typeof defaultVal === "string" && !/^\d+(\.\d+)?$/.test(defaultVal)) {
      definition += `->default('${escapeString(defaultVal)}')`;
    } else {
      definition += `->default(${defaultVal})`;
    }
  }

  // Add comment
  if (col.comment?.trim()) {
    definition += `->comment('${escapeString(col.comment.trim())}')`;
  }

  definition += ";\n";
  return definition;
}

// Helper function to find the actual referenced table from edges
function findReferencedTable(
  columnId: string,
  edges: AppEdge[],
  nodes: AppNode[]
): string | null {
  for (const edge of edges) {
    const getColumnIdFromHandle = (
      handleId: string | null | undefined
    ): string | null => {
      if (!handleId) return null;
      const parts = handleId.split("-");
      return parts.length >= 3 ? parts.slice(0, -2).join("-") : handleId;
    };

    const sourceColumnId = getColumnIdFromHandle(edge.sourceHandle);
    const targetColumnId = getColumnIdFromHandle(edge.targetHandle);

    if (sourceColumnId === columnId) {
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (targetNode) {
        return toLaravelTableName(targetNode.data.label.trim());
      }
    }

    if (targetColumnId === columnId) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode) {
        return toLaravelTableName(sourceNode.data.label.trim());
      }
    }
  }
  return null;
}

function generateIndexDefinition(
  index: Index,
  columns: Column[],
  indent: string
): string {
  if (index.columns.length === 0) return "";

  const columnNames = index.columns
    .map((colId) => columns.find((c) => c.id === colId)?.name?.trim())
    .filter(Boolean);

  if (columnNames.length === 0) return "";

  const columnsStr =
    columnNames.length === 1
      ? `'${columnNames[0]}'`
      : `[${columnNames.map((name) => `'${name}'`).join(", ")}]`;

  let definition = indent;
  const indexName = index.name.trim();

  if (index.isUnique) {
    definition += `$table->unique(${columnsStr}, '${indexName}');\n`;
  } else {
    definition += `$table->index(${columnsStr}, '${indexName}');\n`;
  }

  return definition;
}
