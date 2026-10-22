# VT Fantasy dashboard (v1.6.5)

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
`public/logo.png` and `public/icons/*` are a temporary "VT" badge. Replace them with the turkey logo. The home-screen icon
and favicon are also built into the `<head>` of index.html as data URIs, so swap those too when the logo changes.

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

## 1.3.3
- Recap card: Awards and Record books are locked side by side (left and right) on every phone. The layout no longer
  depends on a CSS feature (`:has`) that some phone browsers don't refresh after the record books load.

## 1.3.4
- Home-screen icon: the VT logo is built into the page (apple-touch-icon and favicon as data URIs) and the manifest is
  requested with credentials, so phones get the logo even with Netlify's visitor login turned on.

## 1.4
- Injury luck uses value over replacement (VORP). A missed game now costs the player's healthy average minus replacement
  level at his position: the points per start of the first player past the league's starting spots there (players with
  3+ starts that season, ranked; spots counted from how many each team actually started at that position, so flex use is
  included). It's the same for every team, so a deep bench shows up as skill instead of luck. Leaving early and being
  started but not playing still cost his healthy average minus what he scored. Each season's replacement levels are in the
  injury data (`replacement`).
- Fixed the week-1 gap: a regular starter is now someone who started 2 of his last 3 available weeks, or every available
  week if he has had fewer than 3, so a player hurt in week 1 counts from week 2.
- Early draft picks (rounds 1-6) hurt before they could become regular starters, including preseason injuries, now count
  while on the roster (or after being dropped, if they never play again that season). With no healthy games to go on,
  they're valued at what the player at their draft rank at that position averaged (3rd RB taken = 3rd-best RB).
- Injury cache moved to `hist/injury/v2/Y`, so every season is recalculated once.

## 1.5
- Injury luck now measures what injuries actually cost each team, roster included: the best lineup the team could have set
  with its injured players at their expected points, minus the best lineup it could actually set, plus expected minus
  scored for starters locked into the lineup (left early, started but didn't play). A deep bench softens the hit. The
  league-wide replacement version from 2.7 is kept and shown in profiles as "vs. replacement" (`vorLuck`).
- Expected points: healthy average from every game the player played at a normal snap share (starter or bench), blended
  with a prior worth 3 games (last season's points per game from nflverse stats, scaled to league scoring; for a rookie
  early pick, the value of his draft slot), times his NFL team's Vegas implied total that week over its average in his
  healthy games (0.8-1.25), times a fill-in factor for missed weeks: how much his position group's points rose without
  him (Vegas-adjusted) against the league-wide norm for that position, at most half weight and less with few weeks
  (0.8-1.3).
- Detection: any rostered player (bench or IR) out hurt counts; suspensions (R40), players who left the team, cuts and
  healthy scratches don't (nflverse weekly roster status); injured reserve, PUP and NFI always count. Left early now also
  checks that week's injury report, and covers players who normally play 20%+ of snaps (was 40%).
- New public data (cached in Blobs): `stats_player_week_Y.csv` (`nflverse/stats/v1/Y`), `roster_weekly_Y.csv`
  (`nflverse/rost/v1/Y`), `schedules/games.csv` (`nflverse/lines/v1`, 12 hours). Weekly ESPN data now keeps the whole
  roster with points (`hist/week/v3`, `weeksum/v5`), so history re-pulls once. Injury cache `hist/injury/v3/Y`.

## 1.6
- New Library section, All-Time (jump-bar button after Final Standings): every team from every season ranked by
  regular-season points per game. Views: Every team (10 per page, Best first / Worst first, a "Next <manager> team" jump,
  and the selected manager's teams highlighted), By manager (that manager's teams with the year and all-time rank), and
  By year (that season's teams with the manager and all-time rank). A strip at the top shows every team's PPG at once,
  with the manager's teams (or the chosen season's) marked. Tap any team for its roster.
- Injury luck: suspensions that start after the player has played that season now count (a surprise, like an injury).
  Suspensions known before the season (already in his draft price), cuts and healthy scratches still don't.

## 1.6.1
- All-Time moved between Draft and Trade Review.
- Its other two views are now lineups instead of team lists. Manager's all-time team: the best lineup from every player that
  manager ever had (each player's best season with him: regular-season points while on his roster, starting or bench),
  with the year and weeks, plus the next 5 best. Season's all-time team: the best lineup from that season's players, with
  the manager who had each one (most weeks; other teams listed if he moved). Slots follow the league's current lineup
  settings. New endpoint `/api/history?part=alltime&season=Y` (cache `hist/alltime/v1/Y`).

## 1.6.2
- All-Time rebuilt as three views:
  - Team rankings: every team from every season by regular-season PPG, with regular-season finish (Reg.) and final
    standings (Final). Highest / Lowest PPG, filters for manager and season, 10 per page with first/previous/next/last,
    and a strip showing every team at once (filtered teams marked).
  - All-star team by manager: best QB/RB/RB/WR/WR/TE/FLEX/D/ST/K by PPG from every player that manager ever had (PPG
    while on his roster, games played, regular season; each player once), with the year, position rank that season and
    games. Combined PPG and its rank among all managers (tap for the full ranking). A player needs 40% of a full regular
    season with him.
  - All-star team by season: the same for one season's players, with the manager who had each one (others listed if he
    moved). Ranked among finished seasons; the season in progress shows where it's on pace to land (40% of weeks so far).
- `/api/history?part=alltime` now returns games played and each player's position rank (cache `hist/alltime/v2/Y`).

## 1.6.3
- All-Time views renamed: Team Rankings, All Stars: By Manager, All Stars: By Year.
- Tap the PPG strip for a pop-up of the team at that spot (team, manager, year, PPG, all-time rank, regular-season and
  final finish, record, and a link to the roster).
- Finished seasons only: the season in progress is left out of every All-Time view until it's over.
- All Stars: By Manager: a player must have started at least 10 games for that manager in that season (`AT_MIN_STARTS`).

## 1.6.4
- All Stars: By Year: a player needs at least 10 games played that season (`AT_MIN_GAMES_YEAR`).
- Team roster pop-up (everywhere it opens): Player, Pos, PPG, Rank (e.g. RB12), sorted by position then rank; the "How"
  column is gone. PPG and rank come from the league's weekly rosters (same numbers as All-Time): points per game played
  while on a league roster that season, and position rank by those points. Rosters now include player ids
  (`hist/roster/v2`); all-time data keeps every rostered player (`hist/alltime/v3`).

## 1.6.5
- All Stars lineups drop D/ST (usually streamed): QB/RB/RB/WR/WR/TE/FLEX/K, combined PPG over eight players.
