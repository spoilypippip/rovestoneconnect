import catalogData from "@/data/catalog.json";

export type CatalogPricing =
  | { mode: "fixed"; thb: number; usd: number | null }
  | {
      mode: "quote";
      thbLow: number;
      thbHigh: number;
      usdLow: number | null;
      usdHigh: number | null;
    };

export type CatalogItem = {
  id: string;
  tierLabel: string;
  isAddon: boolean;
  recommended: boolean;
  description: string;
  unit: string;
  pricing: CatalogPricing;
  memberNote?: string;
};

export type CatalogCategory = {
  number: number;
  slug: string;
  name: string;
  items: CatalogItem[];
};

export type Catalog = {
  generatedAt: string;
  source: string;
  categories: CatalogCategory[];
};

// Regenerate with `npm run catalog:import` after the pricing workbook changes.
export const catalog = catalogData as Catalog;

export function getCategory(slug: string): CatalogCategory | undefined {
  return catalog.categories.find((c) => c.slug === slug);
}

export function getItem(id: string): CatalogItem | undefined {
  for (const category of catalog.categories) {
    const item = category.items.find((i) => i.id === id);
    if (item) return item;
  }
  return undefined;
}

export function getItemWithCategory(
  id: string,
): { item: CatalogItem; category: CatalogCategory } | undefined {
  for (const category of catalog.categories) {
    const item = category.items.find((i) => i.id === id);
    if (item) return { item, category };
  }
  return undefined;
}
