import { useMemo, useState, useEffect, useRef } from "react";
import Head from "next/head";

import AgendaGrid from "../components/TestMuConf26/AgendaPage/AgendaGrid";
import AgendaRow from "../components/TestMuConf26/AgendaPage/AgendaRow";
import TrackGrid from "../components/TestMuConf26/AgendaPage/TrackGrid";
import ConfRegister from "../components/TestMuConf26/ConfRegister";
import StickyHeader from "../components/TestMuConf26/StickyHeader";
import agendaData from "../data/agendaData.json";
import sessionsData from "../data/sessionsData.json";
import speakersData from "../data/speakersData.json";
import styles from "../styles/agenda.module.css";
import {
  NATIVE_PT,
  TZ_OPTIONS,
  detectTimeZone,
  formatSlot,
  isSlotLive,
  liveDayId,
  useNowPT,
  zoneAbbrev,
} from "../components/TestMuConf26/AgendaPage/timezone";
import { usePersona } from "../lib/PersonaContext";
import { TRACKS } from "../lib/tracks";

const DAYS = [
  { id: "day1", label: "Day 1", date: "AUG 19, 2026", tabDate: "19th Aug" },
  { id: "day2", label: "Day 2", date: "AUG 20, 2026", tabDate: "20th Aug" },
  { id: "day3", label: "Day 3", date: "AUG 21, 2026", tabDate: "21st Aug" },
];

const TYPES = [
  "All",
  "Keynote",
  "Session",
  "Panel",
  "Workshop",
  "AMA",
  "Fireside Chat",
];

/* Welcome/Closing notes count as sessions for filtering purposes. */
const rowMatchesType = (row, typeMatch) => {
  if (typeMatch === "ALL") return true;
  if (typeMatch === "SESSION") {
    return row.type === "SESSION" || row.type === "WELCOME NOTE" || !row.type;
  }
  return row.type === typeMatch;
};

const rowSpeakerSlugs = (row, session) => {
  if (Array.isArray(row.speakers) && row.speakers.length) return row.speakers;
  if (session && Array.isArray(session.speakers) && session.speakers.length) {
    return session.speakers;
  }
  if (row.speaker) return [row.speaker];
  return [];
};

export async function getStaticProps() {
  return {
    props: {
      agenda: agendaData,
      sessions: sessionsData,
      speakers: speakersData,
    },
  };
}

const AgendaLanding = ({ agenda, sessions, speakers }) => {
  const { email, persona } = usePersona();
  const [activeDay, setActiveDay] = useState("day2");
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [view, setView] = useState("tracks");
  /* Multi-select: empty array means all tracks. */
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [trackOpen, setTrackOpen] = useState(false);
  const trackRef = useRef(null);
  const [selectedHost, setSelectedHost] = useState("All");
  const [hostOpen, setHostOpen] = useState(false);
  const hostRef = useRef(null);

  const toggleTrack = (id) =>
    setSelectedTracks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  /* Server-rendered HTML shows native PT; after mount we switch to the
     visitor's zone (or their dropdown pick) to avoid hydration drift. */
  const [tz, setTz] = useState(NATIVE_PT);
  const [tzOpen, setTzOpen] = useState(false);
  const filterRef = useRef(null);
  const tzRef = useRef(null);
  const now = useNowPT();

  useEffect(() => {
    const detected = detectTimeZone();
    if (detected && detected !== "America/Los_Angeles") setTz(detected);
  }, []);

  /* While the conference is underway, land visitors on today's agenda. */
  useEffect(() => {
    const today = liveDayId(now);
    if (today) setActiveDay(today);
  }, [now?.dateISO]);

  useEffect(() => {
    if (!tzOpen) return;
    const handleClick = (e) => {
      if (tzRef.current && !tzRef.current.contains(e.target)) {
        setTzOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setTzOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [tzOpen]);

  /* Dropdown options: the visitor's detected zone leads when it isn't
     already one of the presets. */
  const detected = typeof window !== "undefined" ? detectTimeZone() : null;
  const tzOptions =
    detected && !TZ_OPTIONS.some((o) => o.id === detected)
      ? [
          { id: detected, label: `Your timezone (${zoneAbbrev(detected)})` },
          ...TZ_OPTIONS,
        ]
      : TZ_OPTIONS;

  useEffect(() => {
    if (!hostOpen) return;
    const handleClick = (e) => {
      if (hostRef.current && !hostRef.current.contains(e.target)) {
        setHostOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setHostOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [hostOpen]);

  /* Every distinct host across the three days, for the host filter. */
  const allHosts = useMemo(() => {
    const set = new Set();
    Object.values(agenda).forEach((dayRows) =>
      dayRows.forEach((r) => (r.hosts || []).forEach((h) => set.add(h))),
    );
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [agenda]);

  useEffect(() => {
    if (!trackOpen) return;
    const handleClick = (e) => {
      if (trackRef.current && !trackRef.current.contains(e.target)) {
        setTrackOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setTrackOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [trackOpen]);

  useEffect(() => {
    if (!filterOpen) return;
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [filterOpen]);

  const filteredByDay = useMemo(() => {
    const q = query.trim().toLowerCase();
    const typeMatch = selectedType.toUpperCase();
    const matches = (row) => {
      if (!rowMatchesType(row, typeMatch)) return false;
      if (selectedHost !== "All" && !(row.hosts || []).includes(selectedHost)) {
        return false;
      }
      /* Track filter: plenary items (keynotes, welcome/closing notes)
         belong to every track, so they always stay visible. */
      const plenary =
        row.type === "KEYNOTE" || row.type === "WELCOME NOTE" || !row.type;
      if (
        selectedTracks.length > 0 &&
        !plenary &&
        !selectedTracks.includes(row.track)
      ) {
        return false;
      }
      if (!q) return true;
      if (row.title && row.title.toLowerCase().includes(q)) return true;
      if ((row.hosts || []).some((h) => h.toLowerCase().includes(q))) {
        return true;
      }
      const session = row.session ? sessions[row.session] : null;
      const slugs = rowSpeakerSlugs(row, session);
      return slugs.some((slug) => {
        const s = speakers[slug];
        if (!s) return false;
        const name = `${s.first || ""} ${s.last || ""}`.toLowerCase();
        return name.includes(q);
      });
    };
    const byDay = {};
    DAYS.forEach(({ id }) => {
      byDay[id] = (agenda[id] || []).filter(matches);
    });
    return byDay;
  }, [agenda, query, selectedType, selectedTracks, selectedHost, sessions, speakers]);

  const filteredRows = filteredByDay[activeDay] || [];

  const pickType = (type) => {
    setSelectedType(type);
    setFilterOpen(false);
  };

  const handleToggleRow = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const resolveRowSpeakers = (row, session) =>
    rowSpeakerSlugs(row, session)
      .map((slug) => (speakers[slug] ? { slug, ...speakers[slug] } : null))
      .filter(Boolean);

  const handleDayChange = (id) => {
    setActiveDay(id);
    setOpenId(null);
  };

  return (
    <>
      <Head>
        <title>
          {email
            ? `Agenda for ${persona.firstName} — TestMu Conf 2026`
            : "Agenda — TestMu Conf 2026"}
        </title>
      </Head>

      <div className="bg-[#1e1a14] min-h-screen">
        <StickyHeader />

        <div className={styles.container}>
          <section className={styles.page}>
            <div className={styles.container}>
              <h1 className={styles.title}>Agenda</h1>

              <div
                className={styles.dayTabs}
                role="tablist"
                aria-label="Conference days"
              >
                {DAYS.map((d) => {
                  const isActive = d.id === activeDay;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      role="tab"
                      id={`agenda-tab-${d.id}`}
                      aria-controls={`agenda-panel-${d.id}`}
                      aria-selected={isActive}
                      className={`${styles.dayTab} ${isActive ? styles.dayTabActive : ""}`}
                      onClick={() => handleDayChange(d.id)}
                    >
                      {d.label.toUpperCase()}
                      <span className={styles.dayTabDate}>{d.tabDate}</span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.toolbar}>
                <div className={styles.searchWrap}>
                  <img
                    className={styles.searchIcon}
                    src="https://assets.testmuai.com/resources/images/testmu-ai/common/search.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    className={styles.searchInput}
                    placeholder="Search sessions, speakers or hosts"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search sessions, speakers or hosts"
                  />
                </div>

                <div className={styles.filterWrap} ref={filterRef}>
                  <button
                    type="button"
                    className={`${styles.filterBtn} ${filterOpen ? styles.filterBtnOpen : ""}`}
                    onClick={() => setFilterOpen((v) => !v)}
                    aria-expanded={filterOpen}
                    aria-haspopup="true"
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M2 4H14M4 8H12M6 12H10"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>
                      Filter
                      {selectedType !== "All" ? `: ${selectedType}` : ""}
                    </span>
                  </button>

                  {filterOpen && (
                    <div
                      className={styles.filterPopover}
                      role="menu"
                      aria-label="Session Type"
                    >
                      {TYPES.map((type) => {
                        const active = selectedType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            className={`${styles.filterOption} ${active ? styles.filterOptionActive : ""}`}
                            onClick={() => pickType(type)}
                          >
                            <span
                              className={styles.filterOptionBox}
                              aria-hidden="true"
                            >
                              {active && (
                                <span className={styles.filterOptionDot} />
                              )}
                            </span>
                            <span>{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={styles.filterWrap} ref={trackRef}>
                  <button
                    type="button"
                    className={`${styles.filterBtn} ${trackOpen ? styles.filterBtnOpen : ""}`}
                    onClick={() => setTrackOpen((v) => !v)}
                    aria-expanded={trackOpen}
                    aria-haspopup="true"
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3 2V14M8 2V14M13 2V14"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>
                      {selectedTracks.length === 0
                        ? "All Tracks"
                        : selectedTracks.length === 1
                          ? TRACKS.find((t) => t.id === selectedTracks[0])?.name
                          : `${selectedTracks.length} Tracks`}
                    </span>
                  </button>

                  {trackOpen && (
                    <div
                      className={styles.filterPopover}
                      role="menu"
                      aria-label="Tracks (multi-select)"
                    >
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={selectedTracks.length === 0}
                        className={`${styles.filterOption} ${selectedTracks.length === 0 ? styles.filterOptionActive : ""}`}
                        onClick={() => {
                          setSelectedTracks([]);
                          setTrackOpen(false);
                        }}
                      >
                        <span
                          className={styles.filterOptionBox}
                          aria-hidden="true"
                        >
                          {selectedTracks.length === 0 && (
                            <span className={styles.filterOptionDot} />
                          )}
                        </span>
                        <span>All Tracks</span>
                      </button>
                      {/* Multi-select: square checkboxes (not radio dots),
                          and picking a track keeps the menu open so
                          several can be checked in one go. */}
                      {TRACKS.map((t) => {
                        const active = selectedTracks.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            role="menuitemcheckbox"
                            aria-checked={active}
                            className={`${styles.filterOption} ${active ? styles.filterOptionActive : ""}`}
                            onClick={() => toggleTrack(t.id)}
                          >
                            <span
                              aria-hidden="true"
                              className="inline-flex items-center justify-center w-[15px] h-[15px] border shrink-0"
                              style={{
                                borderColor: active
                                  ? t.accent
                                  : "rgba(255,254,242,0.4)",
                                background: active ? t.accent : "transparent",
                              }}
                            >
                              {active && (
                                <svg
                                  viewBox="0 0 10 10"
                                  fill="none"
                                  className="w-2.5 h-2.5"
                                >
                                  <path
                                    d="M1.5 5.5L4 8L8.5 2.5"
                                    stroke="#1e1a14"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <span>{t.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={styles.filterWrap} ref={hostRef}>
                  <button
                    type="button"
                    className={`${styles.filterBtn} ${hostOpen ? styles.filterBtnOpen : ""}`}
                    onClick={() => setHostOpen((v) => !v)}
                    aria-expanded={hostOpen}
                    aria-haspopup="true"
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle
                        cx="8"
                        cy="5.5"
                        r="2.8"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <path
                        d="M2.8 13.5C3.6 10.9 5.6 9.7 8 9.7C10.4 9.7 12.4 10.9 13.2 13.5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>
                      {selectedHost === "All" ? "All Hosts" : selectedHost}
                    </span>
                  </button>

                  {hostOpen && (
                    <div
                      className={styles.filterPopover}
                      role="menu"
                      aria-label="Host"
                      style={{ maxHeight: 320, overflowY: "auto" }}
                    >
                      {["All", ...allHosts].map((host) => {
                        const active = selectedHost === host;
                        return (
                          <button
                            key={host}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            className={`${styles.filterOption} ${active ? styles.filterOptionActive : ""}`}
                            onClick={() => {
                              setSelectedHost(host);
                              setHostOpen(false);
                            }}
                          >
                            <span
                              className={styles.filterOptionBox}
                              aria-hidden="true"
                            >
                              {active && (
                                <span className={styles.filterOptionDot} />
                              )}
                            </span>
                            <span>{host === "All" ? "All Hosts" : host}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={styles.filterWrap} ref={tzRef}>
                  <button
                    type="button"
                    className={`${styles.filterBtn} ${tzOpen ? styles.filterBtnOpen : ""}`}
                    onClick={() => setTzOpen((v) => !v)}
                    aria-expanded={tzOpen}
                    aria-haspopup="true"
                    aria-label="Change timezone"
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle
                        cx="8"
                        cy="8"
                        r="6.3"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M8 4.5V8L10.5 9.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{zoneAbbrev(tz)}</span>
                  </button>

                  {tzOpen && (
                    <div
                      className={styles.filterPopover}
                      role="menu"
                      aria-label="Timezone"
                    >
                      {tzOptions.map((option) => {
                        const active = tz === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            className={`${styles.filterOption} ${active ? styles.filterOptionActive : ""}`}
                            onClick={() => {
                              setTz(option.id);
                              setTzOpen(false);
                            }}
                          >
                            <span
                              className={styles.filterOptionBox}
                              aria-hidden="true"
                            >
                              {active && (
                                <span className={styles.filterOptionDot} />
                              )}
                            </span>
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div
                  className={styles.viewToggle}
                  role="group"
                  aria-label="Agenda view"
                >
                  <button
                    type="button"
                    className={`${styles.viewBtn} ${view === "tracks" ? styles.viewBtnActive : ""}`}
                    aria-pressed={view === "tracks"}
                    aria-label="Track columns view"
                    onClick={() => setView("tracks")}
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect
                        x="2"
                        y="2"
                        width="3"
                        height="12"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="6.5"
                        y="2"
                        width="3"
                        height="12"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="11"
                        y="2"
                        width="3"
                        height="12"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`}
                    aria-pressed={view === "grid"}
                    aria-label="Schedule grid view"
                    onClick={() => setView("grid")}
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect
                        x="2"
                        y="2"
                        width="5"
                        height="5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="9"
                        y="2"
                        width="5"
                        height="5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="2"
                        y="9"
                        width="5"
                        height="5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="9"
                        y="9"
                        width="5"
                        height="5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}
                    aria-pressed={view === "list"}
                    aria-label="List view"
                    onClick={() => setView("list")}
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M2 4H14M2 8H14M2 12H14"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {selectedHost !== "All" && (
                <div
                  className="flex flex-wrap items-center gap-2 mt-4"
                  aria-label="Active host filter"
                >
                  <span className="inline-flex items-center gap-2 border border-[#ffe3a6]/60 bg-[#ffe3a6]/10 text-[#ffe3a6] px-3 py-1.5 text-[11px] tracking-[0.08em] uppercase">
                    Host · {selectedHost}
                    <button
                      type="button"
                      aria-label={`Remove host filter ${selectedHost}`}
                      onClick={() => setSelectedHost("All")}
                      className="hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe3a6]"
                    >
                      <svg
                        viewBox="0 0 10 10"
                        fill="none"
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 1L9 9M9 1L1 9"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </span>
                </div>
              )}

              {selectedTracks.length > 0 && (
                <div
                  className="flex flex-wrap items-center gap-2 mt-4"
                  aria-label="Active track filters"
                >
                  {selectedTracks.map((id) => {
                    const t = TRACKS.find((x) => x.id === id);
                    if (!t) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-2 border px-3 py-1.5 text-[11px] tracking-[0.08em] uppercase"
                        style={{
                          color: t.accent,
                          borderColor: `${t.accent}88`,
                          background: `${t.accent}14`,
                        }}
                      >
                        {t.name}
                        <button
                          type="button"
                          aria-label={`Remove ${t.name} filter`}
                          onClick={() => toggleTrack(id)}
                          className="hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe3a6]"
                        >
                          <svg
                            viewBox="0 0 10 10"
                            fill="none"
                            className="w-2.5 h-2.5"
                            aria-hidden="true"
                          >
                            <path
                              d="M1 1L9 9M9 1L1 9"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </span>
                    );
                  })}
                  {selectedTracks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTracks([])}
                      className="text-[11px] tracking-[0.08em] uppercase text-[#fffef2]/60 underline underline-offset-4 hover:text-[#fffef2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe3a6]"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}

              <p className={styles.count}>
                SHOWING {filteredRows.length} SESSION
                {filteredRows.length === 1 ? "" : "S"}
              </p>

              <div className={styles.rowsDivider} aria-hidden="true" />

              {DAYS.map((d) => {
                const rows = filteredByDay[d.id] || [];
                return (
                  <div
                    key={d.id}
                    id={`agenda-panel-${d.id}`}
                    role="tabpanel"
                    aria-labelledby={`agenda-tab-${d.id}`}
                    hidden={d.id !== activeDay}
                  >
                    <h2 className="sr-only">
                      {d.label} agenda ({d.date})
                    </h2>
                    {rows.length === 0 ? (
                      <p className={styles.empty}>
                        No sessions match your search. Try clearing the
                        filters.
                      </p>
                    ) : (
                      <>
                        <div hidden={view !== "tracks"}>
                          {/* Full-bleed: escape the 1234px page container
                              so wide screens fit all stage columns. */}
                          <div className="mx-[calc(50%-50vw)] px-6 smtablet:px-3">
                            <TrackGrid
                              rows={rows}
                              allRows={agenda[d.id] || []}
                              sessions={sessions}
                              getSpeakers={resolveRowSpeakers}
                              dayId={d.id}
                              formatTime={(slot) => formatSlot(d.id, slot, tz)}
                              isLive={(slot) => isSlotLive(d.id, slot, now)}
                            />
                          </div>
                        </div>
                        <div hidden={view !== "grid"}>
                          <AgendaGrid
                            rows={rows}
                            sessions={sessions}
                            getSpeakers={resolveRowSpeakers}
                            dayId={d.id}
                            tz={tz}
                          />
                        </div>
                        <ul className={styles.rows} hidden={view !== "list"}>
                          {rows.map((row) => {
                            const session = row.session
                              ? sessions[row.session]
                              : null;
                            const rowSpeakers = resolveRowSpeakers(
                              row,
                              session,
                            );
                            return (
                              <AgendaRow
                                key={row.id}
                                row={row}
                                session={session}
                                speakers={rowSpeakers}
                                isOpen={openId === row.id}
                                onToggle={() => handleToggleRow(row.id)}
                                timeLabel={formatSlot(d.id, row.time, tz)}
                                live={isSlotLive(d.id, row.time, now)}
                              />
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <ConfRegister href="https://www.testmuai.com/testmuconf-2026/#register" />
        </div>
      </div>
    </>
  );
};

export default AgendaLanding;
