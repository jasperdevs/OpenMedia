import db from "./db";

export interface ClassificationRule {
  id: number;
  pattern: string;
  category: string;
  priority: number;
  enabled: number;
}

export function getClassificationRules(): ClassificationRule[] {
  return db
    .prepare(
      "SELECT id, pattern, category, priority, enabled FROM classification_rules WHERE enabled = 1 ORDER BY priority ASC, pattern ASC"
    )
    .all() as ClassificationRule[];
}
