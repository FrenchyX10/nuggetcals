import type { FoodItem } from "@/lib/schema";
import { SIZE_LABEL, type PortionSize } from "@/lib/portion-size";

export const SUSHI_RE =
  /\b(sushi|sashimi|nigiri|maki|uramaki|temaki|chirashi|hand ?roll|california roll|spicy tuna|rainbow roll|dragon roll|philadelphia roll|spider roll|unagi|sake nigiri|maguro)\b/i;

export type SushiKind =
  | "nigiri"
  | "sashimi"
  | "maki"
  | "uramaki"
  | "temaki"
  | "chirashi"
  | "side"
  | "unknown";

export type SushiGroup = {
  name: string;
  kind: SushiKind;
  fillings: string[];
  pieces: number;
  notes: string;
};

export type SushiPiece = {
  name: string;
  aliases: string[];
  kind: SushiKind;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  grams: number;
};

/** Typical US restaurant 1-piece published numbers (USDA / FatSecret style). */
export const SUSHI_PIECES: SushiPiece[] = [
  p("Salmon nigiri", ["sake nigiri", "salmon sushi"], "nigiri", 57, 6.2, 8.2, 1.6, 0.1, 1.2, 130, 30),
  p("Tuna nigiri", ["maguro nigiri", "ahi nigiri", "tuna sushi"], "nigiri", 52, 6.4, 8, 0.5, 0.1, 1.1, 140, 28),
  p("Yellowtail nigiri", ["hamachi nigiri"], "nigiri", 60, 6, 8, 2, 0.1, 1.1, 135, 30),
  p("Shrimp nigiri", ["ebi nigiri", "prawn nigiri"], "nigiri", 40, 4.2, 8.2, 0.3, 0.1, 1.1, 160, 25),
  p("Eel nigiri", ["unagi nigiri", "anago nigiri"], "nigiri", 82, 5.2, 10, 3.2, 0.1, 4, 220, 32),
  p("Egg nigiri", ["tamago nigiri"], "nigiri", 68, 4, 10, 2, 0.1, 4, 180, 32),
  p("Crab nigiri", ["kani nigiri"], "nigiri", 48, 4, 9, 0.5, 0.1, 1.4, 180, 28),
  p("Mixed nigiri", ["nigiri", "unknown nigiri"], "nigiri", 55, 5.5, 8.2, 1.2, 0.1, 1.2, 150, 30),
  p("Salmon sashimi", ["sake sashimi"], "sashimi", 40, 6.2, 0, 1.6, 0, 0, 20, 20),
  p("Tuna sashimi", ["maguro sashimi", "ahi sashimi"], "sashimi", 35, 7.2, 0, 0.4, 0, 0, 25, 18),
  p("Yellowtail sashimi", ["hamachi sashimi"], "sashimi", 42, 6, 0, 2, 0, 0, 22, 20),
  p("Mixed sashimi", ["sashimi"], "sashimi", 38, 6.4, 0, 1.2, 0, 0, 22, 20),
  p("California roll piece", ["california roll", "california maki"], "uramaki", 33, 1.2, 4.8, 0.9, 0.3, 0.7, 80, 23),
  p("Spicy tuna roll piece", ["spicy tuna", "spicy tuna maki"], "maki", 36, 2.1, 4.8, 1, 0.2, 0.6, 95, 23),
  p("Spicy salmon roll piece", ["spicy salmon"], "maki", 38, 2, 4.8, 1.2, 0.2, 0.6, 90, 23),
  p("Philadelphia roll piece", ["philly roll", "salmon cream cheese roll"], "uramaki", 48, 2.2, 5, 2.2, 0.2, 0.8, 110, 26),
  p("Salmon avocado roll piece", ["salmon avocado", "salmon avocado maki"], "maki", 40, 2, 4.5, 1.6, 0.4, 0.6, 85, 24),
  p("Shrimp tempura roll piece", ["shrimp tempura roll", "crunchy shrimp roll"], "uramaki", 58, 2.2, 6.2, 2.8, 0.2, 0.8, 140, 28),
  p("Dragon roll piece", ["dragon roll", "eel avocado roll"], "uramaki", 55, 2.2, 6, 2.4, 0.3, 1.4, 150, 28),
  p("Rainbow roll piece", ["rainbow roll"], "uramaki", 50, 2.6, 5.5, 1.8, 0.3, 0.8, 120, 26),
  p("Spider roll piece", ["spider roll", "soft shell crab roll"], "uramaki", 55, 2.2, 6, 2.5, 0.3, 0.8, 160, 28),
  p("Cucumber roll piece", ["kappa maki", "cucumber maki"], "maki", 18, 0.5, 4, 0.1, 0.2, 0.4, 50, 18),
  p("Avocado roll piece", ["avocado maki"], "maki", 28, 0.5, 4, 1.2, 0.5, 0.4, 55, 20),
  p("Tuna roll piece", ["tekka maki", "tuna maki"], "maki", 24, 1.8, 4, 0.2, 0.1, 0.4, 70, 18),
  p("Salmon roll piece", ["salmon maki"], "maki", 30, 1.8, 4, 0.8, 0.1, 0.5, 70, 20),
  p("Vegetable roll piece", ["veggie roll", "vegetarian roll"], "maki", 20, 0.5, 4, 0.3, 0.4, 0.5, 55, 18),
  p("Eel avocado roll piece", ["unagi roll", "eel roll"], "maki", 50, 2.2, 5.5, 2.2, 0.3, 1.6, 160, 26),
  p("Mixed sushi roll piece", ["sushi roll", "maki", "sushi"], "maki", 35, 1.6, 4.8, 1, 0.2, 0.6, 85, 22),
  p("Hand roll", ["temaki", "hand roll"], "temaki", 140, 6, 16, 5, 1, 2, 280, 90),
  p("Chirashi bowl", ["chirashi", "chirashi sushi"], "chirashi", 520, 28, 68, 12, 2, 8, 720, 350),
  p("Edamame", ["edamame"], "side", 120, 11, 9, 5, 5, 1, 10, 100),
  p("Miso soup", ["miso"], "side", 40, 3, 5, 1, 1, 2, 800, 240),
  p("Seaweed salad", ["wakame", "seaweed salad"], "side", 70, 2, 10, 3, 2, 6, 720, 80),
];

export function looksLikeSushi(...parts: string[]) {
  return SUSHI_RE.test(parts.filter(Boolean).join(" "));
}

export function parsePieceCount(text: string, fallback = 0) {
  const raw = text.toLowerCase();
  const patterns = [
    /(\d{1,2})\s*(?:pieces?|pcs?|pc|slices?|nigiri)\b/i,
    /counted\s+(\d{1,2})/i,
    /assumed\s+(\d{1,2})/i,
    /(\d{1,2})\s*x\b/i,
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) {
      const n = Number(match[1]);
      if (n >= 1 && n <= 48) return n;
    }
  }
  return fallback;
}

const CUT_ROLL =
  /\b(dragon|california|rainbow|philadelphia|philly|spider|tempura|spicy tuna|spicy salmon|avocado|cucumber|tuna maki|salmon maki|vegetable|eel avocado|uramaki|maki)\b.*\broll\b|\broll\b.*\b(dragon|california|rainbow|philadelphia|spider|tempura)\b|\b(dragon roll|california roll|rainbow roll)\b/i;

export function isCutSushiRoll(name: string, kind?: SushiKind) {
  if (kind === "maki" || kind === "uramaki") return true;
  if (kind === "nigiri" || kind === "sashimi" || kind === "side" || kind === "temaki" || kind === "chirashi") {
    return false;
  }
  return CUT_ROLL.test(name) || (/\broll\b/i.test(name) && !/\bhand roll|temaki|1 piece|one piece\b/i.test(name));
}

/** One cut roll is 6–8 slices, never one 55-kcal bite unless the photo is a single slice. */
export function resolveSushiPieceCount(options: {
  name: string;
  notes?: string;
  kind?: SushiKind;
  reported?: number;
  size?: PortionSize;
}) {
  const blob = `${options.name} ${options.notes ?? ""}`;
  const reported = options.reported && options.reported > 0 ? options.reported : 0;
  const fromText = parsePieceCount(blob, 0);
  const singleSlice = /\b(1|one|single)\s+(piece|slice|bite)\b/i.test(blob);
  const cutRoll = isCutSushiRoll(options.name, options.kind);

  if (reported >= 3) return reported;
  if (fromText >= 3) return fromText;
  if (singleSlice && (reported === 1 || fromText === 1)) return 1;
  if (cutRoll) {
    if (reported === 2 || fromText === 2) return reported || fromText;
    return defaultPiecesForSize(options.size ?? "medium", options.kind ?? "uramaki");
  }
  if (reported > 0) return reported;
  if (fromText > 0) return fromText;
  return defaultPiecesForSize(options.size ?? "medium", options.kind ?? "unknown");
}

export function sizeFromPieces(pieces: number): PortionSize {
  if (pieces <= 6) return "small";
  if (pieces >= 13) return "large";
  return "medium";
}

export function defaultPiecesForSize(size: PortionSize, kind: SushiKind) {
  if (kind === "side") return 1;
  if (kind === "temaki") return size === "small" ? 1 : size === "large" ? 3 : 2;
  if (kind === "chirashi") return 1;
  if (size === "small") return kind === "nigiri" || kind === "sashimi" ? 4 : 6;
  if (size === "large") return kind === "nigiri" || kind === "sashimi" ? 8 : 8;
  return kind === "nigiri" || kind === "sashimi" ? 6 : 8;
}

export function parseSushiInspection(text: string): {
  groups: SushiGroup[];
  totalPieces: number;
} {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return { groups: [], totalPieces: 0 };
  try {
    const parsed = JSON.parse(text.slice(start, end + 1).replace(/,\s*([}\]])/g, "$1")) as {
      totalPieces?: number;
      groups?: unknown[];
      items?: unknown[];
    };
    const rows = Array.isArray(parsed.groups)
      ? parsed.groups
      : Array.isArray(parsed.items)
        ? parsed.items
        : [];
    const groups = rows
      .map((row) => groupFromUnknown(row))
      .filter((group): group is SushiGroup => Boolean(group));
    const counted = groups.reduce((sum, group) => sum + Math.max(group.pieces, 0), 0);
    return {
      groups,
      totalPieces: Number(parsed.totalPieces) || counted,
    };
  } catch {
    return { groups: [], totalPieces: 0 };
  }
}

export function groupsFromIdentity(options: {
  mealName: string;
  lookClues?: string;
  items: Array<{
    name: string;
    notes: string;
    size: PortionSize;
    pieces?: number;
    fillings?: string[];
  }>;
}): SushiGroup[] {
  const blob = `${options.mealName} ${options.lookClues ?? ""} ${options.items.map((item) => `${item.name} ${item.notes}`).join(" ")}`;
  if (!looksLikeSushi(blob)) return [];

  const groups = options.items
    .map((item) => {
      const fillings = item.fillings?.length
        ? item.fillings
        : inferFillings(`${item.name} ${item.notes} ${options.lookClues ?? ""}`);
      const kind = inferKind(`${item.name} ${item.notes}`, fillings);
      const pieces = resolveSushiPieceCount({
        name: item.name,
        notes: item.notes,
        kind,
        reported: item.pieces,
        size: item.size,
      });
      return {
        name: nameFromClues(item.name, kind, fillings),
        kind,
        fillings,
        pieces,
        notes: item.notes,
      } satisfies SushiGroup;
    })
    .filter((group) => looksLikeSushi(group.name, group.kind, group.fillings.join(" ")) || group.kind !== "unknown");

  if (groups.length > 0) return groups;

  const fillings = inferFillings(blob);
  const kind = inferKind(blob, fillings);
  return [
    {
      name: nameFromClues(options.mealName, kind, fillings),
      kind,
      fillings,
      pieces: resolveSushiPieceCount({
        name: options.mealName,
        notes: blob,
        kind,
        size: options.items[0]?.size,
      }),
      notes: options.lookClues ?? "sushi seen in photo",
    },
  ];
}

export function foodItemsFromSushiGroups(
  groups: SushiGroup[],
  fallbackSize: PortionSize,
): Array<{
  name: string;
  notes: string;
  estimatedGrams: number;
  size: PortionSize;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  fillings: string[];
  pieces: number;
}> {
  const usable = groups.filter((group) => group.kind !== "unknown" || group.pieces > 0 || group.fillings.length > 0);
  const rows = (usable.length > 0 ? usable : groups).map((group) => {
    const piece = matchSushiPiece(group.name, group.fillings, group.kind);
    const pieces =
      group.kind === "side" || group.kind === "chirashi"
        ? Math.max(group.pieces, 1)
        : resolveSushiPieceCount({
            name: group.name,
            notes: group.notes,
            kind: group.kind,
            reported: group.pieces,
            size: fallbackSize,
          });
    const counted = group.pieces >= 3;
    const label = piece.name.replace(/, 1 piece$/i, "").replace(/ piece$/i, "");
    return {
      name: `${label} (${pieces} ${pieceWord(pieces)})`,
      notes: [
        counted
          ? `Counted ${pieces} ${pieceWord(pieces)} × ${piece.calories} kcal each.`
          : `A cut roll is ${pieces} pieces × ${piece.calories} kcal each (not 1 piece).`,
        group.fillings.length ? `Seen: ${group.fillings.join(", ")}.` : "Could not read every filling.",
        group.notes,
      ]
        .filter(Boolean)
        .join(" "),
      estimatedGrams: Math.round(piece.grams * pieces),
      size: counted ? sizeFromPieces(totalPieces(groups, fallbackSize)) : fallbackSize,
      calories: Math.round(piece.calories * pieces),
      proteinG: round1(piece.proteinG * pieces),
      carbsG: round1(piece.carbsG * pieces),
      fatG: round1(piece.fatG * pieces),
      fiberG: round1(piece.fiberG * pieces),
      sugarG: round1(piece.sugarG * pieces),
      sodiumMg: Math.round(piece.sodiumMg * pieces),
      fillings: group.fillings,
      pieces,
    };
  });
  return rows;
}

export function applySushiCalories(item: FoodItem): FoodItem | null {
  if (!looksLikeSushi(item.name, item.notes, item.portionDescription)) return null;
  const fillings = inferFillings(`${item.name} ${item.notes} ${item.portionDescription}`);
  const kind = inferKind(`${item.name} ${item.notes}`, fillings);
  const piece = matchSushiPiece(item.name, fillings, kind);
  const pieces = resolveSushiPieceCount({
    name: item.name,
    notes: `${item.portionDescription} ${item.notes}`,
    kind,
    reported:
      parsePieceCount(`${item.name} ${item.portionDescription} ${item.notes}`, 0) ||
      (item.estimatedGrams > 20 && piece.grams > 0
        ? Math.max(1, Math.round(item.estimatedGrams / piece.grams))
        : 0),
  });
  if (!pieces) return null;
  return {
    ...item,
    name: piece.name.replace(/ piece$/i, ""),
    calories: Math.round(piece.calories * pieces),
    proteinG: round1(piece.proteinG * pieces),
    carbsG: round1(piece.carbsG * pieces),
    fatG: round1(piece.fatG * pieces),
    fiberG: round1(piece.fiberG * pieces),
    sugarG: round1(piece.sugarG * pieces),
    sodiumMg: Math.round(piece.sodiumMg * pieces),
    estimatedGrams: Math.round(piece.grams * pieces),
    dataSource: "nutrition_database",
    portionDescription: `${pieces} ${pieceWord(pieces)} counted · ${piece.name}`,
    notes: `Used ${piece.calories} kcal per piece × ${pieces}. ${item.notes}`.trim(),
  };
}

export function matchSushiPiece(name: string, fillings: string[], kind: SushiKind): SushiPiece {
  const blob = normalize(`${name} ${fillings.join(" ")} ${kind}`);
  let best: { piece: SushiPiece; score: number } | null = null;
  for (const piece of SUSHI_PIECES) {
    const hay = normalize(`${piece.name} ${piece.aliases.join(" ")} ${piece.kind}`);
    let score = 0;
    if (hay === blob || normalize(piece.name) === normalize(name)) score += 8;
    if (piece.kind === kind) score += 2;
    for (const alias of [piece.name, ...piece.aliases]) {
      const needle = normalize(alias);
      if (needle && (blob.includes(needle) || needle.includes(normalize(name)))) score += 3;
    }
    for (const filling of fillings) {
      if (hay.includes(normalize(filling))) score += 2.5;
    }
    if (!best || score > best.score) best = { piece, score };
  }
  if (best && best.score >= 3) return best.piece;
  if (kind === "sashimi") return SUSHI_PIECES.find((row) => row.name === "Mixed sashimi")!;
  if (kind === "nigiri") return SUSHI_PIECES.find((row) => row.name === "Mixed nigiri")!;
  if (kind === "side") return SUSHI_PIECES.find((row) => row.name === "Edamame")!;
  if (kind === "temaki") return SUSHI_PIECES.find((row) => row.name === "Hand roll")!;
  if (kind === "chirashi") return SUSHI_PIECES.find((row) => row.name === "Chirashi bowl")!;
  return SUSHI_PIECES.find((row) => row.name === "Mixed sushi roll piece")!;
}

export function inferFillings(text: string): string[] {
  const raw = text.toLowerCase();
  const found: string[] = [];
  const add = (name: string, pattern: RegExp) => {
    if (pattern.test(raw) && !found.includes(name)) found.push(name);
  };
  add("salmon", /\b(salmon|sake|orange fish|coral fish)\b/);
  add("tuna", /\b(tuna|maguro|ahi|deep red fish|dark red fish)\b/);
  add("spicy tuna", /\bspicy tuna\b/);
  add("yellowtail", /\b(yellowtail|hamachi)\b/);
  add("eel", /\b(eel|unagi|anago|brown glaze)\b/);
  add("shrimp", /\b(shrimp|ebi|prawn)\b/);
  add("tempura", /\b(tempura|fried shrimp|crunchy)\b/);
  add("crab", /\b(crab|kani|imitation crab|california)\b/);
  add("avocado", /\b(avocado|green cream)\b/);
  add("cucumber", /\b(cucumber|kappa)\b/);
  add("cream cheese", /\b(cream cheese|philadelphia|philly)\b/);
  add("egg", /\b(tamago|egg omelette|sweet egg)\b/);
  add("masago", /\b(masago|tobiko|fish roe|orange dots|orange eggs)\b/);
  add("spicy mayo", /\b(spicy mayo|sriracha mayo)\b/);
  add("sesame", /\b(sesame|seeds on the outside)\b/);
  add("rice", /\b(rice|nigiri|sushi)\b/);
  return found;
}

export function inferKind(text: string, fillings: string[]): SushiKind {
  const raw = text.toLowerCase();
  if (/\b(edamame|miso|seaweed salad|ginger|wasabi)\b/.test(raw)) return "side";
  if (/\bchirashi\b/.test(raw)) return "chirashi";
  if (/\b(temaki|hand roll)\b/.test(raw)) return "temaki";
  if (/\bsashimi\b/.test(raw) || (/\bno rice\b/.test(raw) && fillings.some((item) => /salmon|tuna|yellowtail/.test(item)))) {
    return "sashimi";
  }
  if (/\bnigiri\b/.test(raw) || /\bfish on (top of )?rice\b/.test(raw) || /\brice oval\b/.test(raw)) {
    return "nigiri";
  }
  if (/\b(uramaki|inside ?out|rice outside|california|rainbow|dragon|philadelphia|philly)\b/.test(raw)) {
    return "uramaki";
  }
  if (/\b(maki|roll|nori)\b/.test(raw)) return "maki";
  if (fillings.includes("salmon") || fillings.includes("tuna") || fillings.includes("eel")) {
    return /\broll\b/.test(raw) ? "maki" : "nigiri";
  }
  return looksLikeSushi(raw) ? "unknown" : "unknown";
}

export const SUSHI_INSPECT_PROMPT = `This photo is sushi. Do a close look. Do not invent calories.

Split the plate into every distinct group. Count bite-size slices, NOT the number of rolls.
A cut dragon / California / rainbow / spicy tuna roll is usually 6–8 slices. If you see one cut roll, set pieces to the slice count (often 7 or 8). Never set pieces to 1 for a cut roll unless only one slice is on the plate.

Kind:
- nigiri = oval rice with a slice of fish on top
- sashimi = fish only, no rice
- maki = nori seaweed outside, rice inside, cut into rounds
- uramaki = rice outside (California, rainbow, dragon, spicy tuna often)
- temaki = cone hand roll
- chirashi = fish scattered over a bowl of rice
- side = edamame, miso, seaweed salad

Color / filling guide (use only if you see it):
- orange / coral fish = salmon
- deep red / maroon fish = tuna
- pale pink-white fish = yellowtail
- brown glazed fish = eel
- curled cooked pink = shrimp
- white shredded stick + avocado = crab / California
- white creamy inside = cream cheese or spicy mayo
- green slices = avocado or cucumber
- orange tiny eggs = masago / tobiko
- fried crunch = tempura

Never collapse a mixed platter into one word "sushi".
If a filling is unclear, still count the slices and set fillings to ["unknown"].

Return JSON only:
{"totalPieces":8,"groups":[{"name":"dragon roll","kind":"uramaki","fillings":["eel","avocado"],"pieces":8,"notes":"one cut roll, 8 slices"}]}`;

function nameFromClues(name: string, kind: SushiKind, fillings: string[]) {
  const cleaned = name.replace(/\bsushi\b/i, "").trim();
  if (looksLikeSushi(cleaned) && !/^sushi$/i.test(cleaned)) return cleaned || name;
  if (kind === "nigiri" && fillings[0] && fillings[0] !== "unknown" && fillings[0] !== "rice") {
    return `${title(fillings[0])} nigiri`;
  }
  if (kind === "sashimi" && fillings[0] && fillings[0] !== "unknown") {
    return `${title(fillings[0])} sashimi`;
  }
  if (fillings.includes("crab") && fillings.includes("avocado")) return "California roll";
  if (fillings.includes("spicy tuna")) return "Spicy tuna roll";
  if (fillings.includes("cream cheese") && fillings.includes("salmon")) return "Philadelphia roll";
  if (fillings.includes("tempura") && fillings.includes("shrimp")) return "Shrimp tempura roll";
  if (fillings.includes("eel") && fillings.includes("avocado")) return "Dragon roll";
  if (kind === "maki" || kind === "uramaki") {
    const main = fillings.find((item) => item !== "rice" && item !== "sesame" && item !== "unknown");
    return main ? `${title(main)} roll` : "Sushi roll";
  }
  return cleaned || name || "Sushi";
}

function groupFromUnknown(row: unknown): SushiGroup | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  const name = String(value.name ?? value.mealName ?? "").trim();
  const notes = String(value.notes ?? "");
  const fillings = Array.isArray(value.fillings)
    ? value.fillings.map((item) => String(item).toLowerCase().trim()).filter(Boolean)
    : inferFillings(`${name} ${notes}`);
  const kind = parseKind(value.kind) || inferKind(`${name} ${notes}`, fillings);
  if (!name && fillings.length === 0 && kind === "unknown") return null;
  const pieces = resolveSushiPieceCount({
    name,
    notes,
    kind,
    reported: Number(value.pieces ?? value.pieceCount ?? value.slices ?? value.count ?? 0),
  });
  return {
    name: nameFromClues(name || "Sushi", kind, fillings),
    kind,
    fillings,
    pieces,
    notes,
  };
}

function parseKind(value: unknown): SushiKind | null {
  const raw = String(value ?? "").toLowerCase();
  if (
    raw === "nigiri" ||
    raw === "sashimi" ||
    raw === "maki" ||
    raw === "uramaki" ||
    raw === "temaki" ||
    raw === "chirashi" ||
    raw === "side"
  ) {
    return raw;
  }
  return null;
}

function totalPieces(groups: SushiGroup[], fallbackSize: PortionSize) {
  const counted = groups.reduce((sum, group) => sum + (group.pieces > 0 ? group.pieces : 0), 0);
  if (counted > 0) return counted;
  return defaultPiecesForSize(fallbackSize, "maki");
}

function pieceWord(count: number) {
  return count === 1 ? "piece" : "pieces";
}

function title(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function p(
  name: string,
  aliases: string[],
  kind: SushiKind,
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  fiberG: number,
  sugarG: number,
  sodiumMg: number,
  grams: number,
): SushiPiece {
  return {
    name,
    aliases,
    kind,
    calories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    sugarG,
    sodiumMg,
    grams,
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
