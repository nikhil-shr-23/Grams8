import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistered, setSWRegistered] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        setSWRegistered(!!registration);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed bottom-2 left-2 flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity z-10">
      {isOnline ? (
        <Wifi className="h-2.5 w-2.5 text-green-500" />
      ) : (
        <WifiOff className="h-2.5 w-2.5 text-red-500" />
      )}
      {swRegistered && (
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" title="PWA Active" />
      )}
    </div>
  );
}