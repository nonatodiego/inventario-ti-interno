import { type ReactNode, useMemo, useState } from "react";
import { Headphones, Keyboard, Laptop, Monitor, Mouse, Smartphone, Upload, X, Cpu, PanelTop } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Checkbox } from "../../components/ui/Checkbox";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import type { EquipmentType, InventoryRecord } from "./inventoryTypes";

type InventoryFormProps = {
  initialRecord?: InventoryRecord | null;
  onCancel: () => void;
  onSave: (record: InventoryRecord) => void;
};

type FormErrors = Partial<Record<"collaborator" | "role" | "location" | "manager" | "license" | "termFile", string>>;
type EquipmentDetails = Partial<InventoryRecord["equipment"][number]>;

const resourceOptions: Array<{ type: EquipmentType; label: string; icon: LucideIcon }> = [
  { type: "Notebook", label: "Notebook", icon: Laptop },
  { type: "Desktop", label: "Desktop", icon: Cpu },
  { type: "Telefone", label: "Celular", icon: Smartphone },
  { type: "Monitor", label: "Monitor", icon: Monitor },
  { type: "Mouse", label: "Mouse", icon: Mouse },
  { type: "Teclado", label: "Teclado", icon: Keyboard },
  { type: "Headset", label: "Headset", icon: Headphones },
  { type: "Suporte", label: "Suporte de notebook", icon: PanelTop }
];

export function InventoryForm({ initialRecord, onCancel, onSave }: InventoryFormProps) {
  const initialEquipment = initialRecord?.equipment ?? [];
  const [collaborator, setCollaborator] = useState(initialRecord?.collaborator ?? "");
  const [role, setRole] = useState(initialRecord?.role ?? "");
  const [location, setLocation] = useState(initialRecord?.location ?? "");
  const [manager, setManager] = useState(initialRecord?.manager ?? "");
  const [license, setLicense] = useState<"E1" | "E3">(initialRecord?.license ?? "E1");
  const [regDate, setRegDate] = useState(initialRecord?.regDate ?? new Date().toISOString().slice(0, 10));
  const [selectedTypes, setSelectedTypes] = useState<EquipmentType[]>(initialEquipment.map((item) => item.type));
  const [notebook, setNotebook] = useState<EquipmentDetails>(findEquipment(initialEquipment, "Notebook"));
  const [desktop, setDesktop] = useState<EquipmentDetails>(findEquipment(initialEquipment, "Desktop"));
  const [phone, setPhone] = useState<EquipmentDetails>(findEquipment(initialEquipment, "Telefone"));
  const [termFileName, setTermFileName] = useState(initialRecord?.termFileName ?? "");
  const [termFileData, setTermFileData] = useState(initialRecord?.termFileData ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  const hasNotebook = selectedTypes.includes("Notebook");
  const hasDesktop = selectedTypes.includes("Desktop");
  const hasPhone = selectedTypes.includes("Telefone");
  const termAttached = termFileName.length > 0;

  const simpleEquipment = useMemo(
    () => selectedTypes.filter((type) => !["Notebook", "Desktop", "Telefone"].includes(type)),
    [selectedTypes]
  );

  function toggleEquipment(type: EquipmentType, checked: boolean) {
    setSelectedTypes((current) => (checked ? Array.from(new Set([...current, type])) : current.filter((item) => item !== type)));
  }

  async function handleFile(file?: File) {
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrors((current) => ({ ...current, termFile: "Envie apenas arquivos PDF." }));
      setTermFileName("");
      setTermFileData("");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((current) => ({ ...current, termFile: "O PDF deve ter no máximo 10 MB." }));
      setTermFileName("");
      setTermFileData("");
      return;
    }

    setErrors((current) => ({ ...current, termFile: undefined }));
    setTermFileName(file.name);
    setTermFileData(await fileToDataUrl(file));
  }

  function handleSubmit() {
    const nextErrors: FormErrors = {};

    if (!collaborator.trim()) nextErrors.collaborator = "Informe o nome completo.";
    if (!role.trim()) nextErrors.role = "Informe o cargo.";
    if (!location.trim()) nextErrors.location = "Informe a localidade.";
    if (!manager.trim()) nextErrors.manager = "Informe o gestor.";
    if (!["E1", "E3"].includes(license)) nextErrors.license = "Selecione E1 ou E3.";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const equipment: InventoryRecord["equipment"] = [];

    if (hasNotebook) {
      equipment.push({ ...notebook, type: "Notebook" });
    }

    if (hasDesktop) {
      equipment.push({ ...desktop, type: "Desktop" });
    }

    if (hasPhone) {
      equipment.push({ ...phone, type: "Telefone" });
    }

    simpleEquipment.forEach((type) => equipment.push({ type }));

    onSave({
      id: initialRecord?.id ?? `inv-${Date.now()}`,
      collaborator: collaborator.trim(),
      role: role.trim(),
      location: location.trim(),
      manager: manager.trim(),
      license,
      termAttached,
      termFileName: termAttached ? termFileName : undefined,
      termFileData: termAttached ? termFileData : undefined,
      regDate,
      equipment
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Dados do colaborador</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FieldError message={errors.collaborator}>
            <Input label="Nome completo" value={collaborator} onChange={(event) => setCollaborator(event.target.value)} />
          </FieldError>
          <FieldError message={errors.role}>
            <Input label="Cargo" value={role} onChange={(event) => setRole(event.target.value)} />
          </FieldError>
          <FieldError message={errors.location}>
            <Input label="Localidade" value={location} onChange={(event) => setLocation(event.target.value)} />
          </FieldError>
          <FieldError message={errors.manager}>
            <Input label="Gestor" value={manager} onChange={(event) => setManager(event.target.value)} />
          </FieldError>
          <FieldError message={errors.license}>
            <Select
              label="Licença de e-mail"
              value={license}
              onChange={(event) => setLicense(event.target.value as "E1" | "E3")}
              options={[
                { label: "E1", value: "E1" },
                { label: "E3", value: "E3" }
              ]}
            />
          </FieldError>
          <Input label="Data de cadastro" type="date" value={regDate} onChange={(event) => setRegDate(event.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recursos entregues</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resourceOptions.map((option) => (
            <div key={option.type} className="flex items-center gap-3 rounded-md border border-border p-3 text-sm font-medium">
              <option.icon className="h-4 w-4 text-primary" />
              <Checkbox
                label={option.label}
                checked={selectedTypes.includes(option.type)}
                onChange={(event) => toggleEquipment(option.type, event.target.checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {(hasNotebook || hasDesktop || hasPhone) && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes técnicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {hasNotebook && (
              <TechnicalBlock title="Notebook">
                <Input label="Serial Number" value={notebook.serialNumber ?? ""} onChange={(event) => setNotebook({ ...notebook, serialNumber: event.target.value })} />
                <Input label="Hostname" value={notebook.hostname ?? ""} onChange={(event) => setNotebook({ ...notebook, hostname: event.target.value })} />
              </TechnicalBlock>
            )}
            {hasDesktop && (
              <TechnicalBlock title="Desktop">
                <Input label="Serial Number" value={desktop.serialNumber ?? ""} onChange={(event) => setDesktop({ ...desktop, serialNumber: event.target.value })} />
                <Input label="Hostname" value={desktop.hostname ?? ""} onChange={(event) => setDesktop({ ...desktop, hostname: event.target.value })} />
              </TechnicalBlock>
            )}
            {hasPhone && (
              <TechnicalBlock title="Celular">
                <Input label="Número do chip" value={phone.chipNumber ?? ""} onChange={(event) => setPhone({ ...phone, chipNumber: event.target.value })} />
                <Input label="IMEI" value={phone.imei ?? ""} onChange={(event) => setPhone({ ...phone, imei: event.target.value })} />
                <Input label="ID Pulsus" value={phone.pulsusId ?? ""} onChange={(event) => setPhone({ ...phone, pulsusId: event.target.value })} />
              </TechnicalBlock>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Termo de uso</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_220px]">
          <FieldError message={errors.termFile}>
            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
              <Upload className="mb-2 h-5 w-5 text-primary" />
              Upload de PDF
              <input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(event) => handleFile(event.target.files?.[0])} />
            </label>
          </FieldError>
          <div className="space-y-3 rounded-md border border-border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Nome do arquivo anexado</p>
              <p className="mt-1 truncate text-sm font-medium">{termFileName || "Nenhum arquivo anexado"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status do termo</p>
              <Badge className="mt-1" tone={termAttached ? "success" : "warning"}>
                {termAttached ? "Termo anexado" : "Termo pendente"}
              </Badge>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              disabled={!termAttached}
              onClick={() => {
                setTermFileName("");
                setTermFileData("");
              }}
            >
              <X className="h-4 w-4" />
              Remover arquivo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>Salvar cadastro</Button>
      </div>
    </div>
  );
}

function FieldError({ children, message }: { children: ReactNode; message?: string }) {
  return (
    <div>
      {children}
      {message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null}
    </div>
  );
}

function TechnicalBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Badge tone="info">{title}</Badge>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">{children}</div>
    </div>
  );
}

function findEquipment(equipment: InventoryRecord["equipment"], type: EquipmentType): EquipmentDetails {
  return equipment.find((item) => item.type === type) ?? {};
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}
