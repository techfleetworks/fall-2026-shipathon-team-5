import { redirect } from "next/navigation";

// The quiz now lives directly on /skill-check. Old links land there.
export default function Page() {
  redirect("/skill-check");
}
