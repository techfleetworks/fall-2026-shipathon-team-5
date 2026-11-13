import type { Metadata } from "next";

export const metadata: Metadata = { title: "About us" };

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-bold">About us</h1>
      <p className="mt-6 text-lg">Content coming soon.</p>
    </main>
  );
}
