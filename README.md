# VT Fantasy dashboard (v1.3.2)

Live dashboard for ESPN league 1299098102, built from the Boys of Chantilly dashboard (v2.4.2).

## Tabs
- **Live:** Median Watch, Scoreboard
- **The Week:** Standings, Story (Team of the Week, Record Watch, Trending), Awards, Transactions, Waivers
- **Social:** Pick 'em, Noah's Tier List, Sean's Tier List (no Power Rankings: `CFG.powerRankings` is off)
- **Library:** Manager Profiles, Final Standings, Hall of Fame, Draft, Trade Review

## League settings
Everything league-specific is in the `CFG` block at the top of the script in `public/index.html`:
name, league ID, `medianStart` (2023), `eras` (off), `faab` (off), `weeklyPot` (off), `powerAuthor`, and
`tierEditors` (noah, sean). Not used in this league: FAAB tracker, Weekly Pot, Noah/Srimanth of the Week,
the Estime Quotient, headshots, and name cleanup rules. Special message card: Alexis (`SPECIAL_CARDS`). "Cancun on 3" follows ESPN's
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

## 1.1
- Social tab: Pick 'em, then one section per tier list editor ("Noah's Tier List", "Sean's Tier List"), each with its own
  jump-bar button. Power Rankings removed (section, background check, and badge), controlled by `CFG.powerRankings`.

## 1.2
- Live tab: Median Watch (current and projected median, teams above, each team's score, Vegas-adjusted projection and gap
  to the projected median, players and projected points left) plus Scoreboard. `CFG.medianWatch` on; Food Chain and The
  Sharks hidden (no top-4 or last-place stakes in this league).
- Full PPR: draft rankings count 1 point per catch (`netlify/lib/halfppr.mjs`).
- New look, separate from Boys of Chantilly: maroon banner header, Archivo + Figtree fonts, filled cards, orange
  selected states, pill tab bar (style layer at the end of the stylesheet).
- Shared with Boys of Chantilly 2.5: Point Distribution, All-play standings view, Best Case Scenario, injured players
  judged on PPG in games played.

## 1.2.1
- Best Case Scenario shortened to "Best Case" everywhere.

## 1.3
- Luck = schedule luck + injury luck, both in wins, everywhere (Standings luck view shows Luck / Sched. / Injury / BB-LW;
  profiles show both parts; Hall of Fame and Record Watch use the combined number).
- Injury luck (`seasonInjury` in netlify/lib/history.mjs, `/api/history?part=injury&season=Y`): public nflverse data
  (GitHub releases: players.csv ID map, snap_counts_YYYY.csv, injuries_YYYY.csv; 2018 on). Counts a starter leaving early
  (snap share under 60% of his normal, then on the next injury report or out next week), a starter who did not play while
  his NFL team did, and a regular starter (2 of his last 3 available weeks) missing games, including season-ending
  injuries after a drop. Points lost = healthy average minus what replaced him (or what he scored), turned into wins via the
  all-play, then centered on the league average. Cached: `nflverse/idmap/v1` (14 days), `nflverse/season/v1/Y`,
  `hist/injury/v1/Y` (finished seasons).

## 1.3.1
- Week recap card is shorter: the Standings tile is gone (last week's move now shows next to Standing at the top of the
  card, like "▲3"); High, Low, and Game of the Week sit in one compact row; Awards and Record books sit side by side
  (record books show the top 4, the rest are on Story).
- Manager profiles: every "Nth of N" rank (average finish, points per game, allowed per game, start accuracy, luck) is a
  link. Tapping it opens the full league ranking for that stat in the chosen season or era, with the manager highlighted.
- Median Watch: the "Players left" tile is gone, and Scoreboard no longer repeats the current and projected median when
  Median Watch is on.

## 1.3.2
- When someone picks Alexis's team in "I'm", the summary card shows a "Jeremy is a bitch" card (same red card Boys of
  Chantilly uses; `SPECIAL_CARDS` in index.html).
