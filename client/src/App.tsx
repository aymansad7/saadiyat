/**
 * Coastal Atelier — App shell
 *
 * Routes:
 *   /resale-search  → PUBLIC. The "filter from outside" so anyone landing on
 *                     the site can immediately see what's available across
 *                     every area without entering the passcode.
 *   everything else → Behind the PasswordGate (members area).
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PasswordGate from "./components/PasswordGate";
import Landing from "./pages/Landing";
import StRegis from "./pages/StRegis";
import VillaDetail from "./pages/VillaDetail";
import Jawaher from "./pages/Jawaher";
import SaadiyatBeachVillas from "./pages/SaadiyatBeachVillas";
import SaadiyatLagoons from "./pages/SaadiyatLagoons";
import LagoonsCluster from "./pages/LagoonsCluster";
import LagoonsVillaDetail from "./pages/LagoonsVillaDetail";
import Documents from "./pages/Documents";
import AldarSaadiyat from "./pages/AldarSaadiyat";
import AldarProject from "./pages/AldarProject";
import AldarBuilding from "./pages/AldarBuilding";
import AldarUnit from "./pages/AldarUnit";
import AldarOther from "./pages/AldarOther";
import AldarOtherProject from "./pages/AldarOtherProject";
import AldarOtherBuilding from "./pages/AldarOtherBuilding";
import AldarOtherUnit from "./pages/AldarOtherUnit";
import AdminPage from "./pages/Admin";
import Resale from "./pages/Resale";
import PublicResaleSearch from "./pages/PublicResaleSearch";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/st-regis" component={StRegis} />
      <Route path="/st-regis/villa/:id" component={VillaDetail} />
      <Route path="/jawaher" component={Jawaher} />
      <Route path="/saadiyat-beach-villas" component={SaadiyatBeachVillas} />
      <Route path="/saadiyat-lagoons" component={SaadiyatLagoons} />
      <Route path="/saadiyat-lagoons/:cluster/:unit" component={LagoonsVillaDetail} />
      <Route path="/saadiyat-lagoons/:cluster" component={LagoonsCluster} />
      <Route path="/documents" component={Documents} />
      <Route path="/aldar-saadiyat" component={AldarSaadiyat} />
      <Route path="/aldar-saadiyat/:project/:building/:unit" component={AldarUnit} />
      <Route path="/aldar-saadiyat/:project/:building" component={AldarBuilding} />
      <Route path="/aldar-saadiyat/:project" component={AldarProject} />
      <Route path="/aldar-other" component={AldarOther} />
      <Route path="/aldar-other/:project/:building/:unit" component={AldarOtherUnit} />
      <Route path="/aldar-other/:project/:building" component={AldarOtherBuilding} />
      <Route path="/aldar-other/:project" component={AldarOtherProject} />
      <Route path="/resale" component={Resale} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Renders /resale-search OUTSIDE the PasswordGate (the entire point of the
 * "filter from outside" feature). Every other route stays gated.
 */
function GatedShell() {
  const [location] = useLocation();
  if (location === "/resale-search" || location.startsWith("/resale-search/")) {
    return <PublicResaleSearch />;
  }
  return (
    <PasswordGate>
      <Router />
    </PasswordGate>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <GatedShell />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
