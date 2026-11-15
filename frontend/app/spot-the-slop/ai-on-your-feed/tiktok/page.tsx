import type { Metadata } from "next";
import PlatformGuidePage from "@/components/PlatformGuidePage";

export const metadata: Metadata = { title: "TikTok: what to check before you share" };

export default function Page() {
  return <PlatformGuidePage slug="tiktok" />;
}
