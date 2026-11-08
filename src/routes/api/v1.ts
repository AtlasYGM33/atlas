import { createFileRoute } from "@tanstack/react-router";
import { apiCatalog } from "@/data/government";

export const Route = createFileRoute("/api/v1")({
  server: {
    handlers: {
      GET: async () => Response.json({ version: "1", name: "Atlas", endpoints: apiCatalog() }),
    },
  },
});
