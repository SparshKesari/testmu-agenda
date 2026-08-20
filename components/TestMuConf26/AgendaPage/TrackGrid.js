import { useEffect, useState } from "react";

import { TRACKS } from "../../../lib/tracks";
import { usePersona } from "../../../lib/PersonaContext";
import { DAY_ISO, slotMinutes, useNowPT } from "./timezone";

/* Spreadsheet-style agenda: time slots as rows, tracks as columns —
   mirroring the planning sheet's track split. Plenary items (welcome
   notes, keynotes, closing notes — rows with no track) span the full
   width; tracked sessions sit in their track's column. */

/* Keynotes and welcome notes carry track "trust" (they run on the Trust
   stage), so they normally render in that column; closing notes have no
   track and span the full width. When a track filter hides a plenary
   item's column, the item spans the full width instead — otherwise its
   home column would appear even though no filtered session lives there. */
const isPlenaryType = (row) =>
  row.type === "KEYNOTE" ||
  row.type === "WELCOME NOTE" ||
  !row.type ||
  /^(welcome|closing)/i.test(row.title || "");

const sessionHref = (row, sessions) =>
  row.session && sessions[row.session] && !sessions[row.session].hidden
    ? `https://www.testmuai.com/testmuconf-2026/${row.session}/`
    : null;

const speakerNames = (rowSpeakers) =>
  rowSpeakers.map((s) => `${s.first || ""} ${s.last || ""}`.trim()).join(", ");

const VisitIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
    <path
      d="M6.5 3H3v10h10V9.5M9.5 3H13v3.5M13 3L7.5 8.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BellIcon = ({ active, accent }) => (
  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" aria-hidden="true">
    <path
      d="M8 1.8a4 4 0 0 0-4 4v2.6L2.6 10.8h10.8L12 8.4V5.8a4 4 0 0 0-4-4Z"
      fill={active ? accent : "none"}
      stroke={active ? accent : "currentColor"}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M6.4 13a1.6 1.6 0 0 0 3.2 0"
      fill="none"
      stroke={active ? accent : "currentColor"}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe3a6]";

const SessionCell = ({
  row,
  sessions,
  rowSpeakers,
  accent,
  live,
  reminded,
  onToggleReminder,
  trackName,
  timeLabel,
  ownTime,
}) => {
  const href = sessionHref(row, sessions);
  return (
    <article
      className="flex flex-col h-full border border-[#fffef2]/10 bg-[#26211a] px-3.5 py-3 hover:border-[#fffef2]/30 transition-colors"
      aria-label={`${row.title}${trackName ? `, ${trackName}` : ""}${timeLabel ? `, ${timeLabel}` : ""}`}
    >
      {/* The visual grid conveys track and time by position; restate them
          for screen readers, which read cells out of visual context. */}
      <p
        className="text-[10px] tracking-[0.18em] uppercase mb-1.5"
        style={{ color: accent }}
      >
        {row.type || "SESSION"}
        {row.duration ? ` · ${row.duration}` : ""}
        {row.recorded && (
          <span className="ml-2 text-[#fffef2]/50">◉ RECORDED</span>
        )}
        {trackName && <span className="sr-only">, {trackName}</span>}
        {timeLabel && <span className="sr-only">, {timeLabel}</span>}
        {live && (
          <span className="ml-2 text-[#ff9c8f]">
            <span aria-hidden="true">● </span>LIVE
          </span>
        )}
      </p>
      {/* A session merged into a host slot row (e.g. a 90-min workshop)
          runs past the row's window, so it states its own time. */}
      {ownTime && (
        <p
          className="text-[10px] tracking-[0.14em] uppercase mb-1.5 [font-variant-numeric:tabular-nums]"
          style={{ color: accent }}
          aria-hidden="true"
        >
          {ownTime}
        </p>
      )}
      <p className="text-[13px] leading-snug text-[#fffef2]">{row.title}</p>
      {rowSpeakers.length > 0 && (
        <p className="text-[11px] text-[#fffef2]/70 mt-1.5">
          {speakerNames(rowSpeakers)}
        </p>
      )}
      {row.hosts?.length > 0 && (
        <p className="text-[10px] tracking-[0.14em] uppercase mt-1.5">
          <span className="text-[#fffef2]/50">Host · </span>
          <span className="text-[#ffd57a] font-semibold">
            {row.hosts.join(" / ")}
          </span>
        </p>
      )}

      <div className="flex items-center justify-end gap-1.5 mt-auto pt-2.5">
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit session page: ${row.title} (opens in new tab)`}
            title="Visit session page"
            className={`p-2 border border-[#fffef2]/20 text-[#fffef2]/70 hover:text-[#fffef2] hover:border-[#fffef2]/50 transition-colors ${FOCUS_RING}`}
          >
            <VisitIcon />
          </a>
        )}
        <button
          type="button"
          aria-pressed={reminded}
          aria-label={
            reminded
              ? `Notification set for ${row.title} — click to remove`
              : `Notify me about ${row.title}`
          }
          title={reminded ? "Notification set" : "Notify me"}
          onClick={() => onToggleReminder(row.id)}
          className={`p-2 border transition-colors ${FOCUS_RING} ${
            reminded
              ? "border-current"
              : "border-[#fffef2]/20 text-[#fffef2]/70 hover:text-[#fffef2] hover:border-[#fffef2]/50"
          }`}
          style={reminded ? { color: accent, borderColor: accent } : {}}
        >
          <BellIcon active={reminded} accent={accent} />
        </button>
      </div>
    </article>
  );
};

const PlenaryBand = ({ row, rowSpeakers, live, timeLabel }) => {
  const keynote = row.type === "KEYNOTE";
  return (
    <article
      className={`block border px-4 py-3 ${
        keynote
          ? "border-[#c8a6ff]/40 bg-[#c8a6ff]/10"
          : "border-[#fffef2]/15 bg-[#fffef2]/5"
      }`}
      aria-label={`${row.title}, all stages${timeLabel ? `, ${timeLabel}` : ""}`}
    >
      <p className="text-[10px] tracking-[0.2em] uppercase text-[#fffef2]/75 mb-1">
        {row.type || "NOTE"}
        {row.duration ? ` · ${row.duration}` : ""}
        {row.recorded && (
          <span className="ml-2 text-[#fffef2]/50">◉ RECORDED</span>
        )}
        {timeLabel && <span className="sr-only">, {timeLabel}</span>}
        {live && (
          <span className="ml-2 text-[#ff9c8f]">
            <span aria-hidden="true">● </span>LIVE
          </span>
        )}
      </p>
      <p
        className={`leading-snug ${
          keynote
            ? "[font-family:'Space_Grotesk',sans-serif] text-[16px] font-bold"
            : "text-[13px]"
        }`}
      >
        {row.title}
        {rowSpeakers.length > 0 && (
          <span className="text-[#fffef2]/75 font-normal text-[12px]">
            {" "}
            — {speakerNames(rowSpeakers)}
          </span>
        )}
      </p>
      {row.hosts?.length > 0 && (
        <p className="text-[10px] tracking-[0.14em] uppercase mt-1">
          <span className="text-[#fffef2]/50">Host · </span>
          <span className="text-[#ffd57a] font-semibold">
            {row.hosts.join(" / ")}
          </span>
        </p>
      )}
    </article>
  );
};

const TrackGrid = ({
  rows,
  allRows,
  sessions,
  getSpeakers,
  dayId,
  formatTime,
  isLive,
}) => {
  /* Notify-me toggles, kept per signed-in email in localStorage. */
  const { email } = usePersona();
  const storageKey = `tm26:reminders:${email}`;
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    try {
      setReminders(
        JSON.parse(window.localStorage.getItem(storageKey)) || [],
      );
    } catch {
      setReminders([]);
    }
  }, [storageKey]);

  const toggleReminder = (id) =>
    setReminders((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });

  /* Only show track columns that have non-plenary sessions on this day
     (after filtering) — plenary items alone shouldn't summon a column. */
  const dayTracks = TRACKS.filter((t) =>
    rows.some((r) => r.track === t.id && !isPlenaryType(r)),
  );
  const shownTrackIds = new Set(dayTracks.map((t) => t.id));
  const isPlenary = (row) =>
    isPlenaryType(row) && (!row.track || !shownTrackIds.has(row.track));

  /* Group rows into time slots, ordered by start time. The slot list
     comes from the full unfiltered day (allRows) so slots emptied by a
     track/search filter still appear, as visible gaps in the timeline. */
  const slotOrder = [];
  const slots = new Map();
  (allRows || rows).forEach((row) => {
    const key = row.time || "TBD";
    if (!slots.has(key)) {
      slots.set(key, []);
      slotOrder.push(key);
    }
  });
  rows.forEach((row) => {
    const key = row.time || "TBD";
    if (!slots.has(key)) {
      slots.set(key, []);
      slotOrder.push(key);
    }
    slots.get(key).push(row);
  });

  /* A slot whose start falls inside another slot's window (a long
     workshop like 08:15-09:45 among 45-min slots) merges into that host
     row instead of spawning a near-empty timeline row of its own; the
     merged card states its own time. Shorter host wins on equal starts. */
  const spans = slotOrder
    .map((key) => ({ key, span: slotMinutes(key) }))
    .sort(
      (a, b) =>
        (a.span?.start ?? 0) - (b.span?.start ?? 0) ||
        (a.span?.end ?? 0) - (b.span?.end ?? 0),
    );
  const hostKeys = [];
  spans.forEach((g) => {
    const host =
      g.span &&
      hostKeys.find(
        (h) => h.span && g.span.start >= h.span.start && g.span.start < h.span.end,
      );
    if (host) {
      slots.get(host.key).push(...slots.get(g.key));
      slots.delete(g.key);
    } else {
      hostKeys.push(g);
    }
  });
  const mergedOrder = hostKeys.map((g) => g.key);

  /* Now-marker on the PT axis, for the moving line inside the live row. */
  const nowPT = useNowPT();
  const nowMin =
    nowPT && DAY_ISO[dayId] === nowPT.dateISO ? nowPT.minutes : null;

  /* Compact columns so several stages fit per screen: text wraps inside
     a bounded column instead of the grid growing to max-content. The
     inner wrapper's minWidth (time column + n columns + gaps) is what
     overflows into the horizontal scroll on narrow viewports. */
  const COL_MIN = 200;
  const nCols = dayTracks.length || 1;
  const colTemplate = `90px repeat(${nCols}, minmax(${COL_MIN}px, 1fr))`;
  const gridMinWidth = 90 + nCols * (COL_MIN + 8);

  const dayLabel = `Day ${(dayId || "").replace("day", "")}`;

  return (
    /* The grid scrolls both ways inside its own viewport-capped box so
       the sticky column headers pin to the top while the rows scroll
       beneath them; making the scroll region focusable lets keyboard
       users pan it with arrow keys. */
    <div
      className={`overflow-auto pb-2 max-h-[calc(100vh-16px)] ${FOCUS_RING}`}
      role="region"
      aria-label={`${dayLabel} schedule by stage — scrollable`}
      tabIndex={0}
    >
      <div style={{ minWidth: `${gridMinWidth}px` }}>
        {/* Column headers — sticky, with an opaque background so rows
            scrolling underneath don't show through the column gaps. */}
        <div
          className="grid gap-2 pb-2 sticky top-0 z-10 bg-[#1e1a14]"
          style={{ gridTemplateColumns: colTemplate }}
        >
          <div className="px-2 py-3 text-[10px] tracking-[0.2em] uppercase text-[#fffef2]/70 self-end">
            Time
          </div>
          {dayTracks.map((t) => (
            <div
              key={t.id}
              className="border-t-2 bg-[#26211a] px-3.5 py-3"
              style={{ borderTopColor: t.accent }}
            >
              {t.manager && (
                <p className="text-[10px] tracking-[0.14em] uppercase text-[#fffef2]/50 mb-1">
                  Stage Manager · {t.manager}
                </p>
              )}
              <p
                className="[font-family:'Space_Grotesk',sans-serif] text-[14px] font-bold"
                style={{ color: t.accent }}
              >
                {t.name}
              </p>
            </div>
          ))}
        </div>

        {/* One row per time slot */}
        {mergedOrder.map((slotKey) => {
          const slotRows = slots.get(slotKey);
          const plenary = slotRows.filter(isPlenary);
          const tracked = slotRows.filter((r) => !isPlenary(r) && r.track);
          const loose = slotRows.filter((r) => !isPlenary(r) && !r.track);
          const timeLabel = formatTime ? formatTime(slotKey) : slotKey;
          const live = isLive ? isLive(slotKey) : false;
          /* A session merged from another slot shows its own time and
             tracks its own live window. */
          const cellTime = (row) =>
            row.time && row.time !== slotKey
              ? formatTime
                ? formatTime(row.time)
                : row.time
              : null;
          const cellLive = (row) =>
            isLive ? isLive(row.time || slotKey) : false;
          /* How far the current time has progressed through this slot's
             window, for the moving now-line; null while not live. */
          const span = slotMinutes(slotKey);
          const progress =
            nowMin !== null &&
            span &&
            nowMin >= span.start &&
            nowMin < span.end
              ? (nowMin - span.start) / (span.end - span.start)
              : null;

          return (
            /* Each slot starts with a full-width guide line; the time
               label sits directly on it, calendar-style. While the slot
               is live, a red now-line travels down the row in proportion
               to the time elapsed in the slot. */
            <div
              key={`${dayId}-${slotKey}`}
              className="relative grid gap-2 items-stretch pt-2.5 pb-3.5 border-t border-[#fffef2]/15"
              style={{ gridTemplateColumns: colTemplate }}
            >
              {progress !== null && (
                <div
                  className="absolute left-0 right-0 h-[2px] bg-[#ff5c4d] shadow-[0_0_6px_rgba(255,92,77,0.45)] pointer-events-none z-[5]"
                  style={{ top: `${progress * 100}%` }}
                  aria-hidden="true"
                >
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ff5c4d]" />
                </div>
              )}
              <div className="px-2 text-[12px] leading-snug text-[#fffef2]/75 [font-variant-numeric:tabular-nums]">
                {timeLabel}
                {live && (
                  <span className="block mt-1 text-[10px] tracking-[0.14em] uppercase text-[#ff5c4d]">
                    <span aria-hidden="true">● </span>Live now
                  </span>
                )}
              </div>

              {/* Vertical guide between the time column and the grid. */}
              <div
                className="flex flex-col gap-2 relative before:absolute before:inset-y-0 before:-left-[5px] before:w-px before:bg-[#fffef2]/10"
                style={{ gridColumn: `2 / span ${dayTracks.length || 1}` }}
              >
                {slotRows.length === 0 && (
                  <div
                    className="flex items-center border border-dashed border-[#fffef2]/15 px-4 py-3 text-[11px] tracking-[0.08em] uppercase text-[#fffef2]/40"
                    aria-label={`No matching sessions${timeLabel ? `, ${timeLabel}` : ""}`}
                  >
                    No sessions in this slot
                  </div>
                )}
                {plenary.map((row) => (
                  <PlenaryBand
                    key={row.id}
                    row={row}
                    rowSpeakers={getSpeakers(row, row.session ? sessions[row.session] : null)}
                    live={live}
                    timeLabel={timeLabel}
                  />
                ))}
                {loose.length > 0 && (
                  <div className="grid gap-2 grid-cols-3 ipadpro:grid-cols-2 smtablet:grid-cols-1">
                    {loose.map((row) => (
                      <SessionCell
                        key={row.id}
                        row={row}
                        sessions={sessions}
                        rowSpeakers={getSpeakers(row, row.session ? sessions[row.session] : null)}
                        accent="#6c6c58"
                        live={cellLive(row)}
                        reminded={reminders.includes(row.id)}
                        onToggleReminder={toggleReminder}
                        timeLabel={cellTime(row) || timeLabel}
                        ownTime={cellTime(row)}
                      />
                    ))}
                  </div>
                )}
                {tracked.length > 0 && (
                  /* Same column count and gap as the header row, inside a
                     spanning area of identical width, so the nested track
                     columns line up with the header columns. */
                  <div
                    className="grid gap-2 flex-1"
                    style={{
                      gridTemplateColumns: `repeat(${nCols}, minmax(${COL_MIN}px, 1fr))`,
                    }}
                  >
                    {dayTracks.map((t) => {
                      const cellRows = tracked.filter((r) => r.track === t.id);
                      return (
                        /* Vertical guide lines centered in the column
                           gaps; the last column has no trailing line. */
                        <div
                          key={t.id}
                          className="flex flex-col gap-2 relative after:absolute after:inset-y-0 after:-right-[5px] after:w-px after:bg-[#fffef2]/10 last:after:hidden"
                        >
                          {cellRows.map((row) => (
                            <SessionCell
                              key={row.id}
                              row={row}
                              sessions={sessions}
                              rowSpeakers={getSpeakers(row, row.session ? sessions[row.session] : null)}
                              accent={t.accent}
                              live={cellLive(row)}
                              reminded={reminders.includes(row.id)}
                              onToggleReminder={toggleReminder}
                              trackName={t.name}
                              timeLabel={cellTime(row) || timeLabel}
                              ownTime={cellTime(row)}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Closing guide line under the last slot. */}
        <div className="border-t border-[#fffef2]/15" aria-hidden="true" />
      </div>
    </div>
  );
};

export default TrackGrid;
