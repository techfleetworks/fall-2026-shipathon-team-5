import type { Metadata } from "next";
import SectionIndex from "@/components/SectionIndex";

export const metadata: Metadata = { title: "Skill Check" };

export default function Page() {
  return <SectionIndex href="/skill-check" />;
}
