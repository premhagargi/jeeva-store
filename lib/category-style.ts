type Style = { emoji: string; bg: string };

const KEYWORDS: Array<[RegExp, Style]> = [
  [/bath|soap/i,            { emoji: "🧼",  bg: "bg-pink-100" }],
  [/biscuit|cookie/i,       { emoji: "🍪",  bg: "bg-amber-100" }],
  [/cake/i,                 { emoji: "🎂",  bg: "bg-rose-100" }],
  [/chocolate|candy/i,      { emoji: "🍫",  bg: "bg-amber-100" }],
  [/detergent/i,            { emoji: "🧺",  bg: "bg-indigo-100" }],
  [/disposable/i,           { emoji: "🥡",  bg: "bg-stone-100" }],
  [/grain|pulse|dal/i,      { emoji: "🌾",  bg: "bg-orange-100" }],
  [/grocery/i,              { emoji: "🛒",  bg: "bg-emerald-100" }],
  [/hair/i,                 { emoji: "💆",  bg: "bg-fuchsia-100" }],
  [/maggi|noodle/i,         { emoji: "🍜",  bg: "bg-red-100" }],
  [/non-?veg/i,             { emoji: "🍗",  bg: "bg-red-50" }],
  [/masala|spice/i,         { emoji: "🌶️",  bg: "bg-amber-100" }],
  [/oil|ghee/i,             { emoji: "🫙",  bg: "bg-yellow-100" }],
  [/pickle/i,               { emoji: "🥒",  bg: "bg-green-100" }],
  [/pooja/i,                { emoji: "🪔",  bg: "bg-yellow-100" }],
  [/repell/i,               { emoji: "🦟",  bg: "bg-lime-100" }],
  [/station/i,              { emoji: "✏️",  bg: "bg-blue-100" }],
  [/surface/i,              { emoji: "🧹",  bg: "bg-teal-100" }],
  [/tea|coffee/i,           { emoji: "☕",  bg: "bg-amber-100" }],
  [/utensil/i,              { emoji: "🧽",  bg: "bg-cyan-100" }],
  [/rice/i,                 { emoji: "🍚",  bg: "bg-orange-100" }],
];

const FALLBACK: Style = { emoji: "🛍️", bg: "bg-gray-100" };

export function styleFor(text: string): Style {
  for (const [re, s] of KEYWORDS) if (re.test(text)) return s;
  return FALLBACK;
}

export function styleForCategory(category: {
  name: string;
  emoji?: string | null;
  bgColor?: string | null;
}): Style {
  const base = styleFor(category.name);
  return {
    emoji: category.emoji?.trim() || base.emoji,
    bg: category.bgColor?.trim() || base.bg,
  };
}

export const CATEGORY_BG_PALETTE: string[] = [
  "bg-emerald-100",
  "bg-amber-100",
  "bg-blue-100",
  "bg-pink-100",
  "bg-rose-100",
  "bg-orange-100",
  "bg-indigo-100",
  "bg-fuchsia-100",
  "bg-red-100",
  "bg-yellow-100",
  "bg-green-100",
  "bg-teal-100",
  "bg-cyan-100",
  "bg-lime-100",
  "bg-stone-100",
  "bg-gray-100",
];

export function formatQuantity(value: number | null | undefined, unit: string): string {
  if (value == null) return unit;
  const v = Number.isInteger(value) ? value.toString() : value.toString();
  return `${v} ${unit}`;
}
