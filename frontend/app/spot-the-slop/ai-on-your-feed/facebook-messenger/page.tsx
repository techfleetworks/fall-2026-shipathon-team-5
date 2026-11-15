import type { Metadata } from "next";
import PlatformGuidePage from "@/components/PlatformGuidePage";

export const metadata: Metadata = { title: "Facebook and Messenger: what to check before you share" };

export default function Page() {
  return <PlatformGuidePage slug="facebook-messenger" />;
}
