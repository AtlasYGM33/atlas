import { createFileRoute } from "@tanstack/react-router";
import { calendarEvents, mailRule, recallNote } from "@/data/government";

export const Route = createFileRoute("/api/v1/elections")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const date = url.searchParams.get("date");
        const abbr = url.searchParams.get("abbr");
        const kind = url.searchParams.get("kind");
        const events = calendarEvents().filter((e) => {
          if (abbr && e.abbr && e.abbr !== abbr) return false;
          if (kind && e.kind !== kind) return false;
          if (date && e.date < date) return false;
          return true;
        });
        return Response.json({
          version: "1",
          abbr: abbr ?? null,
          kind: kind ?? null,
          mail: abbr ? mailRule(abbr) : null,
          recall: recallNote(abbr),
          events,
        });
      },
    },
  },
});
