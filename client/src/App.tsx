// v2 
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
import { PropertyProjectGate } from "./components/PropertyProjectGate";
import Landing from "./pages/Landing";
import StRegis from "./pages/StRegis";
import VillaDetail from "./pages/VillaDetail";
import Jawaher from "./pages/Jawaher";
import JawaherPlotDetail from "./pages/JawaherPlotDetail";
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
import AdminInventoryHistory from "./pages/AdminInventoryHistory";
import Resale from "./pages/Resale";
import PublicResaleSearch from "./pages/PublicResaleSearch";
import CommunityPage from "./pages/CommunityPage";
import HiddAlSaadiyat from "./pages/HiddAlSaadiyat";
import AvailableUnits from "./pages/AvailableUnits";
import SaadiyatMap from "./pages/SaadiyatMap";
import SaadiyatReserve from "./pages/SaadiyatReserve";
import FourSeasons from "./pages/FourSeasons";
import LagoonsHiddenSL9 from "./pages/LagoonsHiddenSL9";
import LagoonsDcrPhase from "./pages/LagoonsDcrPhase";
import Nudra from "./pages/Nudra";
import DcrCommunityPage from "./pages/DcrCommunityPage";
import LagoonsSlGroup from "./pages/LagoonsSlGroup";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/available-units" component={AvailableUnits} />
      <Route path="/map" component={SaadiyatMap} />
      <Route path="/nudra">{() => <PropertyProjectGate projectKey="nudra"><Nudra /></PropertyProjectGate>}</Route>
      <Route path="/private-owners-vip">{() => <PropertyProjectGate projectKey="private-owners-vip"><DcrCommunityPage kind="private-owners-vip" /></PropertyProjectGate>}</Route>
      <Route path="/building-plots-sdw4">{() => <PropertyProjectGate projectKey="building-plots-sdw4"><DcrCommunityPage kind="building-plots-sdw4" /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-reserve">{() => <PropertyProjectGate projectKey="saadiyat-reserve"><SaadiyatReserve /></PropertyProjectGate>}</Route>
      <Route path="/four-seasons">{() => <PropertyProjectGate projectKey="four-seasons"><FourSeasons /></PropertyProjectGate>}</Route>
      <Route path="/lagoons-hidden-sl9">{() => <PropertyProjectGate projectKey="lagoons-hidden-sl9"><LagoonsHiddenSL9 /></PropertyProjectGate>}</Route>
      <Route path="/lagoons-hidden-sl10">{() => <PropertyProjectGate projectKey="lagoons-hidden-sl10"><LagoonsDcrPhase phase="SL10" /></PropertyProjectGate>}</Route>
      <Route path="/lagoons-sl13">{() => <PropertyProjectGate projectKey="lagoons-sl13"><LagoonsDcrPhase phase="SL13" /></PropertyProjectGate>}</Route>
      <Route path="/st-regis">{() => <PropertyProjectGate projectKey="st-regis"><StRegis /></PropertyProjectGate>}</Route>
      <Route path="/st-regis/villa/:id">{() => <PropertyProjectGate projectKey="st-regis"><VillaDetail /></PropertyProjectGate>}</Route>
      <Route path="/jawaher">{() => <PropertyProjectGate projectKey="jawaher"><Jawaher /></PropertyProjectGate>}</Route>
      <Route path="/jawaher/plot/:plotId">{() => <PropertyProjectGate projectKey="jawaher"><JawaherPlotDetail /></PropertyProjectGate>}</Route>
      <Route path="/community/:slug">{({ slug }) => <PropertyProjectGate projectKey={slug}><CommunityPage /></PropertyProjectGate>}</Route>
      <Route path="/hidd-al-saadiyat">{() => <PropertyProjectGate projectKey="hidd"><HiddAlSaadiyat /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-beach-villas">{() => <PropertyProjectGate projectKey="saadiyat-beach-villas"><SaadiyatBeachVillas /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-lagoons">{() => <PropertyProjectGate projectKey="lagoons"><SaadiyatLagoons /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-lagoons/sl2">{() => <PropertyProjectGate projectKey="lagoons"><LagoonsSlGroup phase="SL2" /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-lagoons/sl3">{() => <PropertyProjectGate projectKey="lagoons"><LagoonsSlGroup phase="SL3" /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-lagoons/sl4">{() => <PropertyProjectGate projectKey="lagoons"><LagoonsSlGroup phase="SL4" /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-lagoons/sl5">{() => <PropertyProjectGate projectKey="lagoons"><LagoonsSlGroup phase="SL5" /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-lagoons/sl7">{() => <PropertyProjectGate projectKey="lagoons"><LagoonsSlGroup phase="SL7" /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-lagoons/sl8">{() => <PropertyProjectGate projectKey="lagoons"><LagoonsSlGroup phase="SL8" /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-lagoons/:cluster/:unit">{() => <PropertyProjectGate projectKey="lagoons"><LagoonsVillaDetail /></PropertyProjectGate>}</Route>
      <Route path="/saadiyat-lagoons/:cluster">{() => <PropertyProjectGate projectKey="lagoons"><LagoonsCluster /></PropertyProjectGate>}</Route>
      <Route path="/documents" component={Documents} />
      <Route path="/aldar-saadiyat">{() => <PropertyProjectGate projectKey="aldar-saadiyat"><AldarSaadiyat /></PropertyProjectGate>}</Route>
      <Route path="/aldar-saadiyat/:project/:building/:unit">{({ project }) => <PropertyProjectGate projectKey={project}><AldarUnit /></PropertyProjectGate>}</Route>
      <Route path="/aldar-saadiyat/:project/:building">{({ project }) => <PropertyProjectGate projectKey={project}><AldarBuilding /></PropertyProjectGate>}</Route>
      <Route path="/aldar-saadiyat/:project">{({ project }) => <PropertyProjectGate projectKey={project}><AldarProject /></PropertyProjectGate>}</Route>
      <Route path="/aldar-other">{() => <PropertyProjectGate projectKey="aldar-other"><AldarOther /></PropertyProjectGate>}</Route>
      <Route path="/aldar-other/:project/:building/:unit">{({ project }) => <PropertyProjectGate projectKey={project}><AldarOtherUnit /></PropertyProjectGate>}</Route>
      <Route path="/aldar-other/:project/:building">{({ project }) => <PropertyProjectGate projectKey={project}><AldarOtherBuilding /></PropertyProjectGate>}</Route>
      <Route path="/aldar-other/:project">{({ project }) => <PropertyProjectGate projectKey={project}><AldarOtherProject /></PropertyProjectGate>}</Route>
      <Route path="/resale" component={Resale} />
      <Route path="/resale-search" component={PublicResaleSearch} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/availability" component={AdminAvailability} />
      <Route path="/admin/listings" component={AdminListings} />
      <Route path="/admin/access" component={AdminAccess} />
      <Route path="/admin/inventory-history" component={AdminInventoryHistory} />
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
