import type { Metadata } from "next";
import ChecklistPage from "@/components/ChecklistPage";

export const metadata: Metadata = { title: "Checklist: audio and voice" };

export default function Page() {
  return <ChecklistPage slug="audio-and-voice" />;
}
