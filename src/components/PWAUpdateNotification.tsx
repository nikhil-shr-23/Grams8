import { usePWA } from '@/hooks/usePWA';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

interface PWAUpdateNotificationProps {
  onUpdateNow: () => void;
}

export function PWAUpdateNotification({ onUpdateNow }: PWAUpdateNotificationProps) {
  const { updateAvailable } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  const handleUpdate = () => {
    onUpdateNow();
    setDismissed(true);
  };

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-background border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <RefreshCw className="h-5 w-5 text-blue-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Update Available</h3>
          <p className="text-xs text-muted-foreground mt-1">
            A new version of grams8 is available
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUpdate}
              className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}