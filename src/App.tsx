import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { PWAStatus } from "./components/PWAStatus";
import { StoreInitializer } from "./components/StoreInitializer";

const queryClient = new QueryClient();

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  const [isInstallPromptForced, setIsInstallPromptForced] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoreInitializer />
        <Toaster />
        <Sonner />
        <PWAStatus />
        <PWAInstallPrompt
          isForced={isInstallPromptForced}
          onDismiss={() => setIsInstallPromptForced(false)}
        />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route
                path="/"
                element={<Index onInstallAppRequest={() => setIsInstallPromptForced(true)} />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;