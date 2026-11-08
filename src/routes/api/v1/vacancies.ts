import { createFileRoute } from "@tanstack/react-router";
import { resolve } from "@/data/government";

export const Route = createFileRoute("/api/v1/vacancies")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
        const abbr = url.searchParams.get("abbr");
        const dossier = resolve({ asOf: date, abbr });
        return Response.json({ version: "1", date, abbr: abbr ?? null, vacancies: dossier.vacancies });
      },
    },
  },
});
