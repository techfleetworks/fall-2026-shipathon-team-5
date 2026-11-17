import { redirect } from "next/navigation";

// The quiz now lives directly on /quiz-your-skills. Old links land there.
export default function Page() {
  redirect("/quiz-your-skills");
}
