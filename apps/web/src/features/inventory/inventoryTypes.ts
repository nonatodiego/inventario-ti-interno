export type EquipmentType = "Notebook" | "Desktop" | "Telefone" | "Monitor" | "Mouse" | "Teclado" | "Headset" | "Suporte";

export type InventoryRecord = {
  id: string;
  collaborator: string;
  role: string;
  location: string;
  manager: string;
  license: "E1" | "E3";
  termAttached: boolean;
  termFileName?: string;
  termFileData?: string;
  regDate: string;
  equipment: Array<{
    type: EquipmentType;
    serialNumber?: string;
    hostname?: string;
    chipNumber?: string;
    imei?: string;
    pulsusId?: string;
  }>;
};
