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
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { usePWA } from "@/hooks/usePWA";
import { exportDbToJson } from "@/lib/backup";
import { CtrlKey, KeyboardShortcuts } from "@/lib/constants";
import { useStore, type StoreState } from "@/store/store";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

interface EditorMenubarProps {
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

export default function EditorMenubar({
  onAddTable,
  onAddNote,
  onAddZone,
  onSetSidebarState,
  onExport,
  onCheckForUpdate,
  onInstallAppRequest,
  onViewShortcuts,
  onViewAbout,
}: EditorMenubarProps) {
  const selectedDiagramId = useStore((state) => state.selectedDiagramId);
  const allDiagrams = useStore((state) => state.diagrams);

  const diagram = useMemo(() =>
    allDiagrams.find(d => d.id === selectedDiagramId),
    [allDiagrams, selectedDiagramId]
  );

  const {
    moveDiagramToTrash,
    setSelectedDiagramId,
    undoDelete,
    settings,
    updateSettings
  } = useStore(
    useShallow((state: StoreState) => ({
      moveDiagramToTrash: state.moveDiagramToTrash,
      setSelectedDiagramId: state.setSelectedDiagramId,
      undoDelete: state.undoDelete,
      settings: state.settings,
      updateSettings: state.updateSettings,
    }))
  );

  const { setTheme } = useTheme();
  const { isInstalled } = usePWA();

  if (!diagram) return null;
  const isLocked = diagram.data.isLocked ?? false;

  const handleDeleteDiagram = () => {
    if (diagram) {
      moveDiagramToTrash(diagram.id!);
      setSelectedDiagramId(null);
    }
  };

  const onBackToGallery = () => {
    setSelectedDiagramId(null);
  };

  return (
    <Menubar className="rounded-none border-none bg-transparent">
      <MenubarMenu>
        <MenubarTrigger className="px-2">File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onBackToGallery}>
            Back to Gallery
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={onExport}>Export Diagram</MenubarItem>
          <MenubarItem onClick={exportDbToJson}>Save Data</MenubarItem>
          <MenubarSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <MenubarItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive focus:text-destructive"
                disabled={isLocked}
              >
                Delete Diagram
              </MenubarItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will move the "{diagram.name}" diagram to the trash. You can restore it later from the gallery.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteDiagram}>Move to Trash</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="px-2">Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={undoDelete} disabled={isLocked}>
            Undo Delete Table <MenubarShortcut>{CtrlKey} + {KeyboardShortcuts.UNDO_TABLE_DELETE.toUpperCase()}</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={onAddTable} disabled={isLocked}>
            Add Table <MenubarShortcut>{CtrlKey} + {KeyboardShortcuts.ADD_NEW_TABLE.toUpperCase()}</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={onAddNote} disabled={isLocked}>
            Add Note
          </MenubarItem>
          <MenubarItem onClick={onAddZone} disabled={isLocked}>
            Add Zone
          </MenubarItem>
          <MenubarSeparator />
          <MenubarCheckboxItem
            checked={settings.snapToGrid}
            onCheckedChange={(checked) => updateSettings({ snapToGrid: checked })}
          >
            Snap To Editor Grid
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="px-2">View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => onSetSidebarState("hidden")}>
            Hide Sidebar
          </MenubarItem>
          <MenubarItem onClick={onViewShortcuts}>
            View Shortcuts
          </MenubarItem>
          <MenubarSeparator />
          <MenubarCheckboxItem
            checked={settings.rememberLastPosition}
            onCheckedChange={(checked) => updateSettings({ rememberLastPosition: checked })}
          >
            Remember Last Editor Position
          </MenubarCheckboxItem>
          <MenubarSeparator />
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="px-2">Settings</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Theme</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => setTheme("light")}>
                Light
              </MenubarItem>
              <MenubarItem onClick={() => setTheme("dark")}>
                Dark
              </MenubarItem>
              <MenubarItem onClick={() => setTheme("system")}>
                System
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem onClick={onCheckForUpdate}>
            Check for Updates
          </MenubarItem>
          {!isInstalled && (
            <MenubarItem onClick={onInstallAppRequest}>
              Install App
            </MenubarItem>
          )}
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="px-2">Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onViewAbout}>About</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}