CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'consulta',
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);

CREATE TABLE IF NOT EXISTS inventory_records (
  id TEXT PRIMARY KEY NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  location TEXT NOT NULL,
  manager TEXT NOT NULL,
  email_license TEXT NOT NULL,
  has_notebook INTEGER NOT NULL DEFAULT 0,
  has_desktop INTEGER NOT NULL DEFAULT 0,
  has_phone INTEGER NOT NULL DEFAULT 0,
  has_monitor INTEGER NOT NULL DEFAULT 0,
  has_mouse INTEGER NOT NULL DEFAULT 0,
  has_keyboard INTEGER NOT NULL DEFAULT 0,
  has_headset INTEGER NOT NULL DEFAULT 0,
  has_notebook_stand INTEGER NOT NULL DEFAULT 0,
  term_attached INTEGER NOT NULL DEFAULT 0,
  term_file_name TEXT,
  term_file_path TEXT,
  reg_date TEXT NOT NULL DEFAULT CURRENT_DATE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notebook_details (
  id TEXT PRIMARY KEY NOT NULL,
  inventory_record_id TEXT NOT NULL,
  serial_number TEXT,
  hostname TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inventory_record_id) REFERENCES inventory_records(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS notebook_details_record_idx ON notebook_details (inventory_record_id);

CREATE TABLE IF NOT EXISTS desktop_details (
  id TEXT PRIMARY KEY NOT NULL,
  inventory_record_id TEXT NOT NULL,
  serial_number TEXT,
  hostname TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inventory_record_id) REFERENCES inventory_records(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS desktop_details_record_idx ON desktop_details (inventory_record_id);

CREATE TABLE IF NOT EXISTS phone_details (
  id TEXT PRIMARY KEY NOT NULL,
  inventory_record_id TEXT NOT NULL,
  chip_number TEXT,
  imei TEXT,
  pulsus_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inventory_record_id) REFERENCES inventory_records(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS phone_details_record_idx ON phone_details (inventory_record_id);

CREATE TABLE IF NOT EXISTS available_resources (
  id TEXT PRIMARY KEY NOT NULL,
  resource_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  ip TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
