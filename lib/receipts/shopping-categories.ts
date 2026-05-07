/** Labels for receipt shopping_category (AI + normalized). */
export const SHOPPING_CATEGORY_LABELS: Record<string, string> = {
  groceries: "Groceries",
  pharmacy: "Pharmacy / meds",
  household: "Household supplies",
  eating_out: "Eating out",
  electronics: "Electronics",
  beauty: "Beauty / personal care",
  alcohol_tobacco: "Alcohol / tobacco",
  transport: "Transport",
  entertainment: "Entertainment",
  clothing: "Clothing",
  pets: "Pet supplies",
  stationery: "Books / stationery",
  other: "Other",
};

export function shoppingCategoryLabel(code: string | null | undefined): string | null {
  if (!code?.trim()) return null;
  const key = code.trim().toLowerCase();
  return SHOPPING_CATEGORY_LABELS[key] ?? key.replace(/_/g, " ");
}

const ALLOWED_KEYS = new Set(Object.keys(SHOPPING_CATEGORY_LABELS));

/** Maps model output to one of our category keys. */
export function normalizeShoppingCategory(value: unknown): string {
  if (typeof value !== "string") return "other";
  const k = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (ALLOWED_KEYS.has(k)) return k;
  const stripped = k.replace(/[^a-z_]/g, "");
  if (ALLOWED_KEYS.has(stripped)) return stripped;
  return "other";
}
