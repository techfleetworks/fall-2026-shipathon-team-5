import type { Metadata } from "next";
import ChecklistPage from "@/components/ChecklistPage";

export const metadata: Metadata = { title: "Checklist: images and visuals" };

export default function Page() {
  return <ChecklistPage slug="images-and-visuals" />;
}
