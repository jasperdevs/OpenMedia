import Database, { type Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const GENERATIONS_DIR = path.join(DATA_DIR, "generations");
const DB_PATH = path.join(DATA_DIR, "forge.db");

let _db: DatabaseType | null = null;

function getDb(): DatabaseType {
  if (_db) return _db;

  fs.mkdirSync(GENERATIONS_DIR, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("busy_timeout = 5000");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS models (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'unclassified',
      enabled INTEGER DEFAULT 1,
      cost_per_gen REAL DEFAULT 0,
      meta_json TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS classification_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      priority INTEGER DEFAULT 100,
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      media_type TEXT NOT NULL,
      model_id TEXT NOT NULL,
      model_name TEXT NOT NULL,
      prompt TEXT NOT NULL,
      negative_prompt TEXT DEFAULT '',
      settings_json TEXT DEFAULT '{}',
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_generations_media_type ON generations(media_type);
    CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_generations_model_id ON generations(model_id);
  `);

  // Migrations
  try {
    const tableInfo = _db.prepare("SELECT sql FROM sqlite_master WHERE name = 'models'").get() as { sql: string } | undefined;
    const sql = tableInfo?.sql ?? "";

    // Add missing columns
    if (!sql.includes("cost_per_gen")) {
      _db.exec("ALTER TABLE models ADD COLUMN cost_per_gen REAL DEFAULT 0");
    }
    if (!sql.includes("meta_json")) {
      _db.exec("ALTER TABLE models ADD COLUMN meta_json TEXT DEFAULT '{}'");
    }

    // If old CHECK constraint or old default, recreate table
    if (sql.includes("CHECK") || (sql.includes("DEFAULT 'image'") && !sql.includes("unclassified"))) {
      _db.exec(`
        CREATE TABLE IF NOT EXISTS models_v2 (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT DEFAULT 'unclassified',
          enabled INTEGER DEFAULT 1,
          cost_per_gen REAL DEFAULT 0,
          meta_json TEXT DEFAULT '{}',
          created_at TEXT DEFAULT (datetime('now'))
        );
        INSERT OR IGNORE INTO models_v2 (id, name, category, enabled, created_at)
          SELECT id, name, category, enabled, created_at FROM models;
        DROP TABLE models;
        ALTER TABLE models_v2 RENAME TO models;
      `);
    }
  } catch { /* already migrated */ }

  // Seed classification rules — uses INSERT OR IGNORE so user edits are kept
  // but new rules get added on each version bump
  {
    const seed = _db.prepare(
      "INSERT OR IGNORE INTO classification_rules (pattern, category, priority) VALUES (?, ?, ?)"
    );
    const rules: Array<[string, string, number]> = [
      // Image models
      ["text-to-image", "image", 10],
      ["image-generation", "image", 10],
      ["image-preview", "image", 12],
      ["img-gen", "image", 12],
      ["txt2img", "image", 12],
      ["diffusion", "image", 15],
      ["dall-e", "image", 15],
      ["flux", "image", 15],
      ["sdxl", "image", 15],
      ["stable-diffusion", "image", 15],
      ["nano-banana", "image", 18],
      ["see-dream", "image", 18],
      ["seedream", "image", 18],
      ["ideogram", "image", 18],
      ["imagen", "image", 18],
      ["recraft", "image", 18],
      ["gpt-image", "image", 18],
      ["imagine-image", "image", 18],
      ["qwen-image", "image", 18],
      ["wan-image", "image", 18],
      ["hunyuan-image", "image", 18],
      ["kolors", "image", 18],
      ["pixart", "image", 18],
      ["playground", "image", 18],
      ["openjourney", "image", 18],
      ["midjourney", "image", 18],
      // Video models
      ["text-to-video", "video", 10],
      ["video-generation", "video", 10],
      ["video-gen", "video", 12],
      ["txt2vid", "video", 12],
      ["veo", "video", 15],
      ["runway", "video", 15],
      ["kling", "video", 15],
      ["sora", "video", 15],
      ["hailuo", "video", 18],
      ["wan-video", "video", 18],
      ["wan-2.6-video", "video", 18],
      ["wan-2.2-video", "video", 18],
      ["seedance", "video", 18],
      ["ltx", "video", 18],
      ["cogvideo", "video", 18],
      ["mochi", "video", 18],
      ["luma", "video", 18],
      ["pika", "video", 18],
      ["hunyuan-motion", "video", 18],
      ["imagine-video", "video", 18],
      ["omnihuman", "video", 18],
      ["dreamactor", "video", 18],
      ["vidu", "video", 18],
      ["to-video", "video", 20],
      ["image-to-video", "video", 20],
      // Audio models
      ["text-to-speech", "audio", 10],
      ["text-to-audio", "audio", 10],
      ["speech-synthesis", "audio", 10],
      ["tts", "audio", 12],
      ["audio-generation", "audio", 12],
      ["musicgen", "audio", 15],
      ["whisper", "audio", 15],
      ["elevenlabs", "audio", 15],
      ["eleven-v", "audio", 15],
      ["minimax-speech", "audio", 18],
      ["minimax-voice", "audio", 18],
      ["sonauto", "audio", 18],
      ["ace-step", "audio", 18],
      ["bark", "audio", 18],
      ["xtts", "audio", 18],
      ["coqui", "audio", 18],
      // 3D models
      ["text-to-3d", "3d", 10],
      ["3d-generation", "3d", 10],
      ["mesh-generation", "3d", 12],
      ["shap-e", "3d", 15],
      ["point-e", "3d", 15],
      ["hunyuan-3d", "3d", 18],
      ["trellis", "3d", 18],
      ["tripo", "3d", 18],
      ["hunyuan-part", "3d", 18],
    ];
    for (const [pattern, category, priority] of rules) {
      seed.run(pattern, category, priority);
    }
  }

  return _db;
}

const db = new Proxy({} as DatabaseType, {
  get(_target, prop: string | symbol) {
    const instance = getDb();
    const value = instance[prop as keyof DatabaseType];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

export default db;
export { DATA_DIR, GENERATIONS_DIR, DB_PATH };
