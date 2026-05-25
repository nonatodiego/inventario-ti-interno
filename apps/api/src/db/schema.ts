import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
};

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role", { enum: ["admin", "ti", "consulta"] }).notNull().default("consulta"),
    lastLogin: text("last_login"),
    ...timestamps
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email)
  })
);

export const inventoryRecords = sqliteTable("inventory_records", {
  id: text("id").primaryKey(),
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(),
  location: text("location").notNull(),
  manager: text("manager").notNull(),
  emailLicense: text("email_license", { enum: ["E1", "E3"] }).notNull(),
  hasNotebook: integer("has_notebook", { mode: "boolean" }).notNull().default(false),
  hasDesktop: integer("has_desktop", { mode: "boolean" }).notNull().default(false),
  hasPhone: integer("has_phone", { mode: "boolean" }).notNull().default(false),
  hasMonitor: integer("has_monitor", { mode: "boolean" }).notNull().default(false),
  hasMouse: integer("has_mouse", { mode: "boolean" }).notNull().default(false),
  hasKeyboard: integer("has_keyboard", { mode: "boolean" }).notNull().default(false),
  hasHeadset: integer("has_headset", { mode: "boolean" }).notNull().default(false),
  hasNotebookStand: integer("has_notebook_stand", { mode: "boolean" }).notNull().default(false),
  termAttached: integer("term_attached", { mode: "boolean" }).notNull().default(false),
  termFileName: text("term_file_name"),
  termFilePath: text("term_file_path"),
  regDate: text("reg_date").notNull().default(sql`CURRENT_DATE`),
  ...timestamps
});

export const notebookDetails = sqliteTable(
  "notebook_details",
  {
    id: text("id").primaryKey(),
    inventoryRecordId: text("inventory_record_id")
      .notNull()
      .references(() => inventoryRecords.id, { onDelete: "cascade" }),
    serialNumber: text("serial_number"),
    hostname: text("hostname"),
    ...timestamps
  },
  (table) => ({
    recordIdx: uniqueIndex("notebook_details_record_idx").on(table.inventoryRecordId)
  })
);

export const desktopDetails = sqliteTable(
  "desktop_details",
  {
    id: text("id").primaryKey(),
    inventoryRecordId: text("inventory_record_id")
      .notNull()
      .references(() => inventoryRecords.id, { onDelete: "cascade" }),
    serialNumber: text("serial_number"),
    hostname: text("hostname"),
    ...timestamps
  },
  (table) => ({
    recordIdx: uniqueIndex("desktop_details_record_idx").on(table.inventoryRecordId)
  })
);

export const phoneDetails = sqliteTable(
  "phone_details",
  {
    id: text("id").primaryKey(),
    inventoryRecordId: text("inventory_record_id")
      .notNull()
      .references(() => inventoryRecords.id, { onDelete: "cascade" }),
    chipNumber: text("chip_number"),
    imei: text("imei"),
    pulsusId: text("pulsus_id"),
    ...timestamps
  },
  (table) => ({
    recordIdx: uniqueIndex("phone_details_record_idx").on(table.inventoryRecordId)
  })
);

export const availableResources = sqliteTable("available_resources", {
  id: text("id").primaryKey(),
  resourceType: text("resource_type").notNull(),
  quantity: integer("quantity").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(0),
  ...timestamps
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  ip: text("ip"),
  details: text("details", { mode: "json" }),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const inventoryRecordsRelations = relations(inventoryRecords, ({ one }) => ({
  notebookDetails: one(notebookDetails, {
    fields: [inventoryRecords.id],
    references: [notebookDetails.inventoryRecordId]
  }),
  desktopDetails: one(desktopDetails, {
    fields: [inventoryRecords.id],
    references: [desktopDetails.inventoryRecordId]
  }),
  phoneDetails: one(phoneDetails, {
    fields: [inventoryRecords.id],
    references: [phoneDetails.inventoryRecordId]
  })
}));

export const notebookDetailsRelations = relations(notebookDetails, ({ one }) => ({
  inventoryRecord: one(inventoryRecords, {
    fields: [notebookDetails.inventoryRecordId],
    references: [inventoryRecords.id]
  })
}));

export const desktopDetailsRelations = relations(desktopDetails, ({ one }) => ({
  inventoryRecord: one(inventoryRecords, {
    fields: [desktopDetails.inventoryRecordId],
    references: [inventoryRecords.id]
  })
}));

export const phoneDetailsRelations = relations(phoneDetails, ({ one }) => ({
  inventoryRecord: one(inventoryRecords, {
    fields: [phoneDetails.inventoryRecordId],
    references: [inventoryRecords.id]
  })
}));
