import styles from "./index.module.css";
import { resourcesHost } from "../../../../environments/environment";

const DEFAULT_TINT = "#ffd3a6";

const resolveAsset = (path) =>
  path ? `${resourcesHost}/images/testmuConf26/${path}` : "";

const KeynoteSpeakerCard = ({ speaker, onClick }) => {
  const fullName = `${speaker.first} ${speaker.last}`.trim();
  const logoSrc = resolveAsset(speaker.companyLogo);
  const imgSrc = resolveAsset(speaker.img);
  const role = speaker.role
    ? speaker.role.endsWith(",")
      ? speaker.role
      : `${speaker.role},`
    : "";

  const Container = onClick ? "button" : "article";
  const containerProps = onClick ? { type: "button", onClick } : {};

  return (
    <Container className={styles.card} {...containerProps}>
      <div className={styles.imageBox}>
        {imgSrc && (
          <img src={imgSrc} alt={fullName} className={styles.imageBg} />
        )}
        <div
          className={styles.imageTint}
          style={{ background: speaker.tint || DEFAULT_TINT }}
          aria-hidden="true"
        />
      </div>
      <div className={styles.textBlock}>
        <div className={styles.nameWrap}>
          {/* Two-line stair step: first name flush left, last name indented. */}
          <h3 className={styles.name} aria-label={fullName}>
            <span className={styles.nameLine} aria-hidden="true">
              {speaker.first}
            </span>
            <span
              className={`${styles.nameLine} ${styles.nameLast}`}
              aria-hidden="true"
            >
              {speaker.last}
            </span>
          </h3>
          {role && <p className={styles.role}>{role}</p>}
        </div>
        <div className={styles.company}>
          {logoSrc ? (
            /* Some logo SVGs draw their artwork small inside the shared 48px
               canvas; cardLogoHeight scales those up to keynote size. The
               negative margins collapse the scaled-up transparent padding so
               the logo still occupies the standard 48px slot and card heights
               stay equal. */
            <img
              src={logoSrc}
              alt={speaker.company || ""}
              className={styles.companyLogo}
              style={
                speaker.cardLogoHeight
                  ? {
                      height: speaker.cardLogoHeight,
                      margin: `${(48 - speaker.cardLogoHeight) / 2}px 0`,
                    }
                  : undefined
              }
            />
          ) : (
            <span className={styles.companyName}>{speaker.company}</span>
          )}
        </div>
      </div>
    </Container>
  );
};

export default KeynoteSpeakerCard;
