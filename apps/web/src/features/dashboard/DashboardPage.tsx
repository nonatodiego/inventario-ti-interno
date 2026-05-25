import { BadgeCheck, Cpu, Headphones, Laptop, Smartphone } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatCard } from "../../components/ui/StatCard";
import type { LicenseMovement, LicenseMovementType } from "../history/historyTypes";
import type { Resource, ResourceType } from "../resources/resourceTypes";

type DashboardPageProps = {
  resources: Resource[];
  licenseMovements: LicenseMovement[];
};

export function DashboardPage({ resources, licenseMovements }: DashboardPageProps) {
  const metrics = useMemo(() => {
    return {
      notebooks: countAvailable(resources, "Notebook"),
      desktops: countAvailable(resources, "Desktop"),
      e1Licenses: countAvailableLicenses(licenseMovements, "O365 E1"),
      e3Licenses: countAvailableLicenses(licenseMovements, "O365 E3"),
      headsets: countAvailable(resources, "Headset"),
      phones: countAvailable(resources, "Celular")
    };
  }, [licenseMovements, resources]);

  const chartData = useMemo(() => {
    return [
      { name: "Notebook", total: metrics.notebooks },
      { name: "Desktop", total: metrics.desktops },
      { name: "Licencas E1", total: metrics.e1Licenses },
      { name: "Licencas E3", total: metrics.e3Licenses },
      { name: "Headset", total: metrics.headsets },
      { name: "Celular", total: metrics.phones }
    ];
  }, [metrics]);
  const hasChartData = chartData.some((item) => item.total > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Recursos Disponiveis</p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Notebooks"
          value={String(metrics.notebooks)}
          detail="Notebooks disponiveis"
          icon={<Laptop className="h-5 w-5" />}
        />
        <StatCard
          title="Desktops"
          value={String(metrics.desktops)}
          detail="Desktops disponiveis"
          icon={<Cpu className="h-5 w-5" />}
        />
        <StatCard
          title="Licencas E1"
          value={String(metrics.e1Licenses)}
          detail="Licencas E1 disponiveis"
          icon={<BadgeCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Licencas E3"
          value={String(metrics.e3Licenses)}
          detail="Licencas E3 disponiveis"
          icon={<BadgeCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Headsets"
          value={String(metrics.headsets)}
          detail="Headsets disponiveis"
          icon={<Headphones className="h-5 w-5" />}
        />
        <StatCard
          title="Celulares"
          value={String(metrics.phones)}
          detail="Celulares disponiveis"
          icon={<Smartphone className="h-5 w-5" />}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores principais</CardTitle>
        </CardHeader>
        <CardContent>
          {hasChartData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="total" position="top" fill="#1E293B" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Sem dados" description="Cadastre recursos na aba Recursos para visualizar o grafico." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function countAvailable(resources: Resource[], type: ResourceType) {
  return resources.reduce((total, resource) => total + (resource.type === type ? resource.available : 0), 0);
}

function countAvailableLicenses(movements: LicenseMovement[], license: LicenseMovementType) {
  return movements.filter((movement) => movement.license === license && movement.finalStatus === "Disponivel").length;
}
