import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Github } from "lucide-react";

const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
const gitHash = typeof __GIT_HASH__ !== 'undefined' ? __GIT_HASH__ : '';
const displayVersion = gitHash && gitHash !== 'N/A' ? `${appVersion} (${gitHash})` : appVersion;

interface AboutDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AboutDialog({ isOpen, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="h-16 w-16 mb-2 bg-white rounded-md flex items-center justify-center shadow border">
            <span className="text-black font-bold text-2xl">G8</span>
          </div>
          <DialogTitle className="text-2xl">grams8</DialogTitle>
          <DialogDescription>
            Visualize your database schema with an intuitive drag-and-drop editor.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center text-sm text-muted-foreground">
          <p>Version: {displayVersion}</p>
          <p>Crafted with ❤️ by Nikhil Sharma</p>
        </div>
        <div className="flex justify-center">
          <a href="https://github.com/nikhil-shr-23/grams8" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Github className="h-4 w-4 mr-2" />
              View on GitHub
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}