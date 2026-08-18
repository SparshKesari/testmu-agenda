import Image from "next/image";
import { useState } from "react";

import styles from "./index.module.css";
import SessionPill from "../SessionPill";
import { resourcesHost } from "../../../../environments/environment";

const DEFAULT_TINT = "#ffd3a6";

const resolveAsset = (path) =>
  path ? `${resourcesHost}/images/testmuConf26/${path}` : "";

const AllSpeakerRow = ({
  id,
  speaker,
  session,
  sessions,
  open,
  onToggle,
  profileHref,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = onToggle !== undefined;
  const expanded = isControlled ? Boolean(open) : uncontrolledOpen;
  const toggle = isControlled ? onToggle : () => setUncontrolledOpen((v) => !v);
  /* Speakers can have several sessions (e.g. a talk + a workshop) — accept
     either the legacy single `session` or a `sessions` array. */
  const sessionList = sessions || (session ? [session] : []);

  const fullName = `${speaker.first} ${speaker.last}`.trim();
  const tileSrc = resolveAsset(speaker.img);
  const logoSrc = resolveAsset(speaker.companyLogo);

  return (
    <div id={id} className={`${styles.row} ${expanded ? styles.rowOpen : ""}`}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        onClick={toggle}
      >
        <div className={styles.tile}>
          {tileSrc && <img src={tileSrc} alt="" className={styles.tileImg} />}
          <div
            className={styles.tileTint}
            style={{ background: speaker.tint || DEFAULT_TINT }}
            aria-hidden="true"
          />
        </div>
        <div className={styles.text}>
          <h3 className={styles.name} aria-label={fullName}>
            <span className={styles.nameFirst}>{speaker.first}</span>{" "}
            <span className={styles.nameLast}>{speaker.last}</span>
          </h3>
          {speaker.role && (
            <p className={styles.role}>
              {speaker.role}
              {speaker.company && (
                <>
                  <span className={styles.roleCompanyComma}>,</span>
                  <span className={styles.roleCompany}>{speaker.company}</span>
                </>
              )}
            </p>
          )}
          <div className={styles.company}>
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={speaker.company || ""}
                className={`${styles.companyLogo} ${speaker.companyLogoWidth}`}
              />
            ) : (
              <span className={styles.companyName}>{speaker.company}</span>
            )}
          </div>
        </div>
        <span
          className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        >
          <Image
            width={100}
            height={100}
            alt="Chevron"
            className={styles.chevronIcon}
            src={`${resourcesHost}/images/testmuConf26/component/icons/ChevronIcon.svg`}
          />
        </span>
      </button>

      <div
        data-row-panel
        className={`${styles.expanded} ${expanded ? styles.expandedOpen : ""}`}
      >
        <div className={styles.expandedInner}>
          <div className={styles.expandedBody}>
            {sessionList.length > 0 && (
              <div className={styles.sessionWrap}>
                {sessionList.map((sess) => (
                  <SessionPill
                    key={sess.href || sess.title}
                    type={sess.type}
                    title={sess.title}
                    href={sess.href}
                    cta="View Session"
                  />
                ))}
              </div>
            )}
            {profileHref && (
              <a
                href={profileHref}
                className="inline-block font-mono text-[12px] tracking-[0.08em] uppercase text-[#ffe3a6] underline underline-offset-4 hover:text-white"
              >
                View full profile →
              </a>
            )}
            {(speaker.bio || speaker.linkedin || speaker.twitter) && (
              <div className={styles.bioRow}>
                {speaker.bio && <p className={styles.bio}>{speaker.bio}</p>}
                {(speaker.linkedin || speaker.twitter) && (
                  <div className={styles.socials}>
                    {speaker.linkedin && (
                      <a
                        href={speaker.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${fullName} on LinkedIn`}
                        className={styles.socialLink}
                      >
                        <Image
                          width={100}
                          height={100}
                          alt="LinkedIn"
                          className={styles.socialIcon}
                          src={`${resourcesHost}/images/Linkedin.svg`}
                        />
                      </a>
                    )}
                    {speaker.twitter && (
                      <a
                        href={speaker.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${fullName} on X`}
                        className={styles.socialLink}
                      >
                        <Image
                          width={100}
                          height={100}
                          alt="X"
                          className={styles.socialIcon}
                          src={`${resourcesHost}/images/lambdaTestReview/X-white.svg`}
                        />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllSpeakerRow;
