/* Timezone helpers for the agenda. Slot times in agendaData are written
   in PT ("05:15 - 05:45 AM (PT)"); PT in August is PDT (UTC-07:00). */

import { useEffect, useState } from "react";

export const DAY_ISO = {
  day1: "2026-08-19",
  day2: "2026-08-20",
  day3: "2026-08-21",
};

/* Native zone sentinel: render slot strings exactly as authored. */
export const NATIVE_PT = "PT";

export const TZ_OPTIONS = [
  { id: NATIVE_PT, label: "Pacific Time (PT)" },
  { id: "America/New_York", label: "Eastern Time (ET)" },
  { id: "America/Chicago", label: "Central Time (CT)" },
  { id: "America/Denver", label: "Mountain Time (MT)" },
  { id: "UTC", label: "UTC" },
  { id: "Europe/London", label: "London (BST)" },
  { id: "Europe/Berlin", label: "Central Europe (CEST)" },
  { id: "Asia/Kolkata", label: "India (IST)" },
  { id: "Asia/Dubai", label: "Dubai (GST)" },
  { id: "Asia/Singapore", label: "Singapore (SGT)" },
  { id: "Asia/Tokyo", label: "Japan (JST)" },
  { id: "Australia/Sydney", label: "Sydney (AEST)" },
];

export const detectTimeZone = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || null;
  } catch (e) {
    return null;
  }
};

const SLOT_RE =
  /^(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/;

const to24h = (hh, mm, meridiem) => {
  let h = Number(hh);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
};

/* Start/end of a slot as Date objects, or null when unparseable. */
export const slotDates = (dayId, timeStr) => {
  const date = DAY_ISO[dayId];
  const m = SLOT_RE.exec((timeStr || "").trim());
  if (!date || !m) return null;
  const endMeridiem = m[6];
  const startMeridiem = m[3] || endMeridiem;
  return {
    start: new Date(`${date}T${to24h(m[1], m[2], startMeridiem)}-07:00`),
    end: new Date(`${date}T${to24h(m[4], m[5], endMeridiem)}-07:00`),
  };
};

const timeFormatter = (tz) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });

const dateFormatter = (tz) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: tz,
  });

/* Friendly abbreviations for zones where ICU only offers a GMT offset
   ("GMT+5:30" for Asia/Kolkata). */
const ZONE_ABBREVS = {
  "America/Los_Angeles": "PT",
  "America/New_York": "ET",
  "America/Chicago": "CT",
  "America/Denver": "MT",
  UTC: "UTC",
  "Europe/London": "BST",
  "Europe/Berlin": "CEST",
  "Asia/Kolkata": "IST",
  "Asia/Calcutta": "IST",
  "Asia/Dubai": "GST",
  "Asia/Singapore": "SGT",
  "Asia/Tokyo": "JST",
  "Australia/Sydney": "AEST",
};

/* Short zone label ("IST", "GMT+5:30", "EDT") for a zone id. */
export const zoneAbbrev = (tz) => {
  if (tz === NATIVE_PT) return "PT";
  if (ZONE_ABBREVS[tz]) return ZONE_ABBREVS[tz];
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(new Date(`${DAY_ISO.day1}T12:00:00-07:00`));
    const name = parts.find((p) => p.type === "timeZoneName");
    return name ? name.value : tz;
  } catch (e) {
    return tz;
  }
};

/* "05:15 - 05:45 AM (PT)" converted into the target zone, e.g.
   "05:45 - 06:15 PM (IST)"; slots that roll past midnight gain a
   "+1 DAY" marker. Unparseable strings and native PT pass through. */
export const formatSlot = (dayId, timeStr, tz) => {
  if (!tz || tz === NATIVE_PT) return timeStr;
  const dates = slotDates(dayId, timeStr);
  if (!dates) return timeStr;
  try {
    const fmt = timeFormatter(tz);
    let startText = fmt.format(dates.start);
    const endText = fmt.format(dates.end);
    const sameMeridiem = startText.slice(-2) === endText.slice(-2);
    if (sameMeridiem) startText = startText.slice(0, -3);
    const rolled =
      dateFormatter(tz).format(dates.start) > DAY_ISO[dayId]
        ? " · +1 DAY"
        : "";
    return `${startText} - ${endText} (${zoneAbbrev(tz)})${rolled}`;
  } catch (e) {
    return timeStr;
  }
};

/* QA/simulation override: open the agenda with ?now=2026-08-19T10:30 to
   preview the live indicators as if it were that PT wall-clock. The
   simulated clock keeps ticking forward from the given instant. */
let simBase; // undefined = unchecked, null = no override
const simulatedPT = () => {
  if (typeof window === "undefined") return null;
  if (simBase === undefined) {
    const m = /[?&]now=(\d{4}-\d{2}-\d{2})T(\d{1,2}):(\d{2})/.exec(
      window.location.search,
    );
    simBase = m
      ? {
          dateISO: m[1],
          minutes: Number(m[2]) * 60 + Number(m[3]),
          loadedAt: Date.now(),
        }
      : null;
  }
  if (!simBase) return null;
  const elapsed = Math.floor((Date.now() - simBase.loadedAt) / 60000);
  return {
    dateISO: simBase.dateISO,
    minutes: Math.min(simBase.minutes + elapsed, 24 * 60 - 1),
  };
};

/* Current wall-clock in PT as { dateISO: "2026-08-19", minutes: 545 }
   (minutes since PT midnight), or null when Intl is unavailable. */
export const nowInPT = () => {
  const sim = simulatedPT();
  if (sim) return sim;
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type)?.value;
    // Some ICU builds report midnight as "24" with hour12: false.
    const hour = Number(get("hour")) % 24;
    return {
      dateISO: `${get("year")}-${get("month")}-${get("day")}`,
      minutes: hour * 60 + Number(get("minute")),
    };
  } catch (e) {
    return null;
  }
};

/* The dayId whose PT date is today, or null outside the conference. */
export const liveDayId = (now = nowInPT()) =>
  now
    ? Object.keys(DAY_ISO).find((id) => DAY_ISO[id] === now.dateISO) || null
    : null;

/* Slot start/end as minutes since midnight PT, or null when unparseable. */
export const slotMinutes = (timeStr) => {
  const m = SLOT_RE.exec((timeStr || "").trim());
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

/* True while a slot on the given day is happening right now. */
export const isSlotLive = (dayId, timeStr, now) => {
  if (!now || DAY_ISO[dayId] !== now.dateISO) return false;
  const slot = slotMinutes(timeStr);
  return Boolean(slot && now.minutes >= slot.start && now.minutes < slot.end);
};

/* PT "now" that re-ticks every 30s. Starts null so the static export and
   first client render match; real values only appear after mount. */
export const useNowPT = () => {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () =>
      setNow((prev) => {
        const next = nowInPT();
        return prev &&
          next &&
          prev.dateISO === next.dateISO &&
          prev.minutes === next.minutes
          ? prev
          : next;
      });
    tick();
    const id = setInterval(tick, 30 * 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

/* Gutter tick label for a minute-of-day on the PT axis, shown in the
   target zone (e.g. PT 05:00 -> "5:30 PM" in IST). */
export const formatTick = (dayId, minOfDay, tz) => {
  const h24 = Math.floor(minOfDay / 60);
  const mm = minOfDay % 60;
  if (!tz || tz === NATIVE_PT) {
    const meridiem = h24 >= 12 ? "PM" : "AM";
    const h = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h}:${String(mm).padStart(2, "0")} ${meridiem}`;
  }
  try {
    const date = new Date(
      `${DAY_ISO[dayId]}T${String(h24).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00-07:00`,
    );
    const text = timeFormatter(tz).format(date);
    return text.replace(/^0/, "");
  } catch (e) {
    return "";
  }
};
