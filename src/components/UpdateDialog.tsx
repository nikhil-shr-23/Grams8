import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePWA } from '@/hooks/usePWA';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
const gitHash = typeof __GIT_HASH__ !== 'undefined' ? __GIT_HASH__ : '';
const displayVersion = gitHash && gitHash !== 'N/A' ? `${appVersion} (${gitHash})` : appVersion;

interface UpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type UpdateStatus = 'idle' | 'checking' | 'no-update' | 'update-found';

export function UpdateDialog({ isOpen, onOpenChange }: UpdateDialogProps) {
  const { updateAvailable, reloadApp } = usePWA();
  const [status, setStatus] = useState<UpdateStatus>('idle');

  useEffect(() => {
    if (updateAvailable) {
      setStatus('update-found');
    }
  }, [updateAvailable]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setStatus('idle'), 300);
    }
  }, [isOpen]);

  const handleCheckForUpdate = async () => {
    setStatus('checking');
    const updateSW = (window).updateSW;

    if (!updateSW) {
      console.error("Service worker update function not found.");
      setStatus('no-update');
      return;
    }

    let updateFound = false;
    const handleUpdateFound = () => {
      updateFound = true;
      setStatus('update-found');
    };

    window.addEventListener('sw-update-available', handleUpdateFound, { once: true });

    try {
      await updateSW(false);
      // If updateSW() completes and the event hasn't fired, there's no update.
      if (!updateFound) {
        setStatus('no-update');
      }
    } catch (error) {
      console.error("Error checking for PWA update:", error);
      setStatus('no-update');
    } finally {
      // Clean up the listener regardless of outcome
      window.removeEventListener('sw-update-available', handleUpdateFound);
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Checking for updates...
          </div>
        );
      case 'no-update':
        return (
          <div className="flex items-center justify-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            You are on the latest version.
          </div>
        );
      case 'update-found':
        return (
          <div className="flex items-center justify-center text-blue-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            A new version is available!
          </div>
        );
      case 'idle':
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check for Updates</DialogTitle>
          <DialogDescription>
            Manage application updates and version information.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {appVersion && appVersion !== '0.0.0' && (
            <div className="text-sm text-center">
              Current Version: <span className="font-semibold">{displayVersion}</span>
            </div>
          )}
          <div className="h-6 flex items-center justify-center">
            {renderStatus()}
          </div>
        </div>
        <DialogFooter>
          {status === 'update-found' ? (
            <Button onClick={reloadApp} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Update and Restart
            </Button>
          ) : (
            <Button onClick={handleCheckForUpdate} disabled={status === 'checking'} className="w-full">
              {status === 'checking' ? 'Checking...' : 'Check for Updates'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}