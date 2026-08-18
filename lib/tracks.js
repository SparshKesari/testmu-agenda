/* Track split from the conference planning spreadsheet: seven parallel
   tracks, each with the blurb used as the column subtitle. */
export const TRACKS = [
  { id: "trust", name: "Trust Track", blurb: "Evals, assurance & validation", accent: "#c8a6ff" },
  { id: "quality", name: "Quality Track", blurb: "Testing practice & automation", accent: "#a6ffb8" },
  { id: "build", name: "Build Track", blurb: "Engineering & AI-native products", accent: "#ffd57a" },
  { id: "agentic", name: "Agentic Track", blurb: "Designing & running agents", accent: "#ff9c8f" },
  { id: "scale", name: "Scale Track", blurb: "Org, adoption & leadership", accent: "#a6f9ff" },
  { id: "ship", name: "Ship Track", blurb: "Production, delivery & reliability", accent: "#ffc6e0" },
  { id: "workshop", name: "Workshop Stage", blurb: "Hands-on sessions", accent: "#f2ffa6" },
];

export const trackById = (id) => TRACKS.find((t) => t.id === id) || null;
