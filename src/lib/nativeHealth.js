import { Capacitor, registerPlugin } from "@capacitor/core";

// Bridge to the Swift HealthPlugin (ios/App/App/HealthPlugin.swift). On the web
// this whole module is inert — every entry point checks the platform first.
const Health = registerPlugin("Health");

export const isNativeApp = () => Capacitor.isNativePlatform();

let authRequested = false;

/**
 * Today's step count straight from HealthKit, or null when unavailable
 * (web build, denied permission, or a device without Health).
 */
export async function fetchNativeSteps() {
  if (!isNativeApp()) return null;
  try {
    if (!authRequested) {
      await Health.requestAuthorization();
      authRequested = true;
    }
    const { steps } = await Health.getTodaySteps();
    return typeof steps === "number" && steps >= 0 ? Math.round(steps) : null;
  } catch {
    return null;
  }
}
