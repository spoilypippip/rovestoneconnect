import type { CatalogItem } from "@/content/catalog";
import { itemCopy } from "@/content/catalog-copy";
import TierCardAction from "@/components/cart/TierCardAction";

function formatTHB(n: number) {
  return `฿${n.toLocaleString("en-US")}`;
}

export default function TierCard({
  item,
  categorySlug,
  categoryName,
}: {
  item: CatalogItem;
  categorySlug: string;
  categoryName: string;
}) {
  const copy = itemCopy[item.id];
  const name = copy?.name ?? item.tierLabel;
  const description = copy?.description ?? item.description;

  return (
    <div
      className={`border p-6 ${
        item.recommended ? "border-brass bg-deepteal text-paper" : "border-line bg-paper text-ink"
      }`}
    >
      {item.recommended && (
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-paper/70">
          Recommended
        </p>
      )}
      <h3 className={`mt-1 text-lg ${item.recommended ? "text-paper" : "text-ink"}`}>{name}</h3>
      <p
        className={`mt-3 text-sm leading-relaxed ${
          item.recommended ? "text-paper/80" : "text-charcoal"
        }`}
      >
        {description}
      </p>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        {item.pricing.mode === "fixed" ? (
          <span className="text-base">{formatTHB(item.pricing.thb)}</span>
        ) : (
          <span className="text-base">
            {formatTHB(item.pricing.thbLow)}–{formatTHB(item.pricing.thbHigh)}
          </span>
        )}
        <span
          className={`text-xs ${item.recommended ? "text-paper/60" : "text-charcoal/70"}`}
        >
          {item.unit}
        </span>
      </div>

      {item.memberNote && (
        <p className={`mt-2 text-xs ${item.recommended ? "text-paper/60" : "text-charcoal/70"}`}>
          {item.memberNote}
        </p>
      )}

      <TierCardAction
        id={item.id}
        categorySlug={categorySlug}
        categoryName={categoryName}
        name={name}
        mode={item.pricing.mode}
        unitPriceThb={item.pricing.mode === "fixed" ? item.pricing.thb : undefined}
        recommended={item.recommended}
      />
    </div>
  );
}
