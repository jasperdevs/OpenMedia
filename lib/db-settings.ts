import db from "./db";

export interface ApiSettings {
  apiEndpoint: string;
  apiKey: string;
}

export function getSettings(): ApiSettings {
  const endpoint = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get("apiEndpoint") as { value: string } | undefined;
  const key = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get("apiKey") as { value: string } | undefined;

  return {
    apiEndpoint: endpoint?.value ?? "",
    apiKey: key?.value ?? "",
  };
}

export function saveSettings(settings: ApiSettings): void {
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );

  const transaction = db.transaction(() => {
    upsert.run("apiEndpoint", settings.apiEndpoint);
    upsert.run("apiKey", settings.apiKey);
  });

  transaction();
}

export function getSetting(key: string): string | null {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}
