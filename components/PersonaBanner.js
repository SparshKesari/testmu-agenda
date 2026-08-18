import SessionPill from "./TestMuConf26/Speakers/SessionPill";
import { usePersona } from "../lib/PersonaContext";
import { pickSessions } from "../lib/personalization";

/* Greeting + "picked for you" strip rendered from the visitor's email
   persona. Sits between the sticky header and the agenda proper. */
const PersonaBanner = ({ agenda, sessions }) => {
  const { email, persona, changeEmail } = usePersona();
  const picks = pickSessions(agenda, persona);

  return (
    <section
      aria-label="Personalized for you"
      className="max-w-[1180px] mx-auto px-6 pt-10 smtablet:px-4 smtablet:pt-6"
    >
      <div
        className="border bg-[#26211a] px-7 py-6 smtablet:px-4"
        style={{ borderColor: `${persona.accent}55` }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] tracking-[0.24em] uppercase text-[#fffef2]/45 mb-2">
              Signed in as {email}
            </p>
            <h2 className="[font-family:'Space_Grotesk',sans-serif] text-[26px] font-bold leading-tight smtablet:text-[21px]">
              Welcome, {persona.firstName}{" "}
              <span
                className="align-middle inline-block text-[10px] tracking-[0.16em] uppercase font-normal px-2.5 py-1 ml-2 border"
                style={{ color: persona.accent, borderColor: persona.accent }}
              >
                {persona.badge}
              </span>
            </h2>
            <p className="text-[13px] text-[#fffef2]/60 mt-2 max-w-[640px]">
              {persona.tagline}
            </p>
          </div>
          <button
            type="button"
            onClick={changeEmail}
            className="text-[11px] tracking-[0.14em] uppercase text-[#fffef2]/50 border border-[#fffef2]/20 px-3 py-2 hover:text-[#fffef2] hover:border-[#fffef2]/50 transition-colors"
          >
            Not you? Change email
          </button>
        </div>

        {picks.length > 0 && (
          <div className="mt-6">
            <p
              className="text-[11px] tracking-[0.24em] uppercase mb-3"
              style={{ color: persona.accent }}
            >
              Picked for you
            </p>
            <div className="grid grid-cols-3 gap-3 ipadpro:grid-cols-2 smtablet:grid-cols-1">
              {picks.map((row) => (
                <SessionPill
                  key={row.id}
                  variant="card"
                  type={row.type}
                  title={row.title}
                  time={`${row.dayLabel} · ${row.time}`}
                  duration={row.duration}
                  href={
                    row.session && sessions[row.session] && !sessions[row.session].hidden
                      ? `https://www.testmuai.com/testmuconf-2026/${row.session}/`
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PersonaBanner;
