import { createServerFn } from "@tanstack/react-start";
import {
  ARCHIVE_CUTOFF,
  observedNotes,
  returnsHeadline,
  returnsPhase,
  type LiveNote,
  type ReturnsPhase,
} from "@/data/civic";

export type LivePulse = {
  now: string;
  asOf: string;
  cutoff: string;
  phase: ReturnsPhase;
  headline: string;
  observed: LiveNote[];
};

export const getLivePulse = createServerFn({ method: "GET" }).handler(async (): Promise<LivePulse> => {
  const now = new Date();
  const asOf = now.toISOString().slice(0, 10);
  const day = asOf >= "1990-01-01" && asOf <= "2035-12-31" ? asOf : "2026-11-04";
  return {
    now: now.toISOString(),
    asOf: day,
    cutoff: ARCHIVE_CUTOFF,
    phase: returnsPhase(day),
    headline: returnsHeadline(day),
    observed: observedNotes(day),
  };
});
