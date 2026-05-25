import { useEffect, useState } from "react";
import type { AppRoute } from "./routes";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { HistoryPage } from "../features/history/HistoryPage";
import type { LicenseMovement } from "../features/history/historyTypes";
import { InventoryPage } from "../features/inventory/InventoryPage";
import { initialInventoryRecords } from "../features/inventory/inventoryData";
import type { InventoryRecord } from "../features/inventory/inventoryTypes";
import { ReportsPage } from "../features/reports/ReportsPage";
import { ResourcesPage } from "../features/resources/ResourcesPage";
import type { Resource } from "../features/resources/resourceTypes";

const INVENTORY_STORAGE_KEY = "inventario-ti.records.v2";
const RESOURCES_STORAGE_KEY = "inventario-ti.resources.v3";
const HISTORY_STORAGE_KEY = "inventario-ti.history.v1";

export function App() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>("dashboard");
  const [createInventoryRequest, setCreateInventoryRequest] = useState(0);
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(() => {
    try {
      const storedRecords = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
      return storedRecords ? (JSON.parse(storedRecords) as InventoryRecord[]) : initialInventoryRecords;
    } catch {
      return initialInventoryRecords;
    }
  });
  const [resources, setResources] = useState<Resource[]>(() => {
    try {
      const storedResources = window.localStorage.getItem(RESOURCES_STORAGE_KEY);
      return storedResources ? (JSON.parse(storedResources) as Resource[]) : [];
    } catch {
      return [];
    }
  });
  const [licenseMovements, setLicenseMovements] = useState<LicenseMovement[]>(() => {
    try {
      const storedMovements = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      return storedMovements ? (JSON.parse(storedMovements) as LicenseMovement[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventoryRecords));
  }, [inventoryRecords]);

  useEffect(() => {
    window.localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(licenseMovements));
  }, [licenseMovements]);

  function openNewInventoryForm() {
    setActiveRoute("inventory");
    setCreateInventoryRequest((current) => current + 1);
  }

  const pages: Record<AppRoute, JSX.Element> = {
    dashboard: <DashboardPage resources={resources} licenseMovements={licenseMovements} />,
    inventory: (
      <InventoryPage
        inventoryRecords={inventoryRecords}
        onInventoryRecordsChange={setInventoryRecords}
        onLicenseMovementAdd={(movement) => setLicenseMovements((current) => [movement, ...current])}
        createRequestKey={createInventoryRequest}
      />
    ),
    resources: <ResourcesPage resources={resources} onResourcesChange={setResources} />,
    history: <HistoryPage movements={licenseMovements} onMovementsChange={setLicenseMovements} />,
    reports: <ReportsPage />
  };

  return (
    <AppShell activeRoute={activeRoute} onRouteChange={setActiveRoute}>
      {pages[activeRoute]}
    </AppShell>
  );
}
