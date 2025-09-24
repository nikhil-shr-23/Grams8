import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table as UiTable } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePWA } from "@/hooks/usePWA";
import { exportDbToJson } from "@/lib/backup";
import { colors } from "@/lib/constants";
import { type DatabaseType, type Diagram } from "@/lib/types";
import { useStore, type StoreState } from "@/store/store";
import { formatDistanceToNow } from "date-fns";
import { Database, GitCommitHorizontal, List, LayoutGrid, Pencil, PlusCircle, RotateCcw, Save, Settings, Table as TableIcon, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { AppIntro } from "./AppIntro";
import { Features } from "./Features";
import { CreateDiagramDialog } from "./CreateDiagramDialog";
// import { Features } from "./Features";
import { ImportDialog } from "./ImportDialog";
import { LoadProjectDialog } from "./LoadProjectDialog";
import { RenameDiagramDialog } from "./RenameDiagramDialog";

interface DiagramGalleryProps {
  onInstallAppRequest: () => void;
  onCheckForUpdate: () => void;
  onViewAbout: () => void;
}

export default function DiagramGallery({ onInstallAppRequest, onCheckForUpdate, onViewAbout }: DiagramGalleryProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLoadProjectDialogOpen, setIsLoadProjectDialogOpen] = useState(false);
  const [diagramToEdit, setDiagramToEdit] = useState<Diagram | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    setSelectedDiagramId,
    createDiagram,
    importDiagram,
    renameDiagram,
    moveDiagramToTrash,
    restoreDiagram,
    permanentlyDeleteDiagram,
  } = useStore(
    useShallow((state: StoreState) => ({
      setSelectedDiagramId: state.setSelectedDiagramId,
      createDiagram: state.createDiagram,
      importDiagram: state.importDiagram,
      renameDiagram: state.renameDiagram,
      moveDiagramToTrash: state.moveDiagramToTrash,
      restoreDiagram: state.restoreDiagram,
      permanentlyDeleteDiagram: state.permanentlyDeleteDiagram,
    }))
  );

  const diagrams = useStore((state) => state.diagrams);

  const { setTheme } = useTheme();
  const { isInstalled } = usePWA();

  const activeDiagrams = diagrams?.filter(d => !d.deletedAt);
  const trashedDiagrams = diagrams?.filter(d => d.deletedAt);

  const handleCreateDiagram = async ({ name, dbType }: { name: string; dbType: DatabaseType }) => {
    await createDiagram({
      name,
      dbType,
      data: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    });
  };

  const handleImportDiagram = async (diagramData: { name: string; dbType: DatabaseType; data: Diagram['data'] }) => {
    await importDiagram(diagramData);
  };

  const openRenameDialog = (diagram: Diagram) => {
    setDiagramToEdit(diagram);
    setIsRenameDialogOpen(true);
  };

  const dbTypeDisplay: Record<DatabaseType, string> = {
    postgres: "PostgreSQL",
    mysql: "MySQL",
  };

  return (
    <div className="p-4 md:p-8 h-full w-full bg-background overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <AppIntro
          onCreate={() => setIsCreateDialogOpen(true)}
          onExplore={() => setShowFeatures((prev) => !prev)}
        />

        {showFeatures && (
          <div id="features" className="my-6 md:my-10">
            <Features />
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-8 md:mt-12">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Diagrams</h1>
          <div className="flex gap-2 items-center self-end md:self-center">
            {/* View toggle */}
            <div className="hidden md:flex gap-1" role="group" aria-label="View mode">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className="h-8 w-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* New Diagram primary + dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">New Diagram</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                  Blank Diagram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                  New from Import
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Save/Load and settings */}
            <Button variant="outline" onClick={exportDbToJson}>
              <Save className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Save Data</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsLoadProjectDialogOpen(true)}>Load Save</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCheckForUpdate}>Check for Updates</DropdownMenuItem>
                {!isInstalled && (
                  <DropdownMenuItem onClick={onInstallAppRequest}>Install App</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onViewAbout}>About</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="diagrams" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="diagrams" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Diagrams</TabsTrigger>
            <TabsTrigger value="trash" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Trash</TabsTrigger>
          </TabsList>
          <TabsContent value="diagrams" className="mt-6">
            {activeDiagrams && activeDiagrams.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {activeDiagrams.map((diagram) => (
                    <div key={diagram.id} className="relative group">
                      <Card
                        className="hover:shadow-lg hover:border-primary transition-all cursor-pointer flex flex-col h-full overflow-hidden"
                        onClick={() => setSelectedDiagramId(diagram.id!)}
                      >
                        <div style={{ backgroundColor: diagram.data.nodes?.[0]?.data.color || colors.DEFAULT_DIAGRAM_COLOR }} className="h-2 w-full" />
                        <CardHeader>
                          <CardTitle className="truncate">{diagram.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 pt-1">
                            <Database className="h-4 w-4" />
                            {dbTypeDisplay[diagram.dbType]}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <TableIcon className="h-4 w-4" />
                            <span>{diagram.data.nodes?.filter(n => !n.data.isDeleted).length || 0} Tables</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GitCommitHorizontal className="h-4 w-4" />
                            <span>{diagram.data.edges?.length || 0} Relationships</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <p className="text-xs text-muted-foreground">
                            Updated {formatDistanceToNow(new Date(diagram.updatedAt), { addSuffix: true })}
                          </p>
                        </CardFooter>
                      </Card>
                      <div className="absolute top-4 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openRenameDialog(diagram)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will move the "{diagram.name}" diagram to the trash. You can restore it later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => moveDiagramToTrash(diagram.id!)}>Move to Trash</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <UiTable>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeDiagrams.map((diagram) => (
                        <TableRow key={diagram.id} className="cursor-pointer" onClick={() => setSelectedDiagramId(diagram.id!)}>
                          <TableCell className="font-medium">{diagram.name}</TableCell>
                          <TableCell className="text-muted-foreground">{dbTypeDisplay[diagram.dbType]}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDistanceToNow(new Date(diagram.updatedAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openRenameDialog(diagram); }}>
                              <Pencil className="h-4 w-4 mr-2" /> Rename
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will move the "{diagram.name}" diagram to the trash. You can restore it later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => moveDiagramToTrash(diagram.id!)}>Move to Trash</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </UiTable>
                </Card>
              )
            ) : (
              <div className="text-center py-24 border-2 border-dashed rounded-lg">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md border">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">You have no diagrams yet</h2>
                <p className="text-muted-foreground mt-2 mb-4">
                  Start by creating a new diagram.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>New Diagram</Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="trash" className="mt-6">
            {trashedDiagrams && trashedDiagrams.length > 0 ? (
              <Card>
                <UiTable>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Deleted At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trashedDiagrams.map((diagram) => (
                      <TableRow key={diagram.id}>
                        <TableCell className="font-medium">{diagram.name}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(diagram.deletedAt!), { addSuffix: true })}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => restoreDiagram(diagram.id!)}>
                            <RotateCcw className="h-4 w-4 mr-2" /> Restore
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the "{diagram.name}" diagram and all of its data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => permanentlyDeleteDiagram(diagram.id!)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </UiTable>
              </Card>
            ) : (
              <div className="text-center py-24 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">Trash is empty</h2>
                <p className="text-muted-foreground mt-2">Deleted diagrams will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateDiagramDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateDiagram={handleCreateDiagram}
      />
      <ImportDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportDiagram={handleImportDiagram}
      />
      <RenameDiagramDialog
        isOpen={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onRenameDiagram={renameDiagram}
        diagram={diagramToEdit}
      />
      <LoadProjectDialog
        isOpen={isLoadProjectDialogOpen}
        onOpenChange={setIsLoadProjectDialogOpen}
      />
    </div>
  );
}