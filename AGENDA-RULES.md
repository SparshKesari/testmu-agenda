# Agenda & Stage Manager Rules

Constraints governing `data/agendaData.json` and `lib/tracks.js` for TestMu Conf 2026.
Every number below was measured against the agenda as it stands, not estimated.

## Vocabulary

| Term | Meaning | Where it lives |
|---|---|---|
| **Session** | One talk/panel/workshop, with a fixed time and duration | a row in `data/agendaData.json` |
| **Track / Stage** | A physical stage. Seven of them. A stage runs one session at a time | `track` on the row; defined in `lib/tracks.js` |
| **Host** | The person who introduces and runs a session | `hosts` on the row |
| **Stage Manager** | The person who owns a stage for the whole conference | `manager` in `lib/tracks.js` |

A stage manager may also be a host. Those are different jobs.

## The rules

### Rule 1 — No back-to-back sessions on the same stage *(P0)*
A stage may not run two sessions where one ends exactly as the next begins, and may never
run two overlapping sessions. The stage needs a changeover gap.

> Example: if Trust runs 06:15–07:00 PM IST, Trust may not also take the session at
> 07:00 PM IST or one overlapping it.

The only exempt adjacency is a **welcome or closing note** flowing into/out of a session —
those are MC moments on the same stream by design. **Keynotes count** like any other session.

This is the highest-priority rule.

### Rule 2 — A stage manager who hosts, hosts on their own stage
If a stage manager also hosts sessions, every session they host must be on the stage they
manage. A stage manager who hosts nothing satisfies this trivially.

### Rule 3 — Session times are fixed
No session may change its start time, end time, or duration. The schedule is frozen.

### Rule 4 — Hosts are fixed
No session may change its host. Who hosts what is settled.

### Rule 5 — Workshops run on the Developer Track (formerly "Workshop Stage") — *relaxed*
Originally every WORKSHOP sat on the Developer Track. Since amended by user decisions: the
Legacy QA Arena workshop runs on the Engineer Track, the Mobile QA-Loop workshop on Ship, and
the regular session *Beyond the Hype* on the Developer Track. The track is a preference, not
a constraint. Note the schedule deliberately
leaves a 15-minute changeover before Debug with Appium MCP (08:00 end → 08:15 start), so that
adjacency is not a violation; the 07:15 and 09:45 workshop handoffs have no such gap.

### Rule 6 — Recorded sessions may change stage; live keynotes may not
A recorded session is also exempt from Rule 2: a replay does not need its manager-host live on
that stage. This freed Devansh's recorded *Scaling Trust, Not Automation* from its Ship pin and
eliminated the Quality back-to-back pair. (Since superseded: that session's host was reassigned
to **Bhawana**, the Build manager — it sits on Build, so Rule 2 is now satisfied directly.)

A recorded session (including a recorded keynote) is a stream replay, so it can run on any
stage. Live keynotes stay on their stage. This is the lever that cleared the Trust chains on
Day 2: both recorded keynotes left Trust (*Is the developer lifecycle dead?* → Agentic,
*The next era of AI* → Scale). Closing notes sit on **Trust** (the main stage), as in the
planning sheet; a closing note starting the instant the day's last session ends is the exempt
MC handoff, not a violation.

## What this leaves as the only lever

Rules 3 and 4 freeze time and host. So the only thing that can move is **which stage a session runs on** — the `track` field — or **who manages which
stage** in `lib/tracks.js`.

## Measured state of the agenda

94 sessions, 7 stages, 33 distinct hosts (after merging `Mudit`/`Mudit Singh` and
`Prince`/`Prince Dewani`, confirmed as one person each), 8 stage managers.

| Day | Sessions | Rule 2 violations | Stages needed to satisfy Rule 1 | Verdict |
|---|---|---|---|---|
| Day 1 | 31 | 5 | 7 (peak 11:00 & 11:45 PT) | fits |
| Day 2 | 38 | 6 | **8** (peak 07:15 PT / 7:45 PM IST) | **impossible with 7** |
| Day 3 | 25 | 4 | **8** (peak 06:30 PT / 7:00 PM IST) | **impossible with 7** |

Rule 1 is currently broken in **14** places across the three days — **8** if welcome notes,
keynotes and closing notes are exempt.

## Rule 1 is not fully satisfiable — the proof

On Day 2 at exactly **07:15 AM PT (7:45 PM IST)**:

**Four sessions end at that instant**
- Advanced Web Testing with Playwright and AI — *workshop*
- AI in Mobile QA: What Actually Works Today? — *quality*
- Local Agentic Theory for Accessible Mobile Games — *agentic*
- Securing Agentic AI — *ship*

**Four sessions start at that instant**
- Agentic Engineering: From Writing Code to Reviewing It — *build*
- Revisit Old Problems with New Eyes! — *trust*
- Scaling Enterprise Practice in Agentic Era — *scale*
- The Full Agentic QA Loop for Web Applications — *workshop*

Under Rule 1 a stage is still occupied at the instant its session ends, so all eight need a
distinct stage. **There are seven.** At least one pair must be back-to-back regardless of how
sessions are assigned. Day 3 has the same pinch at 06:30 PT.

This is a property of the schedule itself, not of any assignment, and it predates any edit.

**None of the eight is a recorded session** — all are live, on both days. (There are 9 recorded
sessions across the conference, but none lands on a pinch instant, so they cannot relieve it.)

### The collision is the Developer Track, both days

Two of the eight are workshops, on both days:

- **Day 2** — Advanced Web Testing with Playwright `05:45–07:15` runs straight into
  The Full Agentic QA Loop for Web `07:15–08:00`
- **Day 3** — The Full Agentic QA Loop for Mobile `05:30–06:30` runs straight into
  Legacy vs. Autonomous QA Arena `06:30–08:00`

The other six sessions at each pinch fit the other six stages exactly.

## Exact optimum (exhaustive search, all assignments)

Minimum counted back-to-back pairs per day, with times and hosts frozen, plenary pinned, and
workshops pinned to the Developer Track (Rule 5):

| Day | Original | Best possible under Rules 2–6 | Remaining pairs |
|---|---|---|---|
| Day 1 | 2 | **0** | — |
| Day 2 | 6 | **2** | Workshop 07:15, Workshop 09:45 |
| Day 3 | 1 | **0** | — (eighth track added) |

(Original counts use the corrected Rule-1 exemption: keynote adjacencies count.)

Findings from the search:

1. **The Day-2 workshop handoffs (07:15 and 09:45) are fixed by Rule 5.** Four workshops share
   one stage back-to-back-to-back with only one 15-minute gap (before Debug with Appium MCP).
   These two pairs exist in the original schedule and cannot move without breaking Rule 3 or 5.
2. **Rule 2 originally cost one extra pair on Day 2** (the Quality 08:30 squeeze) — but the
   session causing it, Devansh's *Scaling Trust, Not Automation*, is recorded, so Rule 6
   releases its Ship pin and the pair is eliminated. Day 2 sits at the two workshop handoffs.
3. **Every remaining pair sits where the original schedule already had one.** The optimum
   introduces no new back-to-back location; it removes the other two (Agentic 10:15, Ship 10:15).
4. ~~On Day 3, Devansh's Mobile QA-Loop workshop stayed on the Developer Track as a Rule-2
   exception.~~ **Resolved**: the workshop now runs on **Ship — Devansh's own stage** — and
   *Beyond the Hype* took its place on the Developer Track. Rule 2 is satisfied directly.
5. **Day 3 later reached 0** by adding an eighth stage — the **Engineer Track** — and moving
   Athresh Guruprakash's *Legacy vs. Autonomous QA Arena* workshop onto it (a user-ordered
   Rule-5 exception). Exactly the escape hatch this document predicted: the floor only moves
   with another stage.

## Status

- **Day 2: applied.** 6 → 2 counted pairs (the proven minimum — only the two workshop
  handoffs); managers 6 → 0 off-stage;
  Trust (Swapnil's stage) has zero back-to-back; workshops all on the Developer Track; the
  both recorded keynotes moved off Trust per Rule 6 (*Is the developer lifecycle dead?* →
  Agentic, *The next era of AI* → Scale); *Every Agent Drives a Browser* stays on Trust, whose
  slot is clean once the keynote left — Trust has zero adjacent sessions all day; 0 time
  changes; 0 host changes;
  d2s38/d2s39 assigned to Trust and Ship. Independent agents verified the earlier revision;
  re-verification of this one is running.
- **Day 3: applied.** 6 track moves; 1 counted pair remains (the Workshop 06:30 handoff, which
  the original schedule already had); managers 4 → 0 off-stage outside the documented d3s25
  exception (Devansh's Mobile QA-Loop workshop stays on the Developer Track per Rule 5).
- **Day 1: solved, not yet applied.** Reaches 0 pairs with 13 moves.

## Why Rule 2 cannot be fully met either, if Rule 4 holds

Each stage manager who hosts, hosts across several different stages:

| Manager | Manages | Hosts on |
|---|---|---|
| Swapnil | Trust | ship, scale, build |
| Pulkit Saxena | Quality | agentic, ship, trust |
| Nikhil Saxena | Agentic | trust, scale, ship, quality |
| Devansh | Ship | build, trust, workshop |
| Prince Dewani | Workshop | trust, workshop |
| Bhawana | Build | build ×1 (*Scaling Trust*, on her own stage) |
| Mehul Gadhiya | Scale | *hosts nothing* |
| Vishal Kumar Sahu | Workshop | *hosts nothing* |

A person manages one stage but hosts on three or four, so no stage assignment covers all
their sessions. With hosts frozen, reassigning managers to stages gets **6 of 16** manager-hosted
sessions onto their own stage — up from 1 today, but not all.

Full Rule 2 compliance requires **either** moving sessions between stages (which pressures
Rule 1) **or** changing hosts (which breaks Rule 4).

## Open decisions

1. **Do plenary items count against Rule 1?** A welcome note running straight into the keynote
   on Trust is inherently back-to-back. If exempt, the number to attack is 8, not 14.
2. **Is the Developer Track back-to-back acceptable?** It is the structural floor — one pair on
   Day 2 and one on Day 3, and it cannot be removed by reassignment. Accepting it makes the rest
   of Rule 1 solvable.
3. **Rule 2 vs Rule 4** — which yields when they conflict.

## How to check compliance

For any proposed change, verify all four:

- **Rule 1** — group sessions by `track` per day, sort by start; flag any pair where
  `previous.end >= next.start`.
- **Rule 2** — for every `hosts` entry that matches a `manager` in `lib/tracks.js`, assert the
  row's `track` equals that manager's stage.
- **Rule 3** — diff `time` and `duration` against the previous revision; must be zero changes.
- **Rule 4** — diff `hosts`; must be zero changes.

Name matching must merge `Mudit`/`Mudit Singh` and `Prince`/`Prince Dewani`, and strip the
`(External)` suffix from `Heena Purohit (External)`.

## Known data issues, tracked separately

- `d2s38` and `d2s39` have **no `track`**, so they disappear whenever a visitor filters by track.
  The Track Agenda sheet places them on Scale and Ship.
- `d3s26` has **no host**. The Host Assignments sheet names Himanshu Gulati.
- Five sessions have **conflicting times** between the Track Agenda sheet and the site
  (RemoteXPC, Playwright workshop, Legacy vs. Autonomous QA Arena, Always Open panel, Day 2 keynote).
- The host script for **Debug with Appium MCP** is a verbatim copy of the Day 1 script for the
  same speakers and introduces the wrong talk.
- `Mudit`/`Mudit Singh` and `Prince`/`Prince Dewani` appear as separate entries in the site's
  host filter despite being the same people.
