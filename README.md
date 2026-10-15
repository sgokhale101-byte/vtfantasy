# VT Fantasy dashboard (v1.0)

Live dashboard for ESPN league 1299098102, built from the Boys of Chantilly dashboard (v2.4.2).

## Tabs
- **Live:** Food Chain, Scoreboard, The Sharks
- **The Week:** Standings, Story (Team of the Week, Record Watch, Trending), Awards, Transactions, Waivers
- **Social:** Pick 'em, Tier Lists (Noah and Sean), Power Rankings
- **Library:** Manager Profiles, Final Standings, Hall of Fame, Draft, Trade Review

## League settings
Everything league-specific is in the `CFG` block at the top of the script in `public/index.html`:
name, league ID, `medianStart` (2023), `eras` (off), `faab` (off), `weeklyPot` (off), `powerAuthor`, and
`tierEditors` (noah, sean). Not used in this league: FAAB tracker, Weekly Pot, Noah/Srimanth of the Week,
the Estime Quotient, headshots, name cleanup rules, and special message cards. "Cancun on 3" follows ESPN's
playoff team count (8).

## Netlify environment variables
- `ESPN_S2`, `SWID`: ESPN login cookies (same ESPN account as Boys of Chantilly, so the same values).
- `TIER_PASSWORD`: password Noah and Sean use to unlock their tier lists. Optional per-person overrides:
  `TIER_PASSWORD_NOAH`, `TIER_PASSWORD_SEAN`.
- Optional: `ESPN_LEAGUE_ID` (default 1299098102), `ESPN_SEASON` (default 2026), `POWER_AUTHOR` (only count
  power rankings posts by this member), `TIER_EDITORS` (default `noah,sean`).

## Tier lists
`/api/tiers`: GET returns both lists; POST `unlock` checks the password on the server and returns a per-person
token kept on that phone; POST `save` stores the list (Netlify Blobs, `tiers/v1`). Items are league teams
(`team:<id>`) or free text, up to 80, in tiers S, A, B, C, D.

## Logo
`public/logo.png` and `public/icons/*` are a temporary "VT" badge. Replace them with the turkey logo.

## Deploy
Publish directory `public`, functions in `netlify/functions` (netlify.toml sets both). Deploy from GitHub.
