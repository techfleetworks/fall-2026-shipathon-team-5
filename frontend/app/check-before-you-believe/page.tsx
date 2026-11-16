import type { Metadata } from "next";
import SectionIndex from "@/components/SectionIndex";

export const metadata: Metadata = { title: "Check Before You Believe" };

export default function Page() {
  return <SectionIndex href="/check-before-you-believe" />;
}
