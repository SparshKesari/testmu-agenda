import { useRef, useEffect, useState } from "react";

import styles from "./AgendaRow.module.css";
import { resourcesHost } from "../../../environments/environment";

export const TYPE_FILL = {
  KEYNOTE: "#c8a6ff",
  SESSION: "#a6ffb8",
  WORKSHOP: "#ffd57a",
  PANEL: "#ff9c8f",
};

const AVATAR_TINTS = ["#ffd3a6", "#c8a6ff", "#a6f9ff", "#f3ffa6", "#a6ffb8"];

const asset = (path) =>
  path ? `${resourcesHost}/images/testmuConf26/${path}` : "";

export const TypeIcon = ({ type }) => {
  const fill = TYPE_FILL[type] || "rgba(255, 255, 227, 0.4)";
  return (
    <svg
      className={styles.typeIcon}
      viewBox="0 0 13 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 1.5L11.5 1.5L9.5 10.5L0.5 10.5L2.5 1.5Z"
        fill={fill}
        stroke={fill}
        strokeWidth="0.6"
      />
    </svg>
  );
};

const SpeakerAvatar = ({ speaker, tint, stackIndex, small }) => {
  const bg = speaker.tint || tint;
  return (
    <span
      className={`${styles.avatar} ${small ? styles.avatarSmall : ""}`}
      style={{ zIndex: 10 - stackIndex, marginLeft: stackIndex === 0 ? 0 : -12 }}
    >
      {speaker.img ? (
        <img
          src={asset(speaker.img)}
          alt={`${speaker.first} ${speaker.last}`}
          className={styles.avatarImg}
        />
      ) : null}
      <span
        className={styles.avatarTint}
        style={{ backgroundColor: bg }}
        aria-hidden="true"
      />
    </span>
  );
};

export const AvatarStack = ({ speakers, small = false }) => {
  if (!speakers.length) return null;
  const visible = speakers.slice(0, 2);
  const extra = speakers.length - visible.length;
  return (
    <div className={styles.avatarStack} aria-hidden="true">
      {visible.map((s, i) => (
        <SpeakerAvatar
          key={s.slug}
          speaker={s}
          tint={AVATAR_TINTS[i % AVATAR_TINTS.length]}
          stackIndex={i}
          small={small}
        />
      ))}
      {extra > 0 && (
        <span
          className={`${styles.avatarMore} ${small ? styles.avatarMoreSmall : ""}`}
          style={{ marginLeft: -12, zIndex: 1 }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
};

const AgendaRow = ({
  row,
  session,
  speakers,
  isOpen,
  onToggle,
  timeLabel,
  live,
}) => {
  const fullAbstract = session?.abstract || row.abstract || null;
  const abstract = fullAbstract ? fullAbstract.slice(0, 2) : null;
  const sessionSlug = row.session || null;
  const canExpand = Boolean(abstract);

  const panelRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    if (!panelRef.current) return;
    setPanelHeight(isOpen ? panelRef.current.scrollHeight : 0);
  }, [isOpen, abstract]);

  const handleClick = () => {
    if (canExpand) onToggle();
  };

  return (
    <li
      className={`${styles.row} ${isOpen ? styles.rowOpen : ""}`}
      data-row-id={row.id}
    >
      <div
        className={`${styles.rowHeader} ${canExpand ? styles.rowHeaderClickable : ""}`}
        onClick={handleClick}
      >
        <div className={styles.rowMain}>
          <div className={styles.timeCol}>
            <p className={styles.timeText}>{timeLabel || row.time}</p>
            <p className={styles.durationText}>{row.duration}</p>
          </div>
          <p className={styles.rowTitle}>{row.title}</p>
          {row.type && (
            <span className={styles.typePill}>
              <TypeIcon type={row.type} />
              {row.type}
            </span>
          )}
          {live && (
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} aria-hidden="true" />
              LIVE
            </span>
          )}
          {row.hosts?.length > 0 && (
            <span className={styles.hostTag}>
              HOST · {row.hosts.join(" / ")}
            </span>
          )}
          {row.recorded && (
            <span className={styles.hostTag}>◉ RECORDED</span>
          )}
        </div>

        {!isOpen && <AvatarStack speakers={speakers} />}

        {/* Toggle happens on the whole row header; the button stays for
            keyboard focus and its click bubbles up to the header. */}
        <button
          type="button"
          className={`${styles.chevronBtn} ${!canExpand ? styles.chevronBtnDisabled : ""}`}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Collapse session" : "Expand session"}
          disabled={!canExpand}
        >
            <svg
              className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
      </div>

      {canExpand && (
        <div
          className={styles.panelWrap}
          style={{ maxHeight: panelHeight }}
          aria-hidden={!isOpen}
        >
          <div ref={panelRef} className={styles.panel}>
            <div className={styles.panelLeft}>
              {abstract && (
                <div className={styles.abstract}>
                  {abstract.map((para, i) => (
                    <p key={i} className={styles.abstractPara}>
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {sessionSlug && (
                <a
                  href={`https://www.testmuai.com/testmuconf-2026/${sessionSlug}/`}
                  className={styles.viewFullLink}
                >
                  <span>VIEW FULL SESSION</span>
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </div>

            {speakers.length > 0 && (
              <div className={styles.speakerCards}>
                {speakers.map((s) => (
                  <div key={s.slug} className={styles.speakerCard}>
                    <div className={styles.speakerPhoto}>
                      {s.img && (
                        <img
                          src={asset(s.img)}
                          alt={`${s.first} ${s.last}`}
                          className={styles.speakerPhotoImg}
                        />
                      )}
                      <span
                        className={styles.speakerPhotoTint}
                        style={{ backgroundColor: s.tint || AVATAR_TINTS[0] }}
                        aria-hidden="true"
                      />
                    </div>
                    <div className={styles.speakerText}>
                      <p className={styles.speakerName}>
                        {s.first} {s.last}
                      </p>
                      <p className={styles.speakerRole}>
                        {s.role}
                        {s.company ? `, ${s.company}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
};

export default AgendaRow;
