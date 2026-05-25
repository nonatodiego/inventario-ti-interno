import { type Dispatch, type ReactNode, type SetStateAction, useEffect, useMemo, useState } from "react";
import { Download, Edit, Eye, FileDown, Plus, Search, Trash2 } from "lucide-react";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { Table, TBody, TD, TH, THead } from "../../components/ui/Table";
import { Toast } from "../../components/ui/Toast";
import type { LicenseMovement } from "../history/historyTypes";
import { InventoryForm } from "./InventoryForm";
import { exportInventoryCsv } from "./inventoryData";
import type { InventoryRecord } from "./inventoryTypes";

type InventoryPageProps = {
  inventoryRecords: InventoryRecord[];
  onInventoryRecordsChange: Dispatch<SetStateAction<InventoryRecord[]>>;
  onLicenseMovementAdd?: (movement: LicenseMovement) => void;
  createRequestKey?: number;
};

type ToastState = {
  title: string;
  description: string;
  tone?: "success" | "info" | "warning" | "danger";
};

export function InventoryPage({ inventoryRecords, onInventoryRecordsChange, onLicenseMovementAdd, createRequestKey = 0 }: InventoryPageProps) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [manager, setManager] = useState("all");
  const [license, setLicense] = useState("all");
  const [termStatus, setTermStatus] = useState("all");
  const [equipmentType, setEquipmentType] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<InventoryRecord | null>(null);
  const [formRecord, setFormRecord] = useState<InventoryRecord | null | undefined>(undefined);
  const [recordToDelete, setRecordToDelete] = useState<InventoryRecord | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (createRequestKey > 0) {
      setFormRecord(null);
    }
  }, [createRequestKey]);

  const filteredRecords = useMemo(() => {
    return inventoryRecords.filter((record) => {
      const matchesSearch = record.collaborator.toLowerCase().includes(search.toLowerCase());
      const matchesLocation = location === "all" || record.location === location;
      const matchesManager = manager === "all" || record.manager === manager;
      const matchesLicense = license === "all" || record.license === license;
      const matchesTerm =
        termStatus === "all" ||
        (termStatus === "attached" && record.termAttached) ||
        (termStatus === "pending" && !record.termAttached);
      const matchesEquipment = equipmentType === "all" || record.equipment.some((item) => item.type === equipmentType);

      return matchesSearch && matchesLocation && matchesManager && matchesLicense && matchesTerm && matchesEquipment;
    });
  }, [equipmentType, inventoryRecords, license, location, manager, search, termStatus]);

  function handleSave(record: InventoryRecord) {
    onInventoryRecordsChange((current) => {
      const exists = current.some((item) => item.id === record.id);
      return exists ? current.map((item) => (item.id === record.id ? record : item)) : [record, ...current];
    });
    setFormRecord(undefined);
    setToast({
      title: "Cadastro salvo",
      description: "As informações do inventário foram atualizadas com sucesso.",
      tone: "success"
    });
  }

  function handleExportCsv() {
    exportInventoryCsv(filteredRecords);
  }

  async function handleDownloadPdf(record: InventoryRecord) {
    try {
      const result = await downloadInventoryPdf(record);
      setToast({
        title: "PDF gerado",
        description: result.includedTerm
          ? `O inventario de ${record.collaborator} foi baixado com o termo anexado.`
          : `O inventario de ${record.collaborator} foi baixado com a observacao de termo nao assinado.`,
        tone: "success"
      });
    } catch {
      setToast({
        title: "Nao foi possivel gerar o PDF",
        description: "Verifique se o termo anexado e um PDF valido e tente novamente.",
        tone: "danger"
      });
    }
  }

  function handleDeleteRecord() {
    if (!recordToDelete) return;

    onInventoryRecordsChange((current) => current.filter((record) => record.id !== recordToDelete.id));
    onLicenseMovementAdd?.({
      id: `hist-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      action: "Desalocacao",
      license: recordToDelete.license === "E3" ? "O365 E3" : "O365 E1",
      previousUser: recordToDelete.collaborator,
      responsible: "Diego Nonato",
      finalStatus: "Disponivel",
      backupStatus: "Nao informado",
      notes: "Registro automatico gerado ao excluir cadastro do inventario."
    });
    setRecordToDelete(null);
    setToast({
      title: "Cadastro excluído",
      description: "O registro foi removido do inventário.",
      tone: "success"
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Inventário de TI</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie colaboradores, equipamentos e termos de uso.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExportCsv}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={() => setFormRecord(null)}>
            <Plus className="h-4 w-4" />
            Novo cadastro
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-3 xl:grid-cols-[1fr_160px_180px_150px_180px_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar por nome" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <Select aria-label="Localidade" value={location} onChange={(event) => setLocation(event.target.value)} options={toOptions("Todas as localidades", unique(inventoryRecords.map((record) => record.location)))} />
            <Select aria-label="Gestor" value={manager} onChange={(event) => setManager(event.target.value)} options={toOptions("Todos os gestores", unique(inventoryRecords.map((record) => record.manager)))} />
            <Select
              aria-label="Licença"
              value={license}
              onChange={(event) => setLicense(event.target.value)}
              options={[
                { label: "Licenças E1/E3", value: "all" },
                { label: "E1", value: "E1" },
                { label: "E3", value: "E3" }
              ]}
            />
            <Select
              aria-label="Termo"
              value={termStatus}
              onChange={(event) => setTermStatus(event.target.value)}
              options={[
                { label: "Todos os termos", value: "all" },
                { label: "Termo anexado", value: "attached" },
                { label: "Termo pendente", value: "pending" }
              ]}
            />
            <Select aria-label="Tipo de equipamento" value={equipmentType} onChange={(event) => setEquipmentType(event.target.value)} options={toOptions("Todos equipamentos", unique(inventoryRecords.flatMap((record) => record.equipment.map((item) => item.type))))} />
          </div>

          {filteredRecords.length > 0 ? (
            <Table className="min-w-[1080px]">
              <caption className="sr-only">Lista de inventário de TI por colaborador</caption>
              <THead>
                <tr>
                  <TH>Colaborador</TH>
                  <TH>Cargo</TH>
                  <TH>Localidade</TH>
                  <TH>Gestor</TH>
                  <TH>Licença</TH>
                  <TH>Equipamentos</TH>
                  <TH>Termo de uso</TH>
                  <TH>Data de cadastro</TH>
                  <TH>Ações</TH>
                </tr>
              </THead>
              <TBody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <TD className="font-medium">{record.collaborator}</TD>
                    <TD className="text-muted-foreground">{record.role}</TD>
                    <TD>{record.location}</TD>
                    <TD className="text-muted-foreground">{record.manager}</TD>
                    <TD>
                      <LicenseBadge license={record.license} />
                    </TD>
                    <TD>
                      <EquipmentSummary record={record} onOpen={() => setSelectedRecord(record)} />
                    </TD>
                    <TD>
                      <TermBadge attached={record.termAttached} />
                    </TD>
                    <TD>{formatDate(record.regDate)}</TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        <ActionButton label="Visualizar" onClick={() => setSelectedRecord(record)}>
                          <Eye className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton label="Editar" onClick={() => setFormRecord(record)}>
                          <Edit className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton label="Baixar PDF" onClick={() => handleDownloadPdf(record)}>
                          <FileDown className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton label="Excluir" tone="danger" onClick={() => setRecordToDelete(record)}>
                          <Trash2 className="h-4 w-4" />
                        </ActionButton>
                      </div>
                    </TD>
                  </tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState title="Nenhum cadastro encontrado" description="Ajuste os filtros ou cadastre um novo colaborador com seus equipamentos." actionLabel="Novo cadastro" />
          )}
        </CardContent>
      </Card>

      <Modal open={selectedRecord !== null} title="Detalhes técnicos dos equipamentos" onClose={() => setSelectedRecord(null)}>
        {selectedRecord ? <TechnicalDetails record={selectedRecord} /> : null}
      </Modal>

      <Modal
        open={formRecord !== undefined}
        title={formRecord ? "Editar cadastro de inventário" : "Novo cadastro de inventário"}
        size="xl"
        onClose={() => setFormRecord(undefined)}
      >
        <InventoryForm initialRecord={formRecord} onCancel={() => setFormRecord(undefined)} onSave={handleSave} />
      </Modal>

      <Modal open={recordToDelete !== null} title="Excluir cadastro" onClose={() => setRecordToDelete(null)}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o cadastro de <strong className="text-foreground">{recordToDelete?.collaborator}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRecordToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteRecord}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast title={toast.title} description={toast.description} tone={toast.tone} />
        </div>
      ) : null}
    </div>
  );
}

function LicenseBadge({ license }: { license: "E1" | "E3" }) {
  return <Badge tone={license === "E3" ? "info" : "default"}>{license}</Badge>;
}

function TermBadge({ attached }: { attached: boolean }) {
  return <Badge tone={attached ? "success" : "warning"}>{attached ? "Termo anexado" : "Termo pendente"}</Badge>;
}

function EquipmentSummary({ record, onOpen }: { record: InventoryRecord; onOpen: () => void }) {
  const visible = record.equipment.slice(0, 3);
  const hiddenCount = record.equipment.length - visible.length;

  return (
    <button className="flex max-w-xs flex-wrap gap-1 text-left" onClick={onOpen}>
      {visible.map((item) => (
        <Badge key={`${record.id}-${item.type}`}>{item.type}</Badge>
      ))}
      {hiddenCount > 0 ? <Badge tone="info">+{hiddenCount}</Badge> : null}
    </button>
  );
}

function ActionButton({ children, label, onClick, tone = "default" }: { children: ReactNode; label: string; onClick?: () => void; tone?: "default" | "danger" }) {
  return (
    <Button
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={tone === "danger" ? "h-9 w-9 px-0 text-destructive hover:bg-red-50 hover:text-destructive" : "h-9 w-9 px-0"}
    >
      {children}
    </Button>
  );
}

function TechnicalDetails({ record }: { record: InventoryRecord }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">{record.collaborator}</p>
        <p className="text-sm text-muted-foreground">{record.role}</p>
      </div>
      <div className="space-y-3">
        {record.equipment.map((item) => (
          <div key={`${record.id}-${item.type}-${item.serialNumber ?? item.imei ?? item.hostname ?? "item"}`} className="rounded-md border border-border p-3">
            <div className="mb-2 flex items-center">
              <Badge>{item.type}</Badge>
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <Detail label="Serial" value={item.serialNumber} />
              <Detail label="Hostname" value={item.hostname} />
              <Detail label="Chip" value={item.chipNumber} />
              <Detail label="IMEI" value={item.imei} />
              <Detail label="Pulsus ID" value={item.pulsusId} />
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

async function downloadInventoryPdf(record: InventoryRecord) {
  const lines = [
    "Inventario de TI",
    `Colaborador: ${record.collaborator}`,
    `Cargo: ${record.role}`,
    `Localidade: ${record.location}`,
    `Gestor: ${record.manager}`,
    `Licenca: ${record.license}`,
    `Termo: ${record.termAttached ? "Anexado" : "Pendente"}`,
    `Data de cadastro: ${formatDate(record.regDate)}`,
    "",
    "Equipamentos:",
    ...record.equipment.map((item) => `- ${item.type}${item.hostname ? ` | Hostname: ${item.hostname}` : ""}${item.serialNumber ? ` | Serial: ${item.serialNumber}` : ""}`)
  ];
  const { bytes, includedTerm } = await createInventoryPdf(lines, record);
  const pdf = new Uint8Array(bytes);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${slugify(record.collaborator)}-inventario.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return { includedTerm };
}

async function createInventoryPdf(lines: string[], record: InventoryRecord) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  addSummaryPage(pdf, lines, font, boldFont);

  let includedTerm = false;

  if (record.termFileData) {
    const termPdf = await PDFDocument.load(dataUrlToBytes(record.termFileData));
    const copiedPages = await pdf.copyPages(termPdf, termPdf.getPageIndices());
    copiedPages.forEach((page) => pdf.addPage(page));
    includedTerm = copiedPages.length > 0;
  } else {
    addTermStatusPage(
      pdf,
      record.termAttached
        ? "Termo anexado nao disponivel neste cadastro. Reanexe o PDF do termo para que ele saia junto ao resumo."
        : "Esse usuario nao tem termo assinado.",
      font,
      boldFont
    );
  }

  return { bytes: await pdf.save(), includedTerm };
}

function addSummaryPage(pdf: PDFDocument, lines: string[], font: PDFFont, boldFont: PDFFont) {
  const page = pdf.addPage([595, 842]);
  const safeLines = lines.map((line) => sanitizePdfText(line));

  page.drawText(safeLines[0] ?? "Inventario de TI", {
    x: 48,
    y: 790,
    size: 18,
    font: boldFont,
    color: rgb(0.06, 0.09, 0.16)
  });

  safeLines.slice(1).forEach((line, index) => {
    page.drawText(line, {
      x: 48,
      y: 754 - index * 18,
      size: 11,
      font,
      color: rgb(0.12, 0.16, 0.23)
    });
  });
}

function addTermStatusPage(pdf: PDFDocument, message: string, font: PDFFont, boldFont: PDFFont) {
  const page = pdf.addPage([595, 842]);

  page.drawText("Termo de uso", {
    x: 48,
    y: 790,
    size: 18,
    font: boldFont,
    color: rgb(0.06, 0.09, 0.16)
  });
  page.drawText(sanitizePdfText(message), {
    x: 48,
    y: 752,
    size: 12,
    font,
    color: rgb(0.12, 0.16, 0.23)
  });
}

function sanitizePdfText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function slugify(value: string) {
  return sanitizePdfText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "inventario";
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function toOptions(defaultLabel: string, values: string[]) {
  return [{ label: defaultLabel, value: "all" }, ...values.map((value) => ({ label: value, value }))];
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(date));
}
