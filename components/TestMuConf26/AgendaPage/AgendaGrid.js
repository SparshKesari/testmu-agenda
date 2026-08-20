import { useEffect, useRef } from "react";

import styles from "./AgendaGrid.module.css";
import { TypeIcon, AvatarStack, TYPE_FILL } from "./AgendaRow";
import {
  DAY_ISO,
  formatSlot,
  formatTick,
  isSlotLive,
  useNowPT,
} from "./timezone";

const PX_PER_MIN = 4;

/* Card layout tier by slot length: micro (<25 min) lays everything out
   in one row; medium (25-59 min) and full (>=60 min) stack pill row,
   title, and meta vertically, with the title wrapping onto as many
   lines as the card height allows (computed in titleLinesFor). */
const tierFor = (durationMin) => {
  /* Ultra-short slots (e.g. a 5-min welcome note = 20px) get a single
     compressed line — anything taller than that would clip. */
  if (durationMin < 12) return "nano";
  if (durationMin < 25) return "micro";
  if (durationMin < 60) return "medium";
  return "full";
};

/* How many wrapped title lines fit: card height minus padding, gaps,
   pill/avatar row, and meta line, divided by the title line-height. */
const TIER_METRICS = {
  medium: { overhead: 20 + 12 + 26 + 14, lineHeight: 18 },
  full: { overhead: 24 + 16 + 36 + 15, lineHeight: 20 },
};

const titleLinesFor = (tier, durationMin) => {
  const m = TIER_METRICS[tier];
  if (!m) return undefined;
  const cardHeight = durationMin * PX_PER_MIN - 4;
  const budget = cardHeight - m.overhead;
  return Math.min(4, Math.max(1, Math.floor(budget / m.lineHeight)));
};

/* Slot strings read "05:15 - 05:45 AM (PT)" or "11:45 AM - 12:30 PM (PT)";
   a start time without its own meridiem borrows the end time's. Returns
   minutes since midnight, or null when the string doesn't parse. */
const parseSlot = (timeStr) => {
  const m =
    /^(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/.exec(
      (timeStr || "").trim(),
    );
  if (!m) return null;
  const toMin = (hh, mm, meridiem) => {
    let h = Number(hh);
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return h * 60 + Number(mm);
  };
  const start = toMin(m[1], m[2], m[3] || m[6]);
  const end = toMin(m[4], m[5], m[6]);
  return end > start ? { start, end } : null;
};

/* Google-Calendar-style packing: sort by start, break into clusters of
   transitively overlapping events, then give each event the first free
   column; every event in a cluster shares the cluster's column count.
   Workshops always take the rightmost column(s) of their cluster. */
const layoutEvents = (events) => {
  const sorted = [...events].sort(
    (a, b) => a.start - b.start || b.end - a.end,
  );
  const greedyColumns = (evs) => {
    const colEnds = [];
    evs.forEach((ev) => {
      let col = colEnds.findIndex((end) => end <= ev.start);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(ev.end);
      } else {
        colEnds[col] = ev.end;
      }
      ev.col = col;
    });
    return colEnds.length;
  };
  const finalize = (cluster) => {
    const rest = cluster.filter((ev) => ev.row.type !== "WORKSHOP");
    const workshops = cluster.filter((ev) => ev.row.type === "WORKSHOP");
    const restCols = greedyColumns(rest);
    const workshopCols = greedyColumns(workshops);
    workshops.forEach((ev) => {
      ev.col += restCols;
    });
    const total = restCols + workshopCols;
    cluster.forEach((ev) => {
      ev.cols = total;
      ev.span = 1;
    });
    /* Keynotes stretch across every column that is free for their whole
       interval, so they read full-width unless something (e.g. a long
       workshop) genuinely runs alongside them. */
    cluster
      .filter((ev) => ev.row.type === "KEYNOTE")
      .forEach((keynote) => {
        const occupied = new Set();
        cluster.forEach((other) => {
          if (
            other !== keynote &&
            other.start < keynote.end &&
            other.end > keynote.start
          ) {
            for (let c = other.col; c < other.col + other.span; c += 1) {
              occupied.add(c);
            }
          }
        });
        let bestStart = keynote.col;
        let bestLen = 1;
        let runStart = null;
        for (let c = 0; c <= total; c += 1) {
          if (c < total && !occupied.has(c)) {
            if (runStart === null) runStart = c;
          } else if (runStart !== null) {
            if (c - runStart > bestLen) {
              bestLen = c - runStart;
              bestStart = runStart;
            }
            runStart = null;
          }
        }
        keynote.col = bestStart;
        keynote.span = bestLen;
      });
  };
  let cluster = [];
  let clusterEnd = -1;
  sorted.forEach((ev) => {
    if (cluster.length && ev.start >= clusterEnd) {
      finalize(cluster);
      cluster = [];
    }
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.end);
  });
  if (cluster.length) finalize(cluster);
  return sorted;
};

const groupByTime = (rows) => {
  const groups = [];
  const byTime = new Map();
  rows.forEach((row) => {
    const key = row.time || "TBD";
    let group = byTime.get(key);
    if (!group) {
      group = { time: key, rows: [] };
      byTime.set(key, group);
      groups.push(group);
    }
    group.rows.push(row);
  });
  return groups;
};

const TIER_CLASS = {
  nano: "cardNano",
  micro: "cardMicro",
  medium: "cardMedium",
  full: "",
};

const Card = ({
  row,
  session,
  rowSpeakers,
  style,
  tier,
  titleLines,
  timeLabel,
  live,
}) => {
  const href =
    row.session && session && !session.hidden
      ? `https://www.testmuai.com/testmuconf-2026/${row.session}/`
      : null;
  const Tag = href ? "a" : "div";
  const accent = TYPE_FILL[row.type] || "#6c6c58";
  const tierClass = TIER_CLASS[tier] ? styles[TIER_CLASS[tier]] : "";
  const time = timeLabel || row.time;
  const meta = (
    <p className={styles.cardMeta}>
      {time}
      {row.duration ? ` · ${row.duration}` : ""}
      {row.hosts?.length > 0 && (
        <>
          {" · "}
          <span className={styles.hostHighlight}>
            HOST {row.hosts.join(" / ")}
          </span>
        </>
      )}
      {row.recorded ? " · ◉ RECORDED" : ""}
    </p>
  );
  /* Untyped agenda rows (Welcome/Closing Notes) use their title as the
     tag ("WELCOME NOTE") and skip the separate title text so it doesn't
     repeat; TypeIcon falls back to the muted fill. */
  const untyped = !row.type;
  const pill = (
    <span className={styles.pillRow}>
      <span className={styles.typePill}>
        <TypeIcon type={row.type} />
        {row.type || row.title}
      </span>
      {live && (
        <span className={styles.liveBadge}>
          <span className={styles.liveDot} aria-hidden="true" />
          LIVE
        </span>
      )}
    </span>
  );

  /* Micro slots lay every element out horizontally so the type tag,
     title, avatars, and time all stay visible at reduced heights.
     Nano drops the meta row and avatars — one line is all that fits. */
  const nano = tier === "nano";
  const inline = tier === "micro" || nano;

  return (
    <Tag
      {...(href ? { href } : {})}
      className={`${styles.card} ${href ? styles.cardLink : ""} ${tierClass}`}
      style={{ ...style, borderLeftColor: accent }}
      aria-label={`${row.title}, ${time}${live ? ", live now" : ""}`}
    >
      {inline ? (
        <>
          <div className={styles.inlineRow}>
            {pill}
            {!untyped && <p className={styles.inlineTitle}>{row.title}</p>}
            {!nano && <AvatarStack speakers={rowSpeakers} small />}
          </div>
          {!nano && (
            <div className={styles.metaRow}>
              {meta}
              {href && (
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className={styles.cardTop}>
            {pill}
            <AvatarStack speakers={rowSpeakers} small={tier === "medium"} />
          </div>
          <p
            className={styles.cardTitle}
            style={titleLines ? { WebkitLineClamp: titleLines } : undefined}
          >
            {row.title}
          </p>
          <div className={styles.metaRow}>
            {meta}
            {href && (
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            )}
          </div>
        </>
      )}
    </Tag>
  );
};

const AgendaGrid = ({ rows, sessions, getSpeakers, dayId, tz }) => {
  /* Google-Calendar-style now indicator: only while this dayId is the
     conference day currently underway in PT. nowMin stays on the PT axis
     (matching the canvas) regardless of the display timezone. */
  const now = useNowPT();
  const nowMin =
    now && DAY_ISO[dayId] === now.dateISO ? now.minutes : null;
  const nowLineRef = useRef(null);
  const autoScrolledRef = useRef(false);

  useEffect(() => {
    if (nowMin === null || autoScrolledRef.current) return;
    const el = nowLineRef.current;
    /* offsetParent is null while this grid sits in a hidden day panel or
       the list view is active; skip so a hidden grid never scrolls the
       page, and retry on the next tick once visible. */
    if (!el || el.offsetParent === null) return;
    autoScrolledRef.current = true;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [nowMin]);

  const events = [];
  const unscheduled = [];
  rows.forEach((row) => {
    const slot = parseSlot(row.time);
    if (slot) events.push({ ...slot, row });
    else unscheduled.push(row);
  });
  const laidOut = layoutEvents(events);

  const dayStart =
    Math.floor(Math.min(...laidOut.map((e) => e.start), 24 * 60) / 60) * 60;
  const dayEnd =
    Math.ceil(Math.max(...laidOut.map((e) => e.end), 0) / 60) * 60;
  const canvasHeight = (dayEnd - dayStart) * PX_PER_MIN;

  const ticks = [];
  for (let t = dayStart; t <= dayEnd; t += 30) {
    ticks.push({ min: t, isHour: t % 60 === 0 });
  }

  return (
    <>
      {/* Desktop: time-proportional calendar */}
      <div className={styles.calendar} aria-hidden={false}>
        <div className={styles.gutter} style={{ height: canvasHeight }}>
          {ticks.map((tick) => (
            <span
              key={tick.min}
              className={`${styles.gutterLabel} ${tick.isHour ? "" : styles.gutterLabelHalf}`}
              style={{ top: (tick.min - dayStart) * PX_PER_MIN }}
            >
              {formatTick(dayId, tick.min, tz)}
            </span>
          ))}
        </div>
        <div className={styles.canvas} style={{ height: canvasHeight }}>
          {ticks.map((tick) => (
            <span
              key={tick.min}
              className={`${styles.hourLine} ${tick.isHour ? "" : styles.hourLineHalf}`}
              style={{ top: (tick.min - dayStart) * PX_PER_MIN }}
              aria-hidden="true"
            />
          ))}
          {laidOut.map((ev) => {
            const { row } = ev;
            const session = row.session ? sessions[row.session] : null;
            const colWidth = 100 / ev.cols;
            const width = colWidth * (ev.span || 1);
            const durationMin = ev.end - ev.start;
            return (
              <Card
                key={row.id}
                row={row}
                session={session}
                rowSpeakers={getSpeakers(row, session)}
                tier={tierFor(durationMin)}
                titleLines={titleLinesFor(tierFor(durationMin), durationMin)}
                timeLabel={formatSlot(dayId, row.time, tz)}
                live={
                  nowMin !== null && nowMin >= ev.start && nowMin < ev.end
                }
                style={{
                  position: "absolute",
                  top: (ev.start - dayStart) * PX_PER_MIN + 1,
                  height: durationMin * PX_PER_MIN - 4,
                  left: `calc(${ev.col * colWidth}% + 3px)`,
                  width: `calc(${width}% - 6px)`,
                }}
              />
            );
          })}
          {nowMin !== null && nowMin >= dayStart && nowMin <= dayEnd && (
            <div
              ref={nowLineRef}
              className={styles.nowLine}
              style={{ top: (nowMin - dayStart) * PX_PER_MIN }}
              aria-hidden="true"
            >
              <span className={styles.nowDot} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile: stacked time-slot groups */}
      <div className={styles.mobileList}>
        {groupByTime(rows).map((group) => (
          <div key={group.time} className={styles.slot}>
            <p className={styles.slotTime}>
              {formatSlot(dayId, group.time, tz)}
            </p>
            <div className={styles.slotCards}>
              {group.rows.map((row) => {
                const session = row.session ? sessions[row.session] : null;
                return (
                  <Card
                    key={row.id}
                    row={row}
                    session={session}
                    rowSpeakers={getSpeakers(row, session)}
                    tier="full"
                    titleLines={4}
                    timeLabel={formatSlot(dayId, row.time, tz)}
                    live={isSlotLive(dayId, row.time, now)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {unscheduled.length > 0 && (
        <p className={styles.unscheduledNote}>
          {unscheduled.length} session{unscheduled.length === 1 ? "" : "s"}{" "}
          without a scheduled time {unscheduled.length === 1 ? "is" : "are"}{" "}
          shown only in the list view.
        </p>
      )}
    </>
  );
};

export default AgendaGrid;
