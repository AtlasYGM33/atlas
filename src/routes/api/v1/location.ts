import { createFileRoute } from "@tanstack/react-router";
import { compareDossiers, resolve } from "@/data/government";

function num(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export const Route = createFileRoute("/api/v1/location")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
        const q = url.searchParams.get("q") ?? undefined;
        const lat = num(url.searchParams.get("lat"));
        const lng = num(url.searchParams.get("lng"));
        const compare = url.searchParams.get("compare");
        const dossier = resolve({ asOf: date, q, lat, lng });
        if (!compare) return Response.json({ version: "1", date, dossier });
        const other = resolve({ asOf: compare, q, lat, lng });
        return Response.json({
          version: "1",
          date,
          compare,
          dossier,
          other,
          changes: compareDossiers(dossier, other),
        });
      },
    },
  },
});
