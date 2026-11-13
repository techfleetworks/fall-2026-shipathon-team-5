import type { Metadata } from "next";
import SectionIndex from "@/components/SectionIndex";

export const metadata: Metadata = { title: "Understand AI" };

export default function Page() {
  return <SectionIndex href="/understand-ai" />;
}
