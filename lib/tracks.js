/* Track split from the conference planning spreadsheet: seven parallel
   tracks, each with the blurb used as the column subtitle and the
   stage manager shown above the track name. */
export const TRACKS = [
  { id: "trust", name: "Trust Track", blurb: "Evals, assurance & validation", accent: "#c8a6ff", manager: "@Swapnil" },
  { id: "quality", name: "Quality Track", blurb: "Testing practice & automation", accent: "#a6ffb8", manager: "@Pulkit Saxena" },
  { id: "build", name: "Build Track", blurb: "Engineering & AI-native products", accent: "#ffd57a", manager: "@Bhawana" },
  { id: "agentic", name: "Agentic Track", blurb: "Designing & running agents", accent: "#ff9c8f", manager: "@Nikhil Saxena" },
  { id: "scale", name: "Scale Track", blurb: "Org, adoption & leadership", accent: "#a6f9ff", manager: "@Mehul Gadhiya" },
  { id: "ship", name: "Ship Track", blurb: "Production, delivery & reliability", accent: "#ffc6e0", manager: "@Devansh" },
  { id: "workshop", name: "Developer Track", blurb: "Hands-on sessions", accent: "#f2ffa6", manager: "@Prince Dewani" },
  { id: "engineer", name: "Engineer Track", blurb: "Engineering deep dives", accent: "#a6c8ff", manager: "@Vishal Kumar Sahu" },
];

export const trackById = (id) => TRACKS.find((t) => t.id === id) || null;
