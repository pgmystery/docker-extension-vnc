export type OSPlatform = "windows" | "mac" | "linux" | "unknown";

type NavigatorWithUAData = Navigator & {
  userAgentData?: {
    platform?: string;
  };
};

export default function getOS(): OSPlatform {
  if (typeof navigator === "undefined") {
    return "unknown"; // SSR / non-browser safety
  }

  const nav = navigator as NavigatorWithUAData;

  // Modern API (Chromium, Edge, etc.)
  if (nav.userAgentData?.platform) {
    const platform = nav.userAgentData.platform.toLowerCase();

    if (platform.includes("win")) return "windows";
    if (platform.includes("mac")) return "mac";
    if (platform.includes("linux")) return "linux";
  }

  // Fallback (Safari, Firefox)
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "mac";
  if (ua.includes("linux")) return "linux";

  return "unknown"
}
