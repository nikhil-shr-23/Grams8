import { markAppInstalled } from "@/utils/pwaUtils";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isInWebAppiOS = window.navigator.standalone === true;
    const installed = isStandalone || isInWebAppiOS;

    setIsInstalled(installed);

    if (installed) {
      markAppInstalled();
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!installed) {
        setIsInstallable(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      markAppInstalled();
    };

    const handleSWUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("sw-update-available", handleSWUpdate);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("sw-update-available", handleSWUpdate);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      alert(
        'To install this app:\n\n1. Click the menu button (⋮) in your browser\n2. Select "Install grams8" or "Add to Home Screen"'
      );
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error installing app:", error);
      return false;
    }
  };

  const reloadApp = () => {
    const updateSW = window.updateSW;
    if (updateSW) {
      updateSW(true);
    } else {
      window.location.reload();
    }
  };

  return {
    isInstallable,
    isInstalled,
    updateAvailable,
    installApp,
    reloadApp,
  };
}
