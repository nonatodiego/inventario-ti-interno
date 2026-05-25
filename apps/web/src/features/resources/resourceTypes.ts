export type ResourceType = "Notebook" | "Desktop" | "Headset" | "Celular";

export type Resource = {
  id: string;
  type: ResourceType;
  total: number;
  available: number;
};

export const resourceTypeOptions: Array<{ label: string; value: ResourceType }> = [
  { label: "Notebook", value: "Notebook" },
  { label: "Desktop", value: "Desktop" },
  { label: "Headset", value: "Headset" },
  { label: "Celular", value: "Celular" }
];
