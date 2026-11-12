# Atlas

Your government. Mapped.

This is the public application: the map, the inspector, and search. It is the same app as the live map.

People in office now are named here when a source is on the row: the president and vice president, the current Congress, governors, lieutenant governors, secretaries of state, attorneys general where the roll has them, the current U.S. Supreme Court, current state high courts, and current state legislators. A state with no single House district lists the members who are seated. A place that meets more than one district names each of those members. No November 3, 2026 winner is seated early.

The paid archive is not in this repository. Congress, the U.S. Supreme Court, and the other historical rolls before January 1, 2025 are kept from January 1, 2000 in the private data pack. Copying that pack over `src/data` restores those names. This copy ships an empty Congress archive on purpose. President, vice president, and governors stay visible on the public slider back to January 1, 2000.

Ohio and the other forty-nine states list every Census government, A to Z. Each state carries a 119th Congress district, a 2024 state-senate district, a 2024 state-house district, and the school district at the Census point. Alaska senate districts stay letters. Nebraska has no house. The District of Columbia and the five territories are on the map.

The map can show FIPS codes as their own layer. A street address goes to the Census Bureau geocoder and returns the county and its FIPS code. There is no public API.

## Run

```
npm install
npm run dev
```
