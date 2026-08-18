/* Everything the UI personalizes hangs off the visitor's email address:
   the local part gives us a display name, the domain picks the persona. */

const FREE_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "gmx.com",
  "rediffmail.com",
]);

const INTERNAL_DOMAINS = new Set([
  "testmu.ai",
  "testmuai.com",
  "lambdatest.com",
]);

export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((value || "").trim());

const titleCase = (word) =>
  word ? word.charAt(0).toUpperCase() + word.slice(1) : "";

export function getPersona(email) {
  const clean = (email || "").trim().toLowerCase();
  const [localPart = "", domain = ""] = clean.split("@");

  const firstName = titleCase(localPart.split(/[._\-+0-9]+/).filter(Boolean)[0]);
  const company = titleCase(domain.split(".")[0]);

  if (INTERNAL_DOMAINS.has(domain)) {
    return {
      email: clean,
      firstName: firstName || "there",
      domain,
      id: "insider",
      badge: "TestMu Insider",
      tagline:
        "Backstage view: keynotes and panels are front and center for the crew running the show.",
      accent: "#c8a6ff",
      recommendedTypes: ["KEYNOTE", "PANEL"],
    };
  }

  if (FREE_PROVIDERS.has(domain)) {
    return {
      email: clean,
      firstName: firstName || "there",
      domain,
      id: "community",
      badge: "Community Explorer",
      tagline:
        "Hands-on picks: workshops, AMAs, and sessions you can follow along with live.",
      accent: "#ffd57a",
      recommendedTypes: ["WORKSHOP", "AMA", "FIRESIDE CHAT"],
    };
  }

  return {
    email: clean,
    firstName: firstName || "there",
    domain,
    id: "team",
    badge: `${company || "Team"} Crew`,
    tagline: `Curated for the ${company || domain} team: keynotes and deep-dive workshops to bring back to work.`,
    accent: "#a6ffb8",
    recommendedTypes: ["KEYNOTE", "WORKSHOP"],
  };
}

/* Flatten the agenda into the persona's "picked for you" strip: sessions
   whose type matches the persona, in schedule order across all days. */
export function pickSessions(agenda, persona, limit = 6) {
  const wanted = new Set(persona.recommendedTypes);
  const picks = [];
  ["day1", "day2", "day3"].forEach((dayId, i) => {
    (agenda[dayId] || []).forEach((row) => {
      if (wanted.has(row.type)) {
        picks.push({ ...row, dayId, dayLabel: `Day ${i + 1}` });
      }
    });
  });
  return picks.slice(0, limit);
}
