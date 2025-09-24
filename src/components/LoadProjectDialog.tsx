import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importJsonToDb } from "@/lib/backup";
import { showError } from "@/utils/toast";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";

interface LoadProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function LoadProjectDialog({ isOpen, onOpenChange }: LoadProjectDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.g8')) {
        setFile(selectedFile);
      } else {
        showError("Please select a valid .g8 save file.");
        setFile(null);
        if (event.target) event.target.value = "";
      }
    }
  };

  const handleLoad = () => {
    if (!file) {
      showError("Please select a file to load.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      await importJsonToDb(content);
      onOpenChange(false);
      setFile(null);
    };
    reader.onerror = () => {
      showError("Failed to read the file.");
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setFile(null);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Load Save</DialogTitle>
          <DialogDescription>
            Select a grams8 save file (.g8) to load. This will overwrite all current data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="backup-file" className="text-right">
              Save File
            </Label>
            <div className="col-span-3">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : "Choose a file..."}
              </Button>
              <Input
                id="backup-file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".g8"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleLoad} disabled={!file}>Load Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}