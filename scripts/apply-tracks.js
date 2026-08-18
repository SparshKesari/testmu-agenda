/* Reads the track-split spreadsheet CSV and stamps a `track` field onto
   each session in data/agendaData.json. Plenary items (welcome/closing
   notes, keynotes) stay untracked — the UI renders them full-width.

   Usage: node scripts/apply-tracks.js "<path-to-csv>" */

const fs = require("fs");
const path = require("path");

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/apply-tracks.js <csv-path>");
  process.exit(1);
}

const agendaPath = path.join(__dirname, "..", "data", "agendaData.json");
const speakersPath = path.join(__dirname, "..", "data", "speakersData.json");
const agenda = JSON.parse(fs.readFileSync(agendaPath, "utf8"));
const speakersData = JSON.parse(fs.readFileSync(speakersPath, "utf8"));

/* --- tiny CSV parser (handles quoted multi-line cells) --- */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/* CSV column index → track id (columns 0-3 are date/duration/times). */
const TRACK_COLUMNS = {
  4: "trust",
  5: "quality",
  6: "build",
  7: "agentic",
  8: "scale",
  9: "ship",
  10: "workshop",
};

const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[“”"'’‘]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));

/* Collect {day, track, title, speakerLine} for every track-column cell. */
const csvSessions = [];
let currentDay = null;
rows.forEach((cols) => {
  const dayCell = (cols[0] || "").trim();
  const dayMatch = /^Day\s*(\d)/i.exec(dayCell);
  if (dayMatch) currentDay = `day${dayMatch[1]}`;
  if (!currentDay) return;
  Object.entries(TRACK_COLUMNS).forEach(([idx, track]) => {
    const cell = (cols[idx] || "").trim();
    if (!cell) return;
    const lines = cell
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("["));
    if (!lines.length) return;
    const title = lines[0];
    if (/^(welcome note|closing note)$/i.test(title)) return;
    csvSessions.push({
      day: currentDay,
      track,
      title,
      speakerLine: lines.slice(1).join(", "),
    });
  });
});

/* Speaker slug → normalized full name, for fallback matching. */
const speakerName = {};
Object.entries(speakersData).forEach(([slug, s]) => {
  speakerName[slug] = normalize(`${s.first || ""} ${s.last || ""}`);
});

const rowSlugs = (row) =>
  Array.isArray(row.speakers) ? row.speakers : row.speaker ? [row.speaker] : [];

const PLENARY_TYPES = new Set(["KEYNOTE", "WELCOME NOTE"]);
const isPlenary = (row) =>
  PLENARY_TYPES.has(row.type) ||
  /^(welcome|closing)/i.test(row.title || "") ||
  !row.type;

let matched = 0;
const unmatchedCsv = [];

csvSessions.forEach((cs) => {
  const dayRows = agenda[cs.day] || [];
  const nTitle = normalize(cs.title);

  let hit = dayRows.find((r) => normalize(r.title) === nTitle);
  if (!hit) {
    hit = dayRows.find((r) => {
      const nr = normalize(r.title);
      return nr && (nr.includes(nTitle) || nTitle.includes(nr));
    });
  }
  if (!hit && cs.speakerLine) {
    /* Match on speakers: every CSV speaker appears in the row's roster. */
    const wanted = cs.speakerLine
      .split(/,|&/)
      .map((n) => normalize(n))
      .filter(Boolean);
    const candidates = dayRows.filter((r) => {
      if (isPlenary(r) || r.track) return false;
      const names = rowSlugs(r).map((slug) => speakerName[slug] || "");
      return (
        wanted.length &&
        wanted.every((w) => names.some((n) => n === w || n.includes(w)))
      );
    });
    if (candidates.length === 1) hit = candidates[0];
  }

  if (hit && !isPlenary(hit)) {
    if (hit.track && hit.track !== cs.track) {
      console.warn(`CONFLICT: "${hit.title}" ${hit.track} vs ${cs.track}`);
    }
    hit.track = cs.track;
    matched++;
  } else if (!hit) {
    unmatchedCsv.push(`${cs.day} [${cs.track}] ${cs.title}`);
  }
});

/* Keynotes and welcome notes run on the Trust stage. */
Object.values(agenda).forEach((dayRows) =>
  dayRows.forEach((r) => {
    if (r.type === "KEYNOTE" || r.type === "WELCOME NOTE") r.track = "trust";
  }),
);

const untrackedRows = [];
Object.entries(agenda).forEach(([day, dayRows]) => {
  dayRows.forEach((r) => {
    if (!isPlenary(r) && !r.track) untrackedRows.push(`${day} ${r.id} ${r.title}`);
  });
});

fs.writeFileSync(agendaPath, JSON.stringify(agenda, null, 2) + "\n");
console.log(`Tracks applied: ${matched}/${csvSessions.length} CSV sessions matched.`);
if (unmatchedCsv.length) {
  console.log(`\nCSV sessions with no agenda match (${unmatchedCsv.length}):`);
  unmatchedCsv.forEach((l) => console.log("  - " + l));
}
if (untrackedRows.length) {
  console.log(`\nAgenda sessions left without a track (${untrackedRows.length}):`);
  untrackedRows.forEach((l) => console.log("  - " + l));
}
