import { redirect } from "next/navigation";

// The platform list lives on the Learn page, so send visitors there.
export default function Page() {
  redirect("/spot-the-slop#ai-on-your-feed");
}
