export type LicenseMovementAction = "Transferência" | "Desalocação";
export type LicenseMovementStatus = "Transferida" | "Disponível";
export type LicenseMovementType = "O365 E1" | "O365 E3";
export type BackupStatus = "Realizado" | "Não realizado" | "Não informado";

export type LicenseMovement = {
  id: string;
  date: string;
  action: LicenseMovementAction;
  license: LicenseMovementType;
  previousUser: string;
  newUser?: string;
  responsible: string;
  finalStatus: LicenseMovementStatus;
  backupStatus: BackupStatus;
  notes?: string;
};

export const licenseOptions: Array<{ label: string; value: LicenseMovementType }> = [
  { label: "O365 E1", value: "O365 E1" },
  { label: "O365 E3", value: "O365 E3" }
];

export const actionOptions: Array<{ label: string; value: LicenseMovementAction }> = [
  { label: "Transferência", value: "Transferência" },
  { label: "Desalocação", value: "Desalocação" }
];

export const backupStatusOptions: Array<{ label: string; value: BackupStatus }> = [
  { label: "Backup realizado", value: "Realizado" },
  { label: "Backup não realizado", value: "Não realizado" },
  { label: "Não informado", value: "Não informado" }
];

export const responsibleOptions = [
  { label: "Diego Nonato", value: "Diego Nonato" },
  { label: "Rodrigo Murata", value: "Rodrigo Murata" },
  { label: "Richard Soares", value: "Richard Soares" },
  { label: "Cayque Anjos", value: "Cayque Anjos" },
  { label: "Rodrigo Abreu", value: "Rodrigo Abreu" }
];
