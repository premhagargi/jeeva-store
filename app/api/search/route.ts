import { prisma } from "@/lib/prisma";
import { styleFor } from "@/lib/category-style";

export const runtime = "nodejs";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(s: string): string {
  return s.replace(/\s+/g, "");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q") ?? "";
  const nq = normalize(raw);
  if (!nq) return Response.json({ products: [] });

  const qTokens = nq.split(/\s+/).filter(Boolean);
  const nqCompact = compact(nq);

  const rows = await prisma.product.findMany({
    include: { inventory: true, category: true },
    take: 2000,
  });

  type Scored = {
    score: number;
    product: (typeof rows)[number];
  };

  const scored: Scored[] = [];

  for (const p of rows) {
    if (!p.inventory) continue;
    const name = normalize(p.name);
    const nameCompact = compact(name);
    const nameTokens = name.split(/\s+/).filter(Boolean);
    const cat = normalize(p.category.name);

    let score = 0;

    if (name === nq) score += 1000;
    else if (name.startsWith(nq)) score += 600;
    else if (nameCompact === nqCompact) score += 700;
    else if (nameCompact.startsWith(nqCompact)) score += 450;
    else if (nameCompact.includes(nqCompact) && nqCompact.length >= 3) score += 220;

    for (const t of qTokens) {
      if (!t) continue;
      if (nameTokens.includes(t)) {
        score += 120;
        continue;
      }
      const prefixHit = nameTokens.find((w) => w.startsWith(t));
      if (prefixHit) {
        score += 80;
        continue;
      }
      if (name.includes(t)) {
        score += 40;
        continue;
      }

      let bestDist = Infinity;
      let bestLen = 0;
      for (const w of nameTokens) {
        if (Math.abs(w.length - t.length) > 2) continue;
        const d = levenshtein(w, t);
        if (d < bestDist) {
          bestDist = d;
          bestLen = w.length;
        }
      }
      if (bestDist === 1 && t.length >= 3) {
        score += 50;
        continue;
      }
      if (bestDist === 2 && t.length >= 5 && bestLen >= 5) {
        score += 20;
        continue;
      }

      if (cat.includes(t)) score += 25;
    }

    if (score > 0) {
      const inv = p.inventory;
      const available = inv.isAvailable && inv.stockQty > 0;
      if (available) score += 5;
      scored.push({ score, product: p });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.product.name.localeCompare(b.product.name);
  });

  const products = scored.slice(0, 60).map(({ product: p }) => {
    const inv = p.inventory!;
    const style = styleFor(p.category.name);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      unit: inv.unit,
      quantityValue: inv.quantityValue,
      price: inv.price ?? 0,
      emoji: style.emoji,
      bg: style.bg,
      imageUrl: p.imageUrl,
      isAvailable: inv.isAvailable && inv.stockQty > 0,
    };
  });

  return Response.json({ products });
}
