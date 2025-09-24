import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CtrlKey, KeyboardShortcuts } from "@/lib/constants";

interface ShortcutsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const shortcuts = [
  { command: "Add Table", keys: [CtrlKey, KeyboardShortcuts.ADD_NEW_TABLE.toUpperCase()] },
  { command: "Toggle Sidebar", keys: [CtrlKey, KeyboardShortcuts.SIDEBAR_TOGGLE.toUpperCase()] },
  { command: "Undo Delete Table", keys: [CtrlKey, KeyboardShortcuts.UNDO_TABLE_DELETE.toUpperCase()] },
  { command: "Copy Selection", keys: [CtrlKey, KeyboardShortcuts.COPY_SELECTION.toUpperCase()] },
  { command: "Paste Selection", keys: [CtrlKey, KeyboardShortcuts.PASTE_COPIED.toUpperCase()] },
  { command: "Select Multiple Nodes", keys: [CtrlKey, KeyboardShortcuts.SELECT_MULTIPLE] },
  { command: "Delete Table, Notes, Zones", keys: [KeyboardShortcuts.DELETE_ELEMENT] },
];

export function ShortcutsDialog({ isOpen, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to speed up your workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Command</TableHead>
                <TableHead className="text-right">Shortcut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortcuts.map((shortcut) => (
                <TableRow key={shortcut.command}>
                  <TableCell>{shortcut.command}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {shortcut.keys.map((key, index) => (
                        <Kbd key={index}>{key}</Kbd>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}