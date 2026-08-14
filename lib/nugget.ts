export type NuggetColor =
  | "classic"
  | "honey"
  | "golden"
  | "spicy"
  | "matcha"
  | "midnight"
  | "cotton"
  | "spider";
export type NuggetFace = "happy" | "wink" | "hearts" | "cool" | "sleepy" | "sparkle";
export type NuggetAccessory = "none" | "bow" | "chef" | "shades" | "crown" | "sprout" | "bandana";

export type ShopKind = "color" | "face" | "accessory";

export type ShopItem = {
  id: string;
  kind: ShopKind;
  name: string;
  blurb: string;
  cost: number;
  secret?: boolean;
};

export type NuggetSave = {
  nugs: number;
  color: NuggetColor;
  face: NuggetFace;
  accessory: NuggetAccessory;
  unlocked: string[];
  lastAwardDay: string | null;
  streak: number;
  lastVisitDay: string | null;
  claimedCodes: string[];
};

const KEY = "nuggetcals-nugget-v1";

export const SHOP: ShopItem[] = [
  { id: "classic", kind: "color", name: "Classic fry", blurb: "The original golden bite", cost: 0 },
  { id: "honey", kind: "color", name: "Honey glaze", blurb: "Warm and extra crispy", cost: 20 },
  { id: "golden", kind: "color", name: "24k crunch", blurb: "Trophy-shelf shine", cost: 30 },
  { id: "spicy", kind: "color", name: "Hot honey", blurb: "A little kick", cost: 40 },
  { id: "matcha", kind: "color", name: "Matcha", blurb: "Green-tea glow", cost: 40 },
  { id: "midnight", kind: "color", name: "Midnight", blurb: "After-hours nugget", cost: 50 },
  { id: "cotton", kind: "color", name: "Cotton candy", blurb: "Carnival sweet", cost: 60 },
  {
    id: "spider",
    kind: "color",
    name: "Web-slinger",
    blurb: "Red, blue, and a secret",
    cost: 0,
    secret: true,
  },
  { id: "happy", kind: "face", name: "Happy", blurb: "Default smile", cost: 0 },
  { id: "wink", kind: "face", name: "Wink", blurb: "Knows the vibe", cost: 20 },
  { id: "hearts", kind: "face", name: "Heart eyes", blurb: "In love with lunch", cost: 30 },
  { id: "cool", kind: "face", name: "Cool", blurb: "Unbothered", cost: 40 },
  { id: "sleepy", kind: "face", name: "Sleepy", blurb: "Post-snack nap", cost: 20 },
  { id: "sparkle", kind: "face", name: "Sparkle", blurb: "Main character", cost: 50 },
  { id: "none", kind: "accessory", name: "Bare crunch", blurb: "No extra drip", cost: 0 },
  { id: "bow", kind: "accessory", name: "Ribbon", blurb: "Cute on purpose", cost: 30 },
  { id: "chef", kind: "accessory", name: "Chef hat", blurb: "Runs the kitchen", cost: 40 },
  { id: "shades", kind: "accessory", name: "Shades", blurb: "Too hot to look at", cost: 40 },
  { id: "crown", kind: "accessory", name: "Tiny crown", blurb: "King of the air fryer", cost: 80 },
  { id: "sprout", kind: "accessory", name: "Sprout", blurb: "Growing strong", cost: 30 },
  { id: "bandana", kind: "accessory", name: "Bandana", blurb: "Snack cowboy", cost: 35 },
];

const FREE = new Set(["classic", "happy", "none"]);

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function defaultNugget(): NuggetSave {
  return {
    nugs: 0,
    color: "classic",
    face: "happy",
    accessory: "none",
    unlocked: [...FREE],
    lastAwardDay: null,
    streak: 0,
    lastVisitDay: null,
    claimedCodes: [],
  };
}

export function loadNugget(): NuggetSave {
  if (typeof window === "undefined" || !("localStorage" in window)) return defaultNugget();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultNugget();
    const parsed = JSON.parse(raw) as Partial<NuggetSave>;
    const base = defaultNugget();
    return {
      ...base,
      ...parsed,
      unlocked: [...new Set([...(parsed.unlocked ?? []), ...FREE])],
      nugs: Number.isFinite(parsed.nugs) ? Math.max(0, Number(parsed.nugs)) : 0,
      streak: Number.isFinite(parsed.streak) ? Math.max(0, Number(parsed.streak)) : 0,
      claimedCodes: Array.isArray(parsed.claimedCodes) ? parsed.claimedCodes : [],
    };
  } catch {
    return defaultNugget();
  }
}

export function saveNugget(save: NuggetSave) {
  if (typeof window === "undefined" || !("localStorage" in window)) return;
  localStorage.setItem(KEY, JSON.stringify(save));
}

export function nuggetMood(todayCalories: number, planCalories: number) {
  const over = todayCalories - planCalories;
  const share = todayCalories / Math.max(planCalories, 1);
  if (over >= 100) return "exploded" as const;
  if (share >= 0.95) return "nervous" as const;
  if (share >= 0.7) return "proud" as const;
  if (share >= 0.25) return "happy" as const;
  return "tiny" as const;
}

export function nuggetScale(todayCalories: number, planCalories: number) {
  const share = Math.min(1.15, todayCalories / Math.max(planCalories, 1));
  return 0.58 + share * 0.72;
}

export function canCollect(save: NuggetSave, todayCalories: number, planCalories: number) {
  const day = todayKey();
  if (save.lastAwardDay === day) return false;
  if (todayCalories <= 0) return false;
  if (todayCalories - planCalories >= 100) return false;
  return todayCalories <= planCalories;
}

const SECRET_CODES: Record<
  string,
  { nugs: number; unlock?: string[]; message: string }
> = {
  dylandiner37: {
    nugs: 100,
    message: "DylanDiner37 unlocked. +100 secret Nugs.",
  },
  spidertime: {
    nugs: 0,
    unlock: ["spider"],
    message: "Spidertime. Web-slinger color added to your collection.",
  },
};

export type RedeemResult = {
  ok: boolean;
  nugs: number;
  total: number;
  message: string;
};

export function redeemCode(raw: string): RedeemResult {
  const code = raw.trim().toLowerCase().replace(/\s+/g, "");
  const save = loadNugget();
  if (!code) return { ok: false, nugs: 0, total: save.nugs, message: "Type a code first." };
  const prize = SECRET_CODES[code];
  if (!prize) return { ok: false, nugs: 0, total: save.nugs, message: "That code is not valid." };
  if (save.claimedCodes.includes(code)) {
    return { ok: false, nugs: 0, total: save.nugs, message: "You already redeemed that code." };
  }
  const next: NuggetSave = {
    ...save,
    nugs: save.nugs + prize.nugs,
    unlocked: [...new Set([...save.unlocked, ...(prize.unlock ?? [])])],
    claimedCodes: [...save.claimedCodes, code],
    color: prize.unlock?.includes("spider") ? "spider" : save.color,
  };
  saveNugget(next);
  return { ok: true, nugs: prize.nugs, total: next.nugs, message: prize.message };
}

export function collectDailyNugs(save: NuggetSave): NuggetSave {
  const day = todayKey();
  if (save.lastAwardDay === day) return save;
  const missed = save.lastAwardDay && daysBetween(save.lastAwardDay, day) > 1;
  return {
    ...save,
    nugs: save.nugs + 10,
    lastAwardDay: day,
    streak: missed ? 1 : save.streak + 1,
    lastVisitDay: day,
  };
}

export function buyItem(save: NuggetSave, item: ShopItem): NuggetSave | { error: string } {
  if (save.unlocked.includes(item.id) || item.cost === 0) {
    return equip(save, item);
  }
  if (save.nugs < item.cost) return { error: `Need ${item.cost} Nugs` };
  return equip(
    {
      ...save,
      nugs: save.nugs - item.cost,
      unlocked: [...save.unlocked, item.id],
    },
    item,
  );
}

export function equip(save: NuggetSave, item: ShopItem): NuggetSave {
  if (item.kind === "color") return { ...save, color: item.id as NuggetColor };
  if (item.kind === "face") return { ...save, face: item.id as NuggetFace };
  return { ...save, accessory: item.id as NuggetAccessory };
}

export function previewLook(
  save: NuggetSave,
  item: ShopItem,
): Pick<NuggetSave, "color" | "face" | "accessory"> {
  const next = equip(save, item);
  return { color: next.color, face: next.face, accessory: next.accessory };
}

function daysBetween(a: string, b: string) {
  const first = new Date(`${a}T00:00:00`);
  const second = new Date(`${b}T00:00:00`);
  return Math.round((second.getTime() - first.getTime()) / 86_400_000);
}
