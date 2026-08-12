export function kcal(value: number) {
  return Math.round(value).toLocaleString();
}

export function grams(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

export function confidenceLabel(value: number) {
  if (value >= 0.8) return "High confidence";
  if (value >= 0.6) return "Solid estimate";
  if (value >= 0.4) return "Rough estimate";
  return "Low confidence";
}

export function methodLabel(method: string) {
  switch (method) {
    case "restaurant_menu":
      return "Restaurant nutrition";
    case "usda":
      return "USDA / database";
    case "hybrid":
      return "Menu + visual portions";
    default:
      return "Visual estimate";
  }
}
