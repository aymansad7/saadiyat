/**
 * Coastal Atelier — App shell
 * Routes:
 *   /                     → Landing (Saadiyat overview, choose community)
 *   /st-regis             → St. Regis Villas explorer (filter + map + cards)
 *   /st-regis/villa/:id   → Single villa detail page
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import StRegis from "./pages/StRegis";
import VillaDetail from "./pages/VillaDetail";
import Jawaher from "./pages/Jawaher";
import SaadiyatBeachVillas from "./pages/SaadiyatBeachVillas";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/st-regis" component={StRegis} />
      <Route path="/st-regis/villa/:id" component={VillaDetail} />
      <Route path="/jawaher" component={Jawaher} />
      <Route path="/saadiyat-beach-villas" component={SaadiyatBeachVillas} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
