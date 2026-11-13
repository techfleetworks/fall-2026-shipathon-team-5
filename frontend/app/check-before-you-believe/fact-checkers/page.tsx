import type { Metadata } from "next";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = { title: "Trusted fact-checkers" };

export default function Page() {
  return <PlaceholderPage href="/check-before-you-believe/fact-checkers" />;
}
