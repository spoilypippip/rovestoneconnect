import ExcelJS from "exceljs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const WORKBOOK_PATH = "Shalom_Thailand_ราคา_12หมวด_ต่อวีซ่า (1).xlsx";
const SHEET_NAME = "ราคา 11 หมวด"; // legacy name; sheet actually holds all 12 categories
const OUT_DIR = "data";
const CATALOG_PATH = path.join(OUT_DIR, "catalog.json");
const INTERNAL_PATH = path.join(OUT_DIR, "catalog.internal.json");
const SLUG_MAP_PATH = path.join(OUT_DIR, "catalog-slug-map.json");

const COLS = {
  category: 1,
  tier: 2,
  description: 3,
  thbLow: 4,
  thbHigh: 5,
  usdLow: 6,
  usdHigh: 7,
  unit: 8,
  competitor: 9,
  competitorPrice: 10,
  sourceUrl: 11,
  pricingRationale: 12,
  confidence: 13,
};

function cellValue(cell) {
  const v = cell?.value;
  if (v == null) return null;
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((t) => t.text).join("").trim();
    if ("result" in v) return v.result ?? null;
    if ("text" in v) return v.text;
    if ("hyperlink" in v) return v.text ?? v.hyperlink;
  }
  if (typeof v === "string") return v.trim();
  return v;
}

function slugifyAscii(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function parseCategory(raw) {
  const match = /^(\d+)\.\s*(.+)$/.exec(raw ?? "");
  if (!match) {
    throw new Error(`Could not parse category header: ${JSON.stringify(raw)}`);
  }
  const number = Number(match[1]);
  const name = match[2].trim();
  return { number, name, slug: slugifyAscii(name) };
}

function durationSlug(tierRaw) {
  const dayMatch = /^(\d+)\s*วัน/.exec(tierRaw);
  if (dayMatch) return `${dayMatch[1]}-day`;
  const yearMatch = /^(\d+)\s*ปี/.exec(tierRaw);
  if (yearMatch) return `${yearMatch[1]}-year`;
  return null;
}

function toNumberOrNull(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function loadJsonIfExists(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(WORKBOOK_PATH);

  const ws = wb.getWorksheet(SHEET_NAME);
  if (!ws) {
    throw new Error(`Sheet "${SHEET_NAME}" not found in ${WORKBOOK_PATH}`);
  }

  const slugMap = (await loadJsonIfExists(SLUG_MAP_PATH)) ?? {};
  const addonCounters = {}; // categorySlug -> next addon index, derived from existing map

  for (const [, id] of Object.entries(slugMap)) {
    const m = /^(.+)--addon-(\d+)$/.exec(id);
    if (m) {
      const [, catSlug, n] = m;
      addonCounters[catSlug] = Math.max(addonCounters[catSlug] ?? 0, Number(n));
    }
  }

  const categoriesBySlug = new Map();
  const internalRows = [];
  const usedIds = new Set();
  let processed = 0;

  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const categoryRaw = cellValue(row.getCell(COLS.category));
    if (categoryRaw == null || String(categoryRaw).trim() === "") continue;

    const tierRaw = String(cellValue(row.getCell(COLS.tier)) ?? "").trim();
    const description = String(cellValue(row.getCell(COLS.description)) ?? "").trim();
    const thbLow = toNumberOrNull(cellValue(row.getCell(COLS.thbLow)));
    const thbHigh = toNumberOrNull(cellValue(row.getCell(COLS.thbHigh)));
    const usdLowRaw = toNumberOrNull(cellValue(row.getCell(COLS.usdLow)));
    const usdHighRaw = toNumberOrNull(cellValue(row.getCell(COLS.usdHigh)));
    const unit = String(cellValue(row.getCell(COLS.unit)) ?? "").trim();

    const category = parseCategory(categoryRaw);
    const isAddon = /^add-on:/i.test(tierRaw);
    const recommended = tierRaw.includes("แนะนำ");

    // Rule: D === 0 means free-with-membership; the purchasable (non-member)
    // price is the value in column E for that row. This check must happen
    // before the range/quote check below, since D=0 rows also populate E.
    let pricing;
    let memberNote = null;
    if (thbLow === 0) {
      memberNote = "Free for members.";
      pricing = {
        mode: "fixed",
        thb: thbHigh,
        usd: usdHighRaw != null ? Math.round(usdHighRaw * 100) / 100 : null,
      };
    } else if (thbHigh != null) {
      pricing = {
        mode: "quote",
        thbLow,
        thbHigh,
        usdLow: usdLowRaw != null ? Math.round(usdLowRaw * 100) / 100 : null,
        usdHigh: usdHighRaw != null ? Math.round(usdHighRaw * 100) / 100 : null,
      };
    } else {
      pricing = {
        mode: "fixed",
        thb: thbLow,
        usd: usdLowRaw != null ? Math.round(usdLowRaw * 100) / 100 : null,
      };
    }

    // Stable ID: look up by natural key (category + exact tier text) first,
    // so re-imports keep the same slug even if row order or prices shift.
    const naturalKey = `${categoryRaw}||${tierRaw}`;
    let id = slugMap[naturalKey];
    if (!id) {
      if (isAddon) {
        const next = (addonCounters[category.slug] ?? 0) + 1;
        addonCounters[category.slug] = next;
        id = `${category.slug}--addon-${next}`;
      } else {
        const dSlug = durationSlug(tierRaw) ?? slugifyAscii(tierRaw) ?? `tier-${r}`;
        id = `${category.slug}--${dSlug}`;
      }
      if (usedIds.has(id)) {
        let n = 2;
        while (usedIds.has(`${id}-${n}`)) n++;
        id = `${id}-${n}`;
      }
      slugMap[naturalKey] = id;
    }
    usedIds.add(id);

    if (!categoriesBySlug.has(category.slug)) {
      categoriesBySlug.set(category.slug, {
        number: category.number,
        slug: category.slug,
        name: category.name,
        items: [],
      });
    }

    categoriesBySlug.get(category.slug).items.push({
      id,
      tierLabel: tierRaw,
      isAddon,
      recommended,
      description,
      unit,
      pricing,
      ...(memberNote ? { memberNote } : {}),
    });

    internalRows.push({
      id,
      competitor: String(cellValue(row.getCell(COLS.competitor)) ?? "") || null,
      competitorPrice: String(cellValue(row.getCell(COLS.competitorPrice)) ?? "") || null,
      sourceUrl: String(cellValue(row.getCell(COLS.sourceUrl)) ?? "") || null,
      pricingRationale: String(cellValue(row.getCell(COLS.pricingRationale)) ?? "") || null,
      confidence: String(cellValue(row.getCell(COLS.confidence)) ?? "") || null,
    });

    processed++;
  }

  const categories = [...categoriesBySlug.values()].sort((a, b) => a.number - b.number);

  await mkdir(OUT_DIR, { recursive: true });

  const generatedAt = new Date().toISOString();

  await writeFile(
    CATALOG_PATH,
    JSON.stringify({ generatedAt, source: WORKBOOK_PATH, categories }, null, 2) + "\n",
    "utf8",
  );

  await writeFile(
    INTERNAL_PATH,
    JSON.stringify(
      {
        generatedAt,
        note: "Internal/admin only — competitive pricing research. Never render on the public site.",
        rows: internalRows,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  await writeFile(SLUG_MAP_PATH, JSON.stringify(slugMap, null, 2) + "\n", "utf8");

  const quoteCount = categories.flatMap((c) => c.items).filter((i) => i.pricing.mode === "quote").length;
  const addonCount = categories.flatMap((c) => c.items).filter((i) => i.isAddon).length;
  const memberCount = categories.flatMap((c) => c.items).filter((i) => i.memberNote).length;

  console.log(`Parsed ${processed} rows across ${categories.length} categories.`);
  console.log(`  fixed: ${processed - quoteCount}, quote: ${quoteCount}, addons: ${addonCount}, free-with-membership: ${memberCount}`);
  console.log(`Wrote ${CATALOG_PATH}, ${INTERNAL_PATH}, ${SLUG_MAP_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
