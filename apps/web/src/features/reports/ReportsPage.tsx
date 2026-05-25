import { Download, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Select } from "../../components/ui/Select";
import { Table, TBody, TD, TH, THead } from "../../components/ui/Table";
import { Toast } from "../../components/ui/Toast";
import { exportCsv } from "../../lib/exportCsv";
import { initialInventoryRecords } from "../inventory/inventoryData";
import type { Resource } from "../resources/resourceTypes";

type ReportType = "inventory" | "collaborator" | "resources";
type ReportFormat = "pdf" | "csv";
type ReportRow = Record<string, string | number>;

const initialResources: Resource[] = [];

const reportModels: Array<{ name: string; format: ReportFormat; type: ReportType; updatedAt: string }> = [
  { name: "Inventario completo", format: "csv", type: "inventory", updatedAt: "Hoje" },
  { name: "Equipamentos por colaborador", format: "pdf", type: "collaborator", updatedAt: "Hoje" },
  { name: "Recursos disponiveis", format: "csv", type: "resources", updatedAt: "Ontem" }
];

const reportLabels: Record<ReportType, string> = {
  inventory: "Inventario completo",
  collaborator: "Por colaborador",
  resources: "Recursos"
};

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("inventory");
  const [format, setFormat] = useState<ReportFormat>("csv");
  const [generatedReport, setGeneratedReport] = useState<{ title: string; rows: ReportRow[] } | null>(null);
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);

  const currentReport = useMemo(() => buildReport(reportType), [reportType]);

  function handleGenerate(type = reportType, selectedFormat = format) {
    const report = buildReport(type);

    setGeneratedReport(report);

    if (selectedFormat === "csv") {
      exportReportCsv(type, report);
    } else {
      downloadReportPdf(type, report);
    }

    setToast({
      title: "Relatorio gerado",
      description: `${report.title} foi gerado em ${selectedFormat.toUpperCase()}.`
    });

    window.setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Relatorios</h1>
        <p className="mt-1 text-sm text-muted-foreground">Exportacoes operacionais para auditoria e acompanhamento.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerar relatorio</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_180px_140px]">
          <Select
            label="Tipo"
            value={reportType}
            onChange={(event) => setReportType(event.target.value as ReportType)}
            options={[
              { label: "Inventario completo", value: "inventory" },
              { label: "Por colaborador", value: "collaborator" },
              { label: "Recursos", value: "resources" }
            ]}
          />
          <Select
            label="Formato"
            value={format}
            onChange={(event) => setFormat(event.target.value as ReportFormat)}
            options={[
              { label: "CSV", value: "csv" },
              { label: "PDF", value: "pdf" }
            ]}
          />
          <Button className="self-end" onClick={() => handleGenerate()}>
            <Download className="h-4 w-4" />
            Gerar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{generatedReport ? "Ultimo relatorio gerado" : "Previa do relatorio"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportPreview title={generatedReport?.title ?? currentReport.title} rows={generatedReport?.rows ?? currentReport.rows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modelos disponiveis</CardTitle>
        </CardHeader>
        <Table>
          <caption className="sr-only">Lista de modelos de relatorios disponiveis</caption>
          <THead>
            <tr>
              <TH>Relatorio</TH>
              <TH>Formato</TH>
              <TH>Atualizacao</TH>
              <TH>Acao</TH>
            </tr>
          </THead>
          <TBody>
            {reportModels.map((report) => (
              <tr key={report.name}>
                <TD className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {report.name}
                  </span>
                </TD>
                <TD>{report.format.toUpperCase()}</TD>
                <TD className="text-muted-foreground">{report.updatedAt}</TD>
                <TD>
                  <Button variant="secondary" onClick={() => handleGenerate(report.type, report.format)}>
                    Baixar
                  </Button>
                </TD>
              </tr>
            ))}
          </TBody>
        </Table>
      </Card>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast title={toast.title} description={toast.description} tone="success" />
        </div>
      ) : null}
    </div>
  );
}

function ReportPreview({ title, rows }: { title: string; rows: ReportRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="Nenhum dado encontrado" description="Nao ha informacoes suficientes para gerar este relatorio." />;
  }

  const headers = Object.keys(rows[0]);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{rows.length} registro(s) no relatorio.</p>
      </div>
      <Table className="min-w-[760px]">
        <caption className="sr-only">Previa do relatorio gerado</caption>
        <THead>
          <tr>
            {headers.map((header) => (
              <TH key={header}>{header}</TH>
            ))}
          </tr>
        </THead>
        <TBody>
          {rows.slice(0, 6).map((row, index) => (
            <tr key={`${title}-${index}`}>
              {headers.map((header) => (
                <TD key={`${header}-${index}`}>{row[header]}</TD>
              ))}
            </tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

function buildReport(type: ReportType) {
  if (type === "resources") {
    return {
      title: "Recursos disponiveis",
      rows: initialResources.map((resource) => ({
        Recurso: resource.type,
        Total: resource.total,
        Disponivel: resource.available,
        "Em uso": resource.total - resource.available
      }))
    };
  }

  if (type === "collaborator") {
    return {
      title: "Equipamentos por colaborador",
      rows: initialInventoryRecords.map((record) => ({
        Colaborador: record.collaborator,
        Cargo: record.role,
        Localidade: record.location,
        Equipamentos: record.equipment.map((item) => item.type).join(", "),
        Termo: record.termAttached ? "Anexado" : "Pendente"
      }))
    };
  }

  return {
    title: "Inventario completo",
    rows: initialInventoryRecords.map((record) => ({
      Colaborador: record.collaborator,
      Cargo: record.role,
      Localidade: record.location,
      Gestor: record.manager,
      Licenca: record.license,
      Equipamentos: record.equipment.map((item) => item.type).join(", "),
      Termo: record.termAttached ? "Anexado" : "Pendente",
      Cadastro: formatDate(record.regDate)
    }))
  };
}

function exportReportCsv(type: ReportType, report: { rows: ReportRow[] }) {
  const headers = Object.keys(report.rows[0] ?? {});
  exportCsv(`${type}-relatorio.csv`, headers, report.rows.map((row) => headers.map((header) => row[header])));
}

function downloadReportPdf(type: ReportType, report: { title: string; rows: ReportRow[] }) {
  const headers = Object.keys(report.rows[0] ?? {});
  const lines = [
    report.title,
    `Gerado em: ${new Intl.DateTimeFormat("pt-BR").format(new Date())}`,
    "",
    headers.join(" | "),
    ...report.rows.map((row) => headers.map((header) => String(row[header] ?? "")).join(" | "))
  ];
  const pdf = createSimplePdf(lines);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${type}-relatorio.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createSimplePdf(lines: string[]) {
  const safeLines = lines.slice(0, 38).map((line) => sanitizePdfText(line));
  const textCommands = safeLines.map((line, index) => `BT /F1 10 Tf 40 ${790 - index * 18} Td (${escapePdfText(line)}) Tj ET`).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${textCommands.length} >>\nstream\n${textCommands}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function sanitizePdfText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(date));
}
