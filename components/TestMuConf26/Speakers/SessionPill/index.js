import Link from "next/link";

import styles from "./index.module.css";

const TYPE_FILL = {
  KEYNOTE: "#c8a6ff",
  SESSION: "#a6ffb8",
  WORKSHOP: "#ffd57a",
  PANEL: "#ff9c8f",
};

const TypeIcon = ({ type }) => {
  const fill = TYPE_FILL[type] || "rgba(255, 255, 227, 0.18)";
  return (
    <svg
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={styles.typeIcon}
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

const SessionPill = ({ type, title, href, time, duration, variant, cta }) => {
  const isCard = variant === "card";
  const Body = (
    <>
      <span className={styles.typeBadge}>
        <TypeIcon type={type} />
        {type}
      </span>
      <p className={styles.title}>{title}</p>
      {isCard && time && (
        <div className={styles.meta}>
          <span className={styles.metaTime}>{time}</span>
          {duration && (
            <>
              <span className={styles.metaDot} aria-hidden="true" />
              <span className={styles.metaDuration}>{duration}</span>
            </>
          )}
        </div>
      )}
    </>
  );

  const className = isCard ? styles.pillCard : styles.pill;
  const content = isCard ? (
    Body
  ) : (
    <>
      <span className={styles.inner}>{Body}</span>
      {cta && (
        <span className={styles.cta}>
          {cta}
          <span aria-hidden="true">→</span>
        </span>
      )}
    </>
  );

  if (!href) {
    return <div className={className}>{content}</div>;
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
};

export default SessionPill;
