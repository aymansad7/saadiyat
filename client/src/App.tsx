/**
 * Coastal Atelier — App shell
 *
 * Every route, including /resale-search, sits behind the EmailGate.
 * Visitors must sign in with a magic-link code (or fall back to the
 * passcode) before seeing any inventory.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import EmailGate from "./components/EmailGate";
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
import AdminAvailability from "./pages/AdminAvailability";
import AdminListings from "./pages/AdminListings";
import AdminAccess from "./pages/AdminAccess";
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
      <Route path="/resale-search" component={PublicResaleSearch} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/availability" component={AdminAvailability} />
      <Route path="/admin/listings" component={AdminListings} />
      <Route path="/admin/access" component={AdminAccess} />
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
          <EmailGate>
            <Router />
          </EmailGate>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
