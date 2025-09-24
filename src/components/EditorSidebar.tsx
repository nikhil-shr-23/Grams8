import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DbRelationship } from "@/lib/constants";
import { type AppNode } from "@/lib/types";
import { useStore, type StoreState } from "@/store/store";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  GitCommitHorizontal,
  GripVertical,
  Plus,
  Table,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import EdgeInspectorPanel from "./EdgeInspectorPanel";
import EditorMenubar from "./EditorMenubar";
import TableAccordionContent from "./TableAccordionContent";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface EditorSidebarProps {
  onAddTable: () => void;
  onAddNote: () => void;
  onAddZone: () => void;
  onSetSidebarState: (state: "docked" | "hidden") => void;
  onExport: () => void;
  onCheckForUpdate: () => void;
  onInstallAppRequest: () => void;
  onViewShortcuts: () => void;
  onViewAbout: () => void;
}

function SortableAccordionItem({
  node,
  children,
}: {
  node: AppNode;
  children: (
    attributes: Record<string, unknown>,
    listeners: Record<string, unknown>
  ) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: node.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(
        attributes as unknown as Record<string, unknown>,
        listeners || {}
      )}
    </div>
  );
}

export default function EditorSidebar({
  onAddTable,
  onAddNote,
  onAddZone,
  onSetSidebarState,
  onExport,
  onCheckForUpdate,
  onInstallAppRequest,
  onViewShortcuts,
  onViewAbout,
}: EditorSidebarProps) {
  const selectedDiagramId = useStore((state) => state.selectedDiagramId);
  const allDiagrams = useStore((state) => state.diagrams);
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useStore((state) => state.setSelectedNodeId);
  const selectedEdgeId = useStore((state) => state.selectedEdgeId)

  const diagram = useMemo(() =>
    allDiagrams.find((d) => d.id === selectedDiagramId),
    [allDiagrams, selectedDiagramId]
  );

  const {
    updateNode,
    batchUpdateNodes,
  } = useStore(
    useShallow((state: StoreState) => ({
      updateNode: state.updateNode,
      batchUpdateNodes: state.batchUpdateNodes,
    }))
  );

  const [editingTableName, setEditingTableName] = useState<string | null>(null);
  const [tableName, setTableName] = useState("");
  const [currentInspectorTab, setCurrentInspectorTab] = useState("tables");
  const [inspectingEdgeId, setInspectingEdgeId] = useState<string | null>(null);
  const [tableFilter, setTableFilter] = useState<string>("");
  const [relationshipFilter, setRelationshipFilter] = useState<string>("");

  const sortedNodesFromStore = useMemo(
    () =>
      (diagram?.data.nodes ?? [])
        .filter((n) => !n.data.isDeleted)
        .sort(
          (a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity)
        ),
    [diagram?.data.nodes]
  );

  const [nodes, setNodes] = useState<AppNode[]>(sortedNodesFromStore);

  useEffect(() => {
    setNodes(sortedNodesFromStore);
  }, [sortedNodesFromStore]);

  const edges = useMemo(() => diagram?.data.edges ?? [], [diagram?.data.edges]);
  const isLocked = useMemo(() => diagram?.data.isLocked ?? false, [diagram?.data.isLocked]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (selectedNodeId && nodes.some((n) => n.id === selectedNodeId)) {
      setCurrentInspectorTab("tables");
    }
  }, [selectedNodeId, nodes]);

  useEffect(() => {
    if (selectedEdgeId && edges.some((n) => n.id === selectedEdgeId)) {
      setCurrentInspectorTab("relationships");
      setInspectingEdgeId(selectedEdgeId)
    } else if (!selectedEdgeId) {
      setInspectingEdgeId(null);
    }
  }, [selectedEdgeId, edges]);

  const filteredTables = useMemo(() => {
    if (!tableFilter) return nodes;
    return nodes.filter((node) =>
      node.data.label.toLowerCase().includes(tableFilter.toLowerCase())
    );
  }, [nodes, tableFilter]);

  const filteredRels = useMemo(() => {
    if (!relationshipFilter) return edges;
    const filter = relationshipFilter.toLowerCase();
    return edges.filter((edge) => {
      const sourceNode = sortedNodesFromStore.find(
        (n) => n.id === edge.source
      );
      const targetNode = sortedNodesFromStore.find(
        (n) => n.id === edge.target
      );
      if (!sourceNode || !targetNode) return false;

      const sourceName = sourceNode.data.label.toLowerCase();
      const targetName = targetNode.data.label.toLowerCase();
      const relationshipLabel = `${sourceName} to ${targetName}`;
      const relationshipType = edge.data?.relationship || "";

      return (
        relationshipLabel.includes(filter) || relationshipType.includes(filter)
      );
    });
  }, [edges, sortedNodesFromStore, relationshipFilter]);

  const handleInspectorTabChange = (tab: string) => {
    setCurrentInspectorTab(tab);
  };

  const handleStartEdit = (node: AppNode) => {
    setEditingTableName(node.id);
    setTableName(node.data.label);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableName(e.target.value);
  };

  const handleNameSave = (node: AppNode) => {
    updateNode({ ...node, data: { ...node.data, label: tableName } });
    setEditingTableName(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = nodes.findIndex((n) => n.id === active.id);
      const newIndex = nodes.findIndex((n) => n.id === over.id);

      const reorderedNodes = arrayMove(nodes, oldIndex, newIndex);
      setNodes(reorderedNodes);

      const nodesToUpdate = reorderedNodes.map((node, index) => ({
        ...node,
        data: {
          ...node.data,
          order: index,
        },
      }));

      batchUpdateNodes(nodesToUpdate);
    }
  };
  const inspectingEdge = edges.find((e) => e.id === inspectingEdgeId);

  if (!diagram) return null;

  return (
    <div className="h-full w-full flex flex-col bg-card" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center border-b pl-2 flex-shrink-0">
        <img
          src="/placeholder.svg"
          alt="grams8 Logo"
          className="h-5 w-5 mr-2 flex-shrink-0"
        />
        <EditorMenubar
          onAddTable={onAddTable}
          onAddNote={onAddNote}
          onAddZone={onAddZone}
          onSetSidebarState={onSetSidebarState}
          onExport={onExport}
          onCheckForUpdate={onCheckForUpdate}
          onInstallAppRequest={onInstallAppRequest}
          onViewShortcuts={onViewShortcuts}
          onViewAbout={onViewAbout}
        />
      </div>
      <div className="p-2 flex-shrink-0 border-b">
        <h3 className="text-lg font-semibold tracking-tight px-2">
          {diagram.name}
        </h3>
        <p className="text-sm text-muted-foreground px-2">{diagram.dbType}</p>
      </div>
      <Tabs
        value={currentInspectorTab}
        onValueChange={handleInspectorTabChange}
        className="flex-grow flex flex-col min-h-0"
      >
        <div className="flex-shrink-0 px-4 my-4">
          <div className="flex items-center gap-2">
            <TabsList className="grid flex-grow grid-cols-2">
              <TabsTrigger value="tables">
                <Table className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">Tables</span>
                <span className="lg:hidden">Tbls</span>
                <span>&nbsp;({nodes.length})</span>
              </TabsTrigger>
              <TabsTrigger value="relationships">
                <GitCommitHorizontal className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">Relations</span>
                <span className="lg:hidden">Rels</span>
                <span>&nbsp;({edges.length})</span>
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="icon"
              onClick={onAddTable}
              disabled={isLocked}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Table</span>
            </Button>
          </div>
        </div>
        <div className="flex-grow min-h-0">
          <TabsContent value="tables" className="m-0 h-full">
            <div className="px-4 pb-2 flex-shrink-0">
              <div className="relative">
                <Input
                  placeholder="Filter tables..."
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="pr-8"
                />
                {tableFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setTableFilter("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <ScrollArea className="h-full px-4">
              {filteredTables.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredTables.map((n) => n.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Accordion
                      type="single"
                      collapsible
                      value={selectedNodeId ?? ""}
                      onValueChange={(value) => setSelectedNodeId(value || null)}
                      className="w-full"
                    >
                      {filteredTables.map((node) => (
                        <SortableAccordionItem key={node.id} node={node}>
                          {(attributes, listeners) => (
                            <AccordionItem
                              value={node.id}
                              className="border rounded-md mb-1 data-[state=open]:bg-accent/50"
                            >
                              <AccordionTrigger className="px-2 group hover:no-underline">
                                <div className="flex items-center gap-2 w-full">
                                  <div
                                    {...attributes}
                                    {...(isLocked ? {} : listeners)}
                                    className={
                                      isLocked
                                        ? "cursor-not-allowed p-1 -ml-1"
                                        : "cursor-grab p-1 -ml-1"
                                    }
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: node.data.color }}
                                  />
                                  {editingTableName === node.id ? (
                                    <Input
                                      value={tableName}
                                      onChange={handleNameChange}
                                      onBlur={() => handleNameSave(node)}
                                      onKeyDown={(e) =>
                                        e.key === "Enter" && handleNameSave(node)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-8"
                                      autoFocus
                                    />
                                  ) : (
                                    <span
                                      className="truncate"
                                      onDoubleClick={
                                        isLocked
                                          ? undefined
                                          : () => handleStartEdit(node)
                                      }
                                    >
                                      {node.data.label}
                                    </span>
                                  )}
                                  <div className="flex-grow" />
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <TableAccordionContent
                                  node={node}
                                  onStartEdit={() => handleStartEdit(node)}
                                />
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </SortableAccordionItem>
                      ))}
                    </Accordion>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-10">
                  {tableFilter ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        No tables found matching your filter.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setTableFilter("")}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear Filter
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tables in this diagram yet.
                    </p>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="relationships" className="m-0 h-full">
            <ScrollArea className="h-full p-4">
              {inspectingEdge ? (
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => setInspectingEdgeId(null)}
                    className="mb-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to list
                  </Button>
                  <EdgeInspectorPanel
                    edge={inspectingEdge}
                    nodes={nodes}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="px-4 mt-1 pb-2 flex-shrink-0">
                    <div className="relative">
                      <Input
                        placeholder="Filter relationships..."
                        value={relationshipFilter}
                        onChange={(e) => setRelationshipFilter(e.target.value)}
                        className="pr-8"
                      />
                      {relationshipFilter && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                          onClick={() => setRelationshipFilter("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {filteredRels.length > 0 ? (
                    filteredRels.map((edge) => {
                      const sourceNode = nodes.find((n) => n.id === edge.source);
                      const targetNode = nodes.find((n) => n.id === edge.target);
                      return (
                        <Button
                          key={edge.id}
                          variant="ghost"
                          className="w-full justify-start h-auto py-2"
                          onClick={() => setInspectingEdgeId(edge.id)}
                        >
                          <GitCommitHorizontal className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div className="text-left text-sm">
                            <p className="font-semibold">
                              {sourceNode?.data.label} to {targetNode?.data.label}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {edge.data?.relationship ?? DbRelationship.ONE_TO_MANY}
                            </p>
                          </div>
                        </Button>
                      );
                    })
                  ) : (
                    <div className="text-center py-10">
                      {relationshipFilter ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            No relationships found matching your filter.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => setRelationshipFilter("")}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filter
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No relationships in this diagram yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}