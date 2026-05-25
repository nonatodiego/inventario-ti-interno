import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { type Dispatch, type FormEvent, type SetStateAction, useMemo, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { Table, TBody, TD, TH, THead } from "../../components/ui/Table";
import { Toast } from "../../components/ui/Toast";
import { type Resource, type ResourceType, resourceTypeOptions } from "./resourceTypes";

type ResourcesPageProps = {
  resources: Resource[];
  onResourcesChange: Dispatch<SetStateAction<Resource[]>>;
};

type FormState = {
  type: ResourceType;
  total: string;
  available: string;
};

export function ResourcesPage({ resources, onResourcesChange }: ResourcesPageProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [editingResource, setEditingResource] = useState<Resource | null | undefined>(undefined);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);

  const filteredResources = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch = normalizedSearch.length === 0 || resource.type.toLowerCase().includes(normalizedSearch);
      const matchesType = type === "all" || resource.type === type;

      return matchesSearch && matchesType;
    });
  }, [resources, search, type]);

  function showToast(title: string, description: string) {
    setToast({ title, description });
    window.setTimeout(() => setToast(null), 3000);
  }

  function handleSave(resource: Resource) {
    onResourcesChange((current) => {
      const exists = current.some((item) => item.id === resource.id);
      return exists ? current.map((item) => (item.id === resource.id ? resource : item)) : [resource, ...current];
    });
    setEditingResource(undefined);
    showToast("Recurso salvo", "O recurso disponível foi atualizado.");
  }

  function handleDelete() {
    if (!resourceToDelete) return;

    onResourcesChange((current) => current.filter((resource) => resource.id !== resourceToDelete.id));
    setResourceToDelete(null);
    showToast("Recurso excluído", "O recurso foi removido da lista.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Recursos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cadastre apenas os recursos exibidos no Dashboard.</p>
        </div>
        <Button onClick={() => setEditingResource(null)}>
          <Plus className="h-4 w-4" />
          Novo recurso
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disponibilidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar recurso" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <Select
              aria-label="Tipo de recurso"
              value={type}
              onChange={(event) => setType(event.target.value)}
              options={[{ label: "Todos os recursos", value: "all" }, ...resourceTypeOptions]}
            />
          </div>

          {filteredResources.length > 0 ? (
            <Table className="min-w-[760px]">
              <caption className="sr-only">Lista de recursos disponíveis</caption>
              <THead>
                <tr>
                  <TH>Recurso</TH>
                  <TH>Total</TH>
                  <TH>Disponível</TH>
                  <TH>Uso</TH>
                  <TH>Ações</TH>
                </tr>
              </THead>
              <TBody>
                {filteredResources.map((resource) => {
                  const used = Math.max(0, resource.total - resource.available);
                  return (
                    <tr key={resource.id}>
                      <TD>
                        <Badge tone="info">{resource.type}</Badge>
                      </TD>
                      <TD>{resource.total}</TD>
                      <TD>{resource.available}</TD>
                      <TD className="text-muted-foreground">{used} em uso</TD>
                      <TD>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" aria-label={`Editar ${resource.type}`} title="Editar" className="h-9 w-9 px-0" onClick={() => setEditingResource(resource)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            aria-label={`Excluir ${resource.type}`}
                            title="Excluir"
                            className="h-9 w-9 px-0 text-destructive hover:bg-red-50 hover:text-destructive"
                            onClick={() => setResourceToDelete(resource)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TD>
                    </tr>
                  );
                })}
              </TBody>
            </Table>
          ) : (
            <EmptyState title="Nenhum recurso cadastrado" description="Cadastre um recurso para alimentar os números do Dashboard." actionLabel="Novo recurso" onAction={() => setEditingResource(null)} />
          )}
        </CardContent>
      </Card>

      <Modal open={editingResource !== undefined} title={editingResource ? "Editar recurso" : "Novo recurso"} onClose={() => setEditingResource(undefined)}>
        <ResourceForm initialResource={editingResource ?? null} onCancel={() => setEditingResource(undefined)} onSave={handleSave} />
      </Modal>

      <Modal open={resourceToDelete !== null} title="Excluir recurso" onClose={() => setResourceToDelete(null)}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <strong className="text-foreground">{resourceToDelete?.type}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setResourceToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast title={toast.title} description={toast.description} tone="success" />
        </div>
      ) : null}
    </div>
  );
}

function ResourceForm({
  initialResource,
  onCancel,
  onSave
}: {
  initialResource: Resource | null;
  onCancel: () => void;
  onSave: (resource: Resource) => void;
}) {
  const [form, setForm] = useState<FormState>(() => ({
    type: initialResource?.type ?? "Notebook",
    total: String(initialResource?.total ?? 0),
    available: String(initialResource?.available ?? 0)
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function updateField<Key extends keyof FormState>(field: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const total = Number(form.total);
    const available = Number(form.available);
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!Number.isInteger(total) || total < 0) {
      nextErrors.total = "Informe um total válido.";
    }

    if (!Number.isInteger(available) || available < 0) {
      nextErrors.available = "Informe uma quantidade válida.";
    }

    if (Number.isInteger(total) && Number.isInteger(available) && available > total) {
      nextErrors.available = "Disponível não pode ser maior que o total.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      id: initialResource?.id ?? `res-${Date.now()}`,
      type: form.type,
      total,
      available
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Select
        label="Recurso"
        value={form.type}
        onChange={(event) => updateField("type", event.target.value as ResourceType)}
        options={resourceTypeOptions}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Quantidade total" type="number" min={0} value={form.total} onChange={(event) => updateField("total", event.target.value)} hint={errors.total} />
        <Input label="Quantidade disponível" type="number" min={0} value={form.available} onChange={(event) => updateField("available", event.target.value)} hint={errors.available} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
