# Atlas

Your government. Mapped.

This is the public application: the map, the inspector, and search.

Named officeholders, court rosters, called results, city rolls, and the historical series are not in this repository. They live in a separate private data pack. Copy that pack's `src/data` over this app's `src/data` to restore the verified names. Without it, an office stays unpublished. Nothing here invents a holder.

Ohio, Indiana, Kentucky, Alabama, Alaska, and Arizona list every Census government, A to Z. Each of those states carries a 119th Congress district, a 2024 state-senate district, a 2024 state-house district, and the school district at the Census point. Alaska senate districts stay letters. A place in more than one district is not given a single member. State legislative members are not named.

The map can show FIPS codes as their own layer. A street address goes to the Census Bureau geocoder and returns the county and its FIPS code. The geocoder's newer district vintage is not copied onto a place. There is no public API.

## Run

```
npm install
npm run dev
```
