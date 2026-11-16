import type { Metadata } from "next";
import ChecklistPage from "@/components/ChecklistPage";

export const metadata: Metadata = { title: "Checklist: video and motion" };

export default function Page() {
  return <ChecklistPage slug="video-and-motion" />;
}
