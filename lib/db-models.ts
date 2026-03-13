import db from "./db";
import { classifyModel, type ModelCategory } from "./model-tagger";
import { extractPrice } from "./price-extractor";
import type { RawModel } from "./api-client";
import { getClassificationRules } from "./db-rules";

export interface Model {
  id: string;
  name: string;
  category: ModelCategory | "unclassified";
  enabled: number;
  cost_per_gen: number;
  meta_json: string;
  created_at: string;
}

export function getAllModels(): Model[] {
  return db.prepare("SELECT * FROM models ORDER BY name ASC").all() as Model[];
}

export function getModelsByCategory(category: string): Model[] {
  return db
    .prepare("SELECT * FROM models WHERE category = ? AND enabled = 1 ORDER BY name ASC")
    .all(category) as Model[];
}

export function getMediaModels(): Model[] {
  return db
    .prepare("SELECT * FROM models WHERE category NOT IN ('unclassified') ORDER BY category, name ASC")
    .all() as Model[];
}

export function getUnclassifiedModels(): Model[] {
  return db
    .prepare("SELECT * FROM models WHERE category = 'unclassified' ORDER BY name ASC")
    .all() as Model[];
}

/**
 * Upsert models from raw API response.
 * - New models: auto-classify + auto-price + store metadata
 * - Existing models with NO metadata (legacy): re-classify + store metadata + auto-price
 * - Existing models WITH metadata: update name + metadata, keep user's category & price
 */
export function upsertModelsFromApi(rawModels: RawModel[]): void {
  const rules = getClassificationRules();
  const existing = db.prepare(
    "SELECT id, category, meta_json, cost_per_gen FROM models"
  ).all() as Array<{ id: string; category: string; meta_json: string; cost_per_gen: number }>;
  const existingMap = new Map(existing.map((m) => [m.id, m]));

  const insertNew = db.prepare(
    "INSERT INTO models (id, name, category, cost_per_gen, meta_json) VALUES (?, ?, ?, ?, ?)"
  );
  const updateLegacy = db.prepare(
    "UPDATE models SET name = ?, category = ?, cost_per_gen = ?, meta_json = ? WHERE id = ?"
  );
  const updateFresh = db.prepare(
    "UPDATE models SET name = ?, meta_json = ? WHERE id = ?"
  );

  const transaction = db.transaction(() => {
    for (const raw of rawModels) {
      const id = raw.id;
      const name = (typeof raw.name === "string" ? raw.name : id) as string;
      const metaJson = JSON.stringify(raw);
      const category = classifyModel(raw, rules);
      const price = extractPrice(raw);

      const ex = existingMap.get(id);
      if (!ex) {
        // Brand new model
        insertNew.run(id, name, category, price, metaJson);
      } else if (ex.meta_json === "{}" || ex.meta_json === "" || !ex.meta_json) {
        // Legacy model with no metadata — reclassify + reprice
        updateLegacy.run(name, category, price || ex.cost_per_gen, metaJson, id);
      } else {
        // Already has metadata — only update name + raw meta, keep user's category/price
        updateFresh.run(name, metaJson, id);
        // But if user hasn't set a price and API now provides one, fill it in
        if (ex.cost_per_gen === 0 && price > 0) {
          db.prepare("UPDATE models SET cost_per_gen = ? WHERE id = ?").run(price, id);
        }
      }
    }
  });
  transaction();
}

/** Re-classify + re-price all models from stored metadata. Resets user overrides. */
export function reclassifyAllModels(): void {
  const rules = getClassificationRules();
  const all = db.prepare("SELECT id, meta_json FROM models").all() as Array<{ id: string; meta_json: string }>;
  const update = db.prepare("UPDATE models SET category = ?, cost_per_gen = ? WHERE id = ?");
  const transaction = db.transaction(() => {
    for (const model of all) {
      let raw: Record<string, unknown> = { id: model.id };
      try {
        const parsed = JSON.parse(model.meta_json);
        if (parsed && typeof parsed === "object") {
          raw = { id: model.id, ...(parsed as Record<string, unknown>) };
        }
      } catch { /* ignore invalid json */ }
      const category = classifyModel(raw, rules);
      const price = extractPrice(raw);
      update.run(category, price, model.id);
    }
  });
  transaction();
}

export function updateModelCategory(id: string, category: string): void {
  db.prepare("UPDATE models SET category = ? WHERE id = ?").run(category, id);
}

export function updateModelEnabled(id: string, enabled: boolean): void {
  db.prepare("UPDATE models SET enabled = ? WHERE id = ?").run(enabled ? 1 : 0, id);
}

export function updateModelCost(id: string, cost: number): void {
  db.prepare("UPDATE models SET cost_per_gen = ? WHERE id = ?").run(cost, id);
}

export function deleteModel(id: string): void {
  db.prepare("DELETE FROM models WHERE id = ?").run(id);
}
