import db from "./db";

export interface Generation {
  id: string;
  media_type: "image" | "video" | "audio";
  model_id: string;
  model_name: string;
  model_meta_json?: string;
  prompt: string;
  negative_prompt: string;
  settings_json: string;
  file_path: string;
  file_name: string;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface CreateGenerationInput {
  id: string;
  media_type: "image" | "video" | "audio";
  model_id: string;
  model_name: string;
  prompt: string;
  negative_prompt?: string;
  settings_json?: string;
  file_path: string;
  file_name: string;
  width?: number;
  height?: number;
}

export function createGeneration(input: CreateGenerationInput): Generation {
  db.prepare(
    `INSERT INTO generations (id, media_type, model_id, model_name, prompt, negative_prompt, settings_json, file_path, file_name, width, height)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    input.id,
    input.media_type,
    input.model_id,
    input.model_name,
    input.prompt,
    input.negative_prompt ?? "",
    input.settings_json ?? "{}",
    input.file_path,
    input.file_name,
    input.width ?? null,
    input.height ?? null
  );

  return db
    .prepare("SELECT * FROM generations WHERE id = ?")
    .get(input.id) as Generation;
}

export function getGenerations(filters?: {
  media_type?: string;
  model_id?: string;
  limit?: number;
  offset?: number;
}): Generation[] {
  let query = `
    SELECT generations.*, models.meta_json as model_meta_json
    FROM generations
    LEFT JOIN models ON models.id = generations.model_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (filters?.media_type) {
    query += " AND media_type = ?";
    params.push(filters.media_type);
  }

  if (filters?.model_id) {
    query += " AND model_id = ?";
    params.push(filters.model_id);
  }

  query += " ORDER BY created_at DESC";

  if (filters?.limit) {
    query += " LIMIT ?";
    params.push(filters.limit);
  }

  if (filters?.offset) {
    query += " OFFSET ?";
    params.push(filters.offset);
  }

  return db.prepare(query).all(...params) as Generation[];
}

export function getGeneration(id: string): Generation | undefined {
  return db
    .prepare(`
      SELECT generations.*, models.meta_json as model_meta_json
      FROM generations
      LEFT JOIN models ON models.id = generations.model_id
      WHERE generations.id = ?
    `)
    .get(id) as Generation | undefined;
}

export function deleteGeneration(id: string): void {
  db.prepare("DELETE FROM generations WHERE id = ?").run(id);
}

export function countGenerations(media_type?: string): number {
  if (media_type) {
    const row = db
      .prepare("SELECT COUNT(*) as count FROM generations WHERE media_type = ?")
      .get(media_type) as { count: number };
    return row.count;
  }
  const row = db
    .prepare("SELECT COUNT(*) as count FROM generations")
    .get() as { count: number };
  return row.count;
}
