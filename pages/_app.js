import { useEffect, useState } from "react";
import Head from "next/head";

import "../styles/globals.css";
import { PersonaContext } from "../lib/PersonaContext";
import { getPersona } from "../lib/personalization";

const STORAGE_KEY = "tm26:email";

export default function App({ Component, pageProps }) {
  const [email, setEmail] = useState(null);
  /* localStorage is read after mount so the server and first client
     render agree; until then we paint the bare background. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEmail(window.localStorage.getItem(STORAGE_KEY));
    setReady(true);
  }, []);

  const saveEmail = (value) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setEmail(value);
  };

  const changeEmail = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setEmail(null);
  };

  const shell = (
    <Head>
      <title>Agenda — TestMu Conf 2026</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        name="description"
        content="Personalized agenda for TestMu Conference 2026 — 3 days, 80+ sessions on agentic engineering, AI-driven quality, and modern testing."
      />
    </Head>
  );

  if (!ready) {
    return (
      <>
        {shell}
        <div className="min-h-screen bg-[#1e1a14]" />
      </>
    );
  }

  /* No email gate: the agenda is open to everyone. A stored email (from
     an earlier visit) still personalizes; saveEmail stays available to
     any future opt-in UI. */
  return (
    <PersonaContext.Provider
      value={{ email, persona: getPersona(email), saveEmail, changeEmail }}
    >
      {shell}
      <Component {...pageProps} />
    </PersonaContext.Provider>
  );
}
