// Display-only unit conversion. Everything is STORED metric (km, kg, L);
// these helpers only change what the player sees.

export const KM_PER_MI = 1.609344;
export const LB_PER_KG = 2.20462;
export const OZ_PER_L = 33.814;

export function formatDistance(km, units, decimals = 1) {
  if (units === "imperial") return { value: (km / KM_PER_MI).toFixed(decimals), suffix: "mi" };
  return { value: km.toFixed(decimals), suffix: "km" };
}

export function formatWeight(kg, units) {
  if (units === "imperial") return { value: Math.round(kg * LB_PER_KG), suffix: "lb" };
  return { value: Math.round(kg), suffix: "kg" };
}

export function formatVolume(liters, units, decimals = 1) {
  if (units === "imperial") return { value: Math.round(liters * OZ_PER_L), suffix: "oz" };
  return { value: liters.toFixed(decimals), suffix: "L" };
}

export function formatHeight(cm, units) {
  if (units === "imperial") {
    const totalIn = cm / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inches = Math.round(totalIn % 12);
    return { value: `${ft}'${inches}"`, suffix: "" };
  }
  return { value: Math.round(cm), suffix: "cm" };
}

export function distanceUnitLabel(units) {
  return units === "imperial" ? "MI" : "KM";
}
