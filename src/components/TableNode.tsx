import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { colors } from "@/lib/constants";
import { type TableNodeData } from "@/lib/types";
import {
  Handle,
  Position,
  useUpdateNodeInternals,
  type NodeProps,
} from "@xyflow/react";
import { Key, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  PopoverWithArrow,
  PopoverWithArrowContent,
  PopoverWithArrowTrigger,
} from "./ui/popover-with-arrow";

interface TableNodeProps extends NodeProps {
  data: TableNodeData;
  onDelete?: (ids: string[]) => void;
}

function TableNode({
  id,
  data,
  selected,
  onDelete,
}: TableNodeProps) {
  const updateNodeInternals = useUpdateNodeInternals();
  const prevColumnsRef = useRef(data.columns);

  useEffect(() => {
    if (prevColumnsRef.current !== data.columns) {
      updateNodeInternals(id);
      prevColumnsRef.current = data.columns;
    }
  }, [id, data.columns, updateNodeInternals]);

  const cardStyle = {
    border: `1px solid ${selected ? data.color || colors.DEFAULT_TABLE_COLOR : "hsl(var(--border))"
      }`,
    boxShadow: selected
      ? `0 0 8px ${data.color || colors.DEFAULT_TABLE_COLOR}40`
      : "var(--tw-shadow, 0 0 #0000)",
    width: 288,
  };

  const handleStyle = {
    opacity: selected ? 1 : 0,
    transition: "opacity 0.15s ease-in-out",
  };

  const getColumnNameById = (id: string) => {
    return data.columns.find((c) => c.id === id)?.name || "unknown";
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          className="shadow-md react-flow__node-default bg-card group"
          style={cardStyle}
        >
          <CardHeader className="p-0 cursor-move relative">
            <div
              style={{
                height: "6px",
                backgroundColor: data.color || colors.DEFAULT_TABLE_COLOR,
                borderTopLeftRadius: "calc(var(--radius) - 1px)",
                borderTopRightRadius: "calc(var(--radius) - 1px)",
              }}
            ></div>
            <CardTitle className="text-sm text-center font-semibold p-2">
              {data.label}
            </CardTitle>
            <PopoverWithArrow>
              <PopoverWithArrowTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverWithArrowTrigger>
              <PopoverWithArrowContent
                side="top"
                align="center"
                className="z-[10000]"
              >
                <div className="space-y-2">
                  {data.comment && (
                    <div>
                      <p className="font-semibold text-foreground">Comment:</p>
                      <p className="text-muted-foreground break-words">
                        {data.comment}
                      </p>
                    </div>
                  )}
                  {data.indices && data.indices.length > 0 && (
                    <div>
                      <p className="font-semibold text-foreground mb-1">Indices:</p>
                      <div className="space-y-1">
                        {data.indices.map((index) => (
                          <div key={index.id} className="text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-foreground truncate">
                                {index.name}
                              </span>
                              {index.isUnique && (
                                <Badge
                                  variant="outline"
                                  className="px-1 py-0 text-[10px]"
                                >
                                  Unique
                                </Badge>
                              )}
                            </div>
                            <p className="break-all">
                              ({index.columns.map(getColumnNameById).join(", ")})
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Separator />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full h-auto py-1 px-2 text-xs"
                    onClick={() => onDelete?.([id])}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete Table
                  </Button>
                </div>
              </PopoverWithArrowContent>
            </PopoverWithArrow>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {data.columns?.map((col) => (
              <TooltipProvider key={col.id} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative flex justify-between items-center text-xs py-1.5 px-4">
                      <Handle
                        type="target"
                        position={Position.Left}
                        id={`${col.id}-left-target`}
                        style={{
                          ...handleStyle,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: data.color || colors.DEFAULT_TABLE_COLOR,
                        }}
                        className="!w-2.5 !h-2.5"
                      />
                      <Handle
                        type="source"
                        position={Position.Left}
                        id={`${col.id}-left-source`}
                        style={{
                          ...handleStyle,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: data.color || colors.DEFAULT_TABLE_COLOR,
                        }}
                        className="!w-2.5 !h-2.5"
                      />
                      <div className="flex items-center gap-1 truncate">
                        {col.pk && (
                          <Key className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                        )}
                        <span className="truncate">{col.name}</span>
                        {col.nullable && (
                          <span className="text-muted-foreground font-mono -ml-1 mr-1">
                            ?
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-muted-foreground">
                        {col.type}
                      </span>
                      <Handle
                        type="target"
                        position={Position.Right}
                        id={`${col.id}-right-target`}
                        style={{
                          ...handleStyle,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: data.color || colors.DEFAULT_TABLE_COLOR,
                        }}
                        className="!w-2.5 !h-2.5"
                      />
                      <Handle
                        type="source"
                        position={Position.Right}
                        id={`${col.id}-right-source`}
                        style={{
                          ...handleStyle,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: data.color || colors.DEFAULT_TABLE_COLOR,
                        }}
                        className="!w-2.5 !h-2.5"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="start"
                    className="z-[10000] w-48 p-1.5 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-semibold">
                        <span>{col.name}</span>
                        <span className="text-primary">{col.type}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {col.pk && <Badge variant="outline">Primary</Badge>}
                        {col.isUnique && <Badge variant="outline">Unique</Badge>}
                        {col.nullable === false && (
                          <Badge variant="outline">Not Null</Badge>
                        )}
                        {col.isAutoIncrement && (
                          <Badge variant="outline">Autoincrement</Badge>
                        )}
                        {col.isUnsigned && (
                          <Badge variant="outline">Unsigned</Badge>
                        )}
                      </div>
                      {col.type.toUpperCase() === "ENUM" && col.enumValues && (
                        <div>
                          <p className="font-semibold text-foreground">Enum:</p>
                          <p className="text-muted-foreground break-all">
                            {col.enumValues}
                          </p>
                        </div>
                      )}
                      <div className="space-y-0.5 text-muted-foreground">
                        <p>
                          <span className="font-semibold text-foreground">
                            Default:
                          </span>{" "}
                          {col.defaultValue || "Not set"}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">
                            Comment:
                          </span>{" "}
                          {col.comment || "Not set"}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onSelect={() => onDelete?.([id])}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Delete Table
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default TableNode;