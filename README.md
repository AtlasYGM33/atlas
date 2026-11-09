# Atlas

Your government. Mapped.

This is the public application: the map, the inspector, and the read-only API.

Named officeholders, court rosters, called results, city rolls, and the historical series are not in this repository. They live in a separate private data pack. Copy that pack's `src/data` over this app's `src/data` to restore the verified names. Without it, an office stays unpublished. Nothing here invents a holder.

State and county geometry is included so the map still draws. So are the Census place lists for Ohio, Indiana, and Kentucky: every county, and the cities, towns, villages, and townships that are real governments. Kentucky has no township governments, so those statistical divisions are not listed. A place opens. The holder stays blank until the private pack is applied.

## Run

```
npm install
npm run dev
```
