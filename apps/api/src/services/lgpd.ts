import type { Role } from "@inventario-ti/shared";
import { canViewSensitive } from "../http/auth";

type Details = Record<string, unknown> | null;

export function maskSensitiveInventory<T extends { notebookDetails?: Details; desktopDetails?: Details; phoneDetails?: Details }>(
  record: T,
  role: Role
) {
  if (canViewSensitive(role)) {
    return record;
  }

  return {
    ...record,
    notebookDetails: maskAssetDetails(record.notebookDetails),
    desktopDetails: maskAssetDetails(record.desktopDetails),
    phoneDetails: maskPhoneDetails(record.phoneDetails)
  };
}

export function anonymizeName(name: string) {
  const normalized = name.trim();

  if (!normalized) {
    return "Anonimizado";
  }

  return `Colaborador ${createStableSuffix(normalized)}`;
}

function maskAssetDetails(details: Details) {
  if (!details) {
    return details;
  }

  return {
    ...details,
    serialNumber: maskValue(details.serialNumber)
  };
}

function maskPhoneDetails(details: Details) {
  if (!details) {
    return details;
  }

  return {
    ...details,
    chipNumber: maskValue(details.chipNumber),
    imei: maskValue(details.imei)
  };
}

function maskValue(value: unknown) {
  if (typeof value !== "string" || value.length === 0) {
    return value;
  }

  return value.length <= 4 ? "****" : `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

function createStableSuffix(value: string) {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(16).slice(0, 6).toUpperCase();
}
