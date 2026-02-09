import { SiteShell } from "@/components/SiteShell";

export default function DisclaimerPage() {
  return (
    <SiteShell>
      <h1 className="text-2xl font-semibold">Disclaimer</h1>
      <div className="mt-4 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 text-sm text-[hsl(var(--muted))] space-y-3">
        <p>Traditional use only. Content is for general wellness information and not medical advice.</p>
        <p>Consult a qualified healthcare professional before use, especially if pregnant, nursing, or on medication.</p>
      </div>
    </SiteShell>
  );
}