/**
 * Capability model for screenshot / screen-capture protection.
 *
 * A normal browser has no reliable way to intercept or block OS-level screen capture — macOS
 * Command+Shift+3/4/5, Windows Print Screen / Snipping Tool, or the iOS/Android hardware
 * screenshot shortcuts all operate entirely outside a website's security boundary. This module is
 * the one honest, capability-checked place the rest of the app asks "can this environment actually
 * restrict capture?" instead of inferring an answer from a user-agent string, which is never a
 * real security boundary and would misrepresent what this app can guarantee.
 *
 * Today this app only ever runs as a normal website, so `getScreenshotProtectionCapabilities()`
 * always returns `webCapabilities`. A future native or organisation-managed client (a managed
 * macOS/Windows build, a native iOS/Android app) would report its own capabilities through this
 * same shape once it can prove — via a genuine platform API, never by detecting the device — that
 * it supports `NATIVE_CAPTURE_RESTRICTION` or `MANAGED_DEVICE_RESTRICTION`.
 */
export type ScreenshotProtectionLevel =
  | "WEB_DETERRENCE"
  | "NATIVE_CAPTURE_RESTRICTION"
  | "MANAGED_DEVICE_RESTRICTION";

export type ScreenshotProtectionCapabilities = {
  level: ScreenshotProtectionLevel;
  canPreventScreenCapture: boolean;
  canDetectScreenCapture: boolean;
  supportsWatermark: boolean;
  supportsPrivacyShield: boolean;
};

/**
 * The only capability set this app can honestly claim. `canPreventScreenCapture` and
 * `canDetectScreenCapture` must never be set to `true` here — running on macOS, Windows, iOS,
 * Android or a Google Pixel device does not grant a website either privilege.
 */
export const webCapabilities: ScreenshotProtectionCapabilities = {
  level: "WEB_DETERRENCE",
  canPreventScreenCapture: false,
  canDetectScreenCapture: false,
  supportsWatermark: true,
  supportsPrivacyShield: true,
};

export function getScreenshotProtectionCapabilities(): ScreenshotProtectionCapabilities {
  return webCapabilities;
}
