import type { Metadata } from "next";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = { title: "Real or AI?" };

export default function Page() {
  return <PlaceholderPage href="/skill-check/real-or-ai" />;
}
