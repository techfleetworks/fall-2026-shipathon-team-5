import type { Metadata } from "next";
import SectionIndex from "@/components/SectionIndex";

export const metadata: Metadata = { title: "Spot the Slop" };

export default function Page() {
  return <SectionIndex href="/spot-the-slop" />;
}
