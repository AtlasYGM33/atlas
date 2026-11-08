import { createFileRoute } from "@tanstack/react-router";
import { resolve } from "@/data/government";

export const Route = createFileRoute("/api/v1/offices")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
        const q = url.searchParams.get("q") ?? undefined;
        const abbr = url.searchParams.get("abbr");
        const dossier = resolve({ asOf: date, q, abbr });
        return Response.json({
          version: "1",
          date,
          place: dossier.title,
          confidence: dossier.confidence,
          offices: dossier.offices,
          termLimit: dossier.term,
        });
      },
    },
  },
});
