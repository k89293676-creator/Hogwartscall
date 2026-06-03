import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MagicalBackground } from "@/components/MagicalBackground";
import { WandCursor } from "@/components/WandCursor";
import HomePage from "@/pages/HomePage";
import Room from "@/pages/Room";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { loadSettings } from "@/components/SettingsPanel";
import type { BackgroundQuality } from "@/components/SettingsPanel";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/room/:roomId" component={Room} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [backgroundQuality, setBackgroundQuality] = useState<BackgroundQuality>(loadSettings().backgroundQuality);
  const [wandEnabled, setWandEnabled] = useState(loadSettings().wandCursorEnabled);

  // Listen for settings updates from localStorage (settings saved by SettingsPanel)
  useEffect(() => {
    const handler = () => {
      const s = loadSettings();
      setBackgroundQuality(s.backgroundQuality);
      setWandEnabled(s.wandCursorEnabled);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MagicalBackground quality={backgroundQuality} />
        <WandCursor enabled={wandEnabled} />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
