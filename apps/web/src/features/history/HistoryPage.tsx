import { Eye, Plus, Search } from "lucide-react";
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
import { type BackupStatus, type LicenseMovement, type LicenseMovementAction, type LicenseMovementStatus, type LicenseMovementType, actionOptions, backupStatusOptions, licenseOptions, responsibleOptions } from "./historyTypes";

type HistoryPageProps = {
  movements: LicenseMovement[];
  onMovementsChange: Dispatch<SetStateAction<LicenseMovement[]>>;
};

type FormState = {
  date: string;
  action: LicenseMovementAction;
  license: LicenseMovementType;
  previousUser: string;
  newUser: string;
  responsible: string;
  backupStatus: BackupStatus;
  notes: string;
};

export function HistoryPage({ movements, onMovementsChange }: HistoryPageProps) {
  const [search, setSearch] = useState("");
  const [license, setLicense] = useState("all");
  const [action, setAction] = useState("all");
  const [backupStatus, setBackupStatus] = useState("all");
  const [selectedMovement, setSelectedMovement] = useState<LicenseMovement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);

  const filteredMovements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return movements.filter((movement) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        movement.previousUser.toLowerCase().includes(normalizedSearch) ||
        (movement.newUser ?? "").toLowerCase().includes(normalizedSearch) ||
        movement.responsible.toLowerCase().includes(normalizedSearch) ||
        (movement.notes ?? "").toLowerCase().includes(normalizedSearch);
      const matchesLicense = license === "all" || movement.license === license;
      const matchesAction = action === "all" || movement.action === action;
      const matchesBackup = backupStatus === "all" || movement.backupStatus === backupStatus;

      return matchesSearch && matchesLicense && matchesAction && matchesBackup;
    });
  }, [action, backupStatus, license, movements, search]);

  const timeline = useMemo(() => {
    return [...filteredMovements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }, [filteredMovements]);

  function showToast(title: string, description: string) {
    setToast({ title, description });
    window.setTimeout(() => setToast(null), 3000);
  }

  function handleSave(movement: LicenseMovement) {
    onMovementsChange((current) => [movement, ...current]);
    setIsFormOpen(false);
    showToast("Historico registrado", "A movimentacao da licenca foi salva.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Historico</h1>
          <p className="mt-1 text-sm text-muted-foreground">Movimentacoes de licencas O365 em desligamentos, transferencias e desalocacoes.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova movimentacao
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 xl:grid-cols-[1fr_150px_170px_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar usuario, responsavel ou observacao" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Select aria-label="Licenca" value={license} onChange={(event) => setLicense(event.target.value)} options={[{ label: "Todas licencas", value: "all" }, ...licenseOptions]} />
          <Select aria-label="Tipo de acao" value={action} onChange={(event) => setAction(event.target.value)} options={[{ label: "Todas as acoes", value: "all" }, ...actionOptions]} />
          <Select
            aria-label="Backup"
            value={backupStatus}
            onChange={(event) => setBackupStatus(event.target.value)}
            options={[{ label: "Todos backups", value: "all" }, ...backupStatusOptions]}
          />
        </CardContent>
      </Card>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Movimentacoes</CardTitle>
          </CardHeader>
          {filteredMovements.length > 0 ? (
            <CardContent>
              <div className="max-w-full">
                <Table className="min-w-0 table-fixed text-sm">
                  <caption className="sr-only">Historico de movimentacoes de licencas O365</caption>
                  <THead>
                    <tr>
                      <TH className="w-24 px-3">Data</TH>
                      <TH className="w-28 px-3">Licenca</TH>
                      <TH className="px-3">Usuario anterior</TH>
                      <TH className="px-3">Novo usuario</TH>
                      <TH className="w-36 px-3">Responsavel</TH>
                      <TH className="w-36 px-3">Backup</TH>
                      <TH className="w-16 px-3">Ver</TH>
                    </tr>
                  </THead>
                  <TBody>
                    {filteredMovements.map((movement) => (
                      <tr key={movement.id}>
                        <TD className="px-3">{formatDate(movement.date)}</TD>
                        <TD className="px-3"><Badge tone="info">{movement.license}</Badge></TD>
                        <TD className="truncate px-3 text-muted-foreground">{movement.previousUser}</TD>
                        <TD className="truncate px-3 font-semibold text-foreground">{movement.newUser || "-"}</TD>
                        <TD className="truncate px-3">{movement.responsible}</TD>
                        <TD className="px-3"><BackupBadge status={movement.backupStatus ?? "Nao informado"} /></TD>
                        <TD className="px-3">
                          <Button variant="ghost" aria-label="Ver detalhes" title="Ver detalhes" className="h-9 w-9 px-0" onClick={() => setSelectedMovement(movement)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TD>
                      </tr>
                    ))}
                  </TBody>
                </Table>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <EmptyState title="Nenhuma movimentacao encontrada" description="Registre uma transferencia ou desalocacao para iniciar o historico." actionLabel="Nova movimentacao" onAction={() => setIsFormOpen(true)} />
            </CardContent>
          )}
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Timeline por licenca</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length > 0 ? (
              <ol className="space-y-4">
                {timeline.map((movement) => (
                  <li key={`${movement.id}-timeline`} className="border-l-2 border-primary/20 pl-4">
                    <div className="flex items-center gap-2">
                      <ActionBadge action={movement.action} />
                      <span className="text-xs text-muted-foreground">{formatDate(movement.date)}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium">{movement.license}</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.previousUser} {movement.newUser ? `-> ${movement.newUser}` : "-> disponivel"}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState title="Timeline vazia" description="As movimentacoes recentes aparecerao aqui." />
            )}
          </CardContent>
        </Card>
      </section>

      <Modal open={isFormOpen} title="Nova movimentacao de licenca" size="lg" onClose={() => setIsFormOpen(false)}>
        <MovementForm onCancel={() => setIsFormOpen(false)} onSave={handleSave} />
      </Modal>

      <Modal open={selectedMovement !== null} title="Detalhes da movimentacao" onClose={() => setSelectedMovement(null)}>
        {selectedMovement ? <MovementDetails movement={selectedMovement} /> : null}
      </Modal>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast title={toast.title} description={toast.description} tone="success" />
        </div>
      ) : null}
    </div>
  );
}

function MovementForm({ onCancel, onSave }: { onCancel: () => void; onSave: (movement: LicenseMovement) => void }) {
  const [form, setForm] = useState<FormState>({
    date: new Date().toISOString().slice(0, 10),
    action: "Desalocacao",
    license: "O365 E1",
    previousUser: "",
    newUser: "",
    responsible: "Diego Nonato",
    backupStatus: "Nao informado",
    notes: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const finalStatus: LicenseMovementStatus = form.action === "Transferencia" ? "Transferida" : "Disponivel";

  function updateField<Key extends keyof FormState>(field: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.previousUser.trim()) nextErrors.previousUser = "Informe o usuario anterior.";
    if (form.action === "Transferencia" && !form.newUser.trim()) nextErrors.newUser = "Informe o novo usuario.";
    if (!form.responsible.trim()) nextErrors.responsible = "Informe o responsavel.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      id: `hist-${Date.now()}`,
      date: form.date,
      action: form.action,
      license: form.license,
      previousUser: form.previousUser.trim(),
      newUser: form.action === "Transferencia" ? form.newUser.trim() : undefined,
      responsible: form.responsible.trim(),
      finalStatus,
      backupStatus: form.backupStatus,
      notes: form.notes.trim() || undefined
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Data" type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} />
        <Select label="Tipo de acao" value={form.action} onChange={(event) => updateField("action", event.target.value as LicenseMovementAction)} options={actionOptions} />
        <Select label="Licenca" value={form.license} onChange={(event) => updateField("license", event.target.value as LicenseMovementType)} options={licenseOptions} />
        <Select label="Responsavel" value={form.responsible} onChange={(event) => updateField("responsible", event.target.value)} options={responsibleOptions} />
        <Input label="Usuario anterior" value={form.previousUser} onChange={(event) => updateField("previousUser", event.target.value)} hint={errors.previousUser} />
        <Input label="Novo usuario" disabled={form.action === "Desalocacao"} value={form.newUser} onChange={(event) => updateField("newUser", event.target.value)} hint={form.action === "Desalocacao" ? "Nao necessario para desalocacao." : errors.newUser} />
        <Select label="Backup da conta" value={form.backupStatus} onChange={(event) => updateField("backupStatus", event.target.value as BackupStatus)} options={backupStatusOptions} />
      </div>
      <Input label="Observacoes" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        Status final: <strong className="text-foreground">{finalStatus}</strong>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar movimentacao</Button>
      </div>
    </form>
  );
}

function MovementDetails({ movement }: { movement: LicenseMovement }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <Detail label="Data" value={formatDate(movement.date)} />
      <Detail label="Tipo de acao" value={movement.action} />
      <Detail label="Licenca" value={movement.license} />
      <Detail label="Usuario anterior" value={movement.previousUser} />
      <Detail label="Novo usuario" value={movement.newUser || "-"} />
      <Detail label="Responsavel" value={movement.responsible} />
      <Detail label="Backup da conta" value={movement.backupStatus ?? "Nao informado"} />
      <Detail label="Observacoes" value={movement.notes || "-"} />
    </dl>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function ActionBadge({ action }: { action: LicenseMovementAction }) {
  return <Badge tone={action === "Transferencia" ? "info" : "warning"}>{action}</Badge>;
}

function BackupBadge({ status }: { status: BackupStatus }) {
  const tone = status === "Realizado" ? "success" : status === "Nao realizado" ? "danger" : "default";
  return <Badge tone={tone}>{status}</Badge>;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(date));
}
