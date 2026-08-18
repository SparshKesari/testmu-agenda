import Head from "next/head";
import Link from "next/link";

import speakersData from "../../data/speakersData.json";
import sessionsData from "../../data/sessionsData.json";
import StickyHeader from "../../components/TestMuConf26/StickyHeader";
import ConfRegister from "../../components/TestMuConf26/ConfRegister";
import SessionPill from "../../components/TestMuConf26/Speakers/SessionPill";
import { usePersona } from "../../lib/PersonaContext";

const RESOURCES = "https://assets.testmuai.com/resources/images/testmuConf26";

export async function getStaticPaths() {
  return {
    paths: Object.entries(speakersData)
      .filter(([, s]) => !s.hidden)
      .map(([slug]) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const speaker = speakersData[params.slug];
  const sessions = Object.entries(sessionsData)
    .filter(
      ([, s]) => !s.hidden && (s.speakers || []).includes(params.slug),
    )
    .map(([slug, s]) => ({
      slug,
      type: s.type,
      title: s.title,
      time: s.time || "",
      duration: s.duration || "",
    }));
  return { props: { slug: params.slug, speaker, sessions } };
}

const SpeakerPage = ({ slug, speaker, sessions }) => {
  const { persona } = usePersona();
  const fullName = `${speaker.first} ${speaker.last}`.trim();
  const highlighted =
    sessions.length > 0 &&
    sessions.some((s) => persona.recommendedTypes.includes(s.type));

  return (
    <>
      <Head>
        <title>{`${fullName} — TestMu Conf 2026`}</title>
      </Head>

      <div className="bg-[#1e1a14] min-h-screen">
        <StickyHeader />

        <main className="max-w-[900px] mx-auto px-6 py-14 smtablet:px-4 smtablet:py-8">
          <Link
            href="/speakers/"
            className="text-[11px] tracking-[0.18em] uppercase text-[#fffef2]/50 hover:text-[#ffe3a6]"
          >
            ← All speakers
          </Link>

          <div className="mt-8 flex gap-10 items-start fromtablet:flex-col fromtablet:gap-6">
            <div className="relative w-[260px] shrink-0 smtablet:w-full smtablet:max-w-[300px]">
              {speaker.img && (
                <img
                  src={`${RESOURCES}/${speaker.img}`}
                  alt={fullName}
                  className="w-full grayscale"
                  style={{ background: speaker.tint || "#ffd3a6" }}
                />
              )}
            </div>

            <div className="min-w-0">
              {speaker.isKeynote && (
                <p className="text-[11px] tracking-[0.28em] uppercase text-[#c8a6ff] mb-3">
                  Keynote Speaker
                </p>
              )}
              <h1 className="[font-family:'Space_Grotesk',sans-serif] text-[40px] font-bold leading-[1.1] smtablet:text-[30px]">
                {fullName}
              </h1>
              <p className="text-[14px] text-[#ffe3a6] mt-2">
                {speaker.role}
                {speaker.company ? ` · ${speaker.company}` : ""}
              </p>

              {highlighted && (
                <p
                  className="inline-block text-[11px] tracking-[0.14em] uppercase border px-3 py-1.5 mt-4"
                  style={{
                    color: persona.accent,
                    borderColor: persona.accent,
                  }}
                >
                  ★ Picked for you, {persona.firstName}
                </p>
              )}

              {speaker.bio && (
                <p className="text-[14px] leading-[1.75] text-[#fffef2]/70 mt-6">
                  {speaker.bio}
                </p>
              )}

              <div className="flex gap-4 mt-6">
                {speaker.linkedin && (
                  <a
                    href={speaker.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] tracking-[0.1em] uppercase underline underline-offset-4 text-[#fffef2]/60 hover:text-[#ffe3a6]"
                  >
                    LinkedIn
                  </a>
                )}
                {speaker.twitter && (
                  <a
                    href={speaker.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] tracking-[0.1em] uppercase underline underline-offset-4 text-[#fffef2]/60 hover:text-[#ffe3a6]"
                  >
                    X / Twitter
                  </a>
                )}
              </div>
            </div>
          </div>

          {sessions.length > 0 && (
            <section className="mt-14">
              <h2 className="text-[12px] tracking-[0.24em] uppercase text-[#fffef2]/50 mb-4">
                {speaker.first}&rsquo;s session{sessions.length === 1 ? "" : "s"}
              </h2>
              <div className="grid grid-cols-2 gap-3 fromtablet:grid-cols-1">
                {sessions.map((s) => (
                  <SessionPill
                    key={s.slug}
                    variant="card"
                    type={s.type}
                    title={s.title}
                    time={s.time !== "TBD" ? s.time : ""}
                    duration={s.duration}
                    href={`https://www.testmuai.com/testmuconf-2026/${s.slug}/`}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="mt-14">
            <ConfRegister href="https://www.testmuai.com/testmuconf-2026/#register" />
          </div>
        </main>
      </div>
    </>
  );
};

export default SpeakerPage;
