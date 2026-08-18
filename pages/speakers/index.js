import { useState } from "react";
import Head from "next/head";

import styles from "../../styles/speakers.module.css";
import speakersData from "../../data/speakersData.json";
import sessionsData from "../../data/sessionsData.json";

import ConfRegister from "../../components/TestMuConf26/ConfRegister";
import AllSpeakerRow from "../../components/TestMuConf26/Speakers/AllSpeakerRow";
import KeynoteSpeakerCard from "../../components/TestMuConf26/Speakers/KeynoteSpeakerCard";
import StickyHeader from "../../components/TestMuConf26/StickyHeader";
import { usePersona } from "../../lib/PersonaContext";

const rowId = (slug) => `speaker-${slug}`;

const buildSessionLookup = () => {
  const lookup = {};
  Object.entries(sessionsData).forEach(([slug, session]) => {
    if (session.hidden) return;
    (session.speakers || []).forEach((speakerSlug) => {
      if (!lookup[speakerSlug]) lookup[speakerSlug] = [];
      lookup[speakerSlug].push({
        type: session.type,
        title: session.title,
        href: `https://www.testmuai.com/testmuconf-2026/${slug}/`,
      });
    });
  });
  return lookup;
};

export async function getStaticProps() {
  const speakers = Object.entries(speakersData)
    .filter(([, s]) => !s.hidden)
    .map(([slug, s]) => ({ slug, ...s }))
    .sort((a, b) =>
      `${a.first} ${a.last}`.localeCompare(`${b.first} ${b.last}`, "en", {
        sensitivity: "base",
      }),
    );
  const sessionBySpeaker = buildSessionLookup();
  return { props: { speakers, sessionBySpeaker } };
}

const SpeakersPage = ({ speakers, sessionBySpeaker }) => {
  const { persona } = usePersona();
  const keynoteSpeakers = speakers.filter((s) => s.isKeynote);
  const distinguishedSpeakers = speakers.filter((s) => s.isDistinguished);
  const [openSlug, setOpenSlug] = useState(null);

  const focusSpeaker = (slug) => {
    const prevSlug = openSlug;
    const targetEl = document.getElementById(rowId(slug));
    if (!targetEl) {
      setOpenSlug(slug);
      return;
    }

    const offset = 120;
    const targetCurrentTop =
      targetEl.getBoundingClientRect().top + window.pageYOffset;

    let collapseShift = 0;
    if (prevSlug && prevSlug !== slug) {
      const prevEl = document.getElementById(rowId(prevSlug));
      if (prevEl) {
        const prevTop = prevEl.getBoundingClientRect().top + window.pageYOffset;
        if (prevTop < targetCurrentTop) {
          const panel = prevEl.querySelector("[data-row-panel]");
          if (panel) collapseShift = panel.getBoundingClientRect().height;
        }
      }
    }

    setOpenSlug(slug);
    window.scrollTo({
      top: targetCurrentTop - collapseShift - offset,
      behavior: "smooth",
    });
  };

  const toggleSlug = (slug) =>
    setOpenSlug((prev) => (prev === slug ? null : slug));

  return (
    <>
      <Head>
        <title>{`Speakers for ${persona.firstName} — TestMu Conf 2026`}</title>
      </Head>

      <div className={styles.page}>
        <StickyHeader />

        <div className={styles.container}>
          <h1 className={styles.title}>Meet our speakers</h1>

          {keynoteSpeakers.length > 0 && (
            <section className={styles.keynoteBlock}>
              <h2 className={styles.sectionHeader}>Keynote Speakers</h2>
              <div className={styles.keynoteGrid}>
                {keynoteSpeakers.map((s) => (
                  <KeynoteSpeakerCard
                    key={s.slug}
                    speaker={s}
                    onClick={() => focusSpeaker(s.slug)}
                  />
                ))}
              </div>
            </section>
          )}

          {distinguishedSpeakers.length > 0 && (
            <section className={styles.keynoteBlock}>
              <h2 className={styles.sectionHeader}>Distinguished Speakers</h2>
              <div className={styles.keynoteGrid}>
                {distinguishedSpeakers.map((s) => (
                  <KeynoteSpeakerCard
                    key={s.slug}
                    speaker={s}
                    onClick={() => focusSpeaker(s.slug)}
                  />
                ))}
              </div>
            </section>
          )}

          <section className={styles.allBlock}>
            <h2 className={styles.sectionHeader}>All Speakers</h2>
            <div className={styles.allList}>
              {speakers.map((s) => (
                <AllSpeakerRow
                  key={s.slug}
                  id={rowId(s.slug)}
                  speaker={s}
                  sessions={sessionBySpeaker[s.slug]}
                  open={openSlug === s.slug}
                  onToggle={() => toggleSlug(s.slug)}
                  profileHref={`/speakers/${s.slug}/`}
                />
              ))}
            </div>
          </section>

          <ConfRegister href="https://www.testmuai.com/testmuconf-2026/#register" />
        </div>
      </div>
    </>
  );
};

export default SpeakersPage;
