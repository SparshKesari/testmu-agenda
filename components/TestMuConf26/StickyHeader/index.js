import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "./index.module.css";
import { resourcesHost } from "../../../environments/environment";

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "SPEAKERS", href: "/speakers/" },
  { label: "AGENDA", href: "/" },
  { label: "PARTICIPATE & WIN", href: "https://www.testmuai.com/testmuconf-2026/participate-and-win/" },
];

const MOBILE_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Speakers", href: "/speakers/" },
  { label: "Agenda", href: "/" },
  { label: "Participate & Win", href: "https://www.testmuai.com/testmuconf-2026/participate-and-win/" },
];

const MARQUEE_ITEMS = ["Ship Faster. Test Smarter", "Join Now"];

const HamburgerIcon = () => (
  <svg
    width="20"
    height="14"
    viewBox="0 0 20 14"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 7H19M1 1H19M1 13H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1L13 13M13 1L1 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarSpark = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 31 31"
    className={styles.marqueeStar}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.5 0L16.1525 13.9248L26.4601 4.53988L17.0752 14.8475L31 15.5L17.0752 16.1525L26.4601 26.4601L16.1525 17.0752L15.5 31L14.8475 17.0752L4.53985 26.4601L13.9248 16.1525L0 15.5L13.9248 14.8475L4.53985 4.53988L14.8475 13.9248L15.5 0Z"
      fill="#FF7B5E"
    />
  </svg>
);

/* `revealOnScroll` = true renders the bar hidden above the viewport and
   slides it in once the user has scrolled past REVEAL_AT — used on the
   main + LP pages where the site's own hero header owns the top of the
   page. Default (false) keeps the speakers/session behaviour: the bar
   sits inline below the site header and simply pins on scroll. */
const REVEAL_AT_PX = 100;

const StickyHeader = ({ revealOnScroll = false, mainClassName = "", innerClassName = "" }) => {
  const sentinelRef = useRef(null);
  const [isStuck, setIsStuck] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* Default (sticky-inline) mode: sentinel + IntersectionObserver drives the
     marquee↔CTA swap once the bar pins. */
  useEffect(() => {
    if (revealOnScroll) return undefined;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [revealOnScroll]);

  /* Reveal-on-scroll mode: a passive scroll listener flips `isStuck` once
     the user is past REVEAL_AT_PX. That single flag drives both the slide-
     in animation AND the marquee→CTA swap that already lived on isStuck. */
  useEffect(() => {
    if (!revealOnScroll) return undefined;
    const onScroll = () => setIsStuck(window.scrollY > REVEAL_AT_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealOnScroll]);

  /* ESC key closes the mobile drawer — matches typical overlay UX. */
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <div
        className={`${styles.header} ${mainClassName} ${
          revealOnScroll ? styles.headerReveal : ""
        } ${revealOnScroll && isStuck ? styles.headerRevealed : ""}`}
      >
        <div className={`${styles.inner} ${innerClassName}`}>
          <Link
            href="/"
            className={styles.logoLink}
            aria-label="TestMu Conf 2026 — Home"
          >
            <img
              alt="TestMu Conf 2026"
              className={styles.logo}
              src={`${resourcesHost}/images/testmuConf26/logos/HeaderLogo.svg`}
            />
          </Link>

          <div className={styles.rightSlot}>
            <div
              className={`${styles.marqueeStrip} ${
                isStuck ? styles.slotHidden : styles.slotVisible
              }`}
              aria-hidden={isStuck ? "true" : "false"}
            >
              {/* Track is duplicated so the -50% loop appears seamless. */}
              <div className={styles.marqueeTrack}>
                {[0, 1].map((copy) => (
                  <div key={copy} className={styles.marqueeGroup}>
                    {MARQUEE_ITEMS.map((item, i) => (
                      <span key={`${copy}-${i}`} className={styles.marqueeSet}>
                        <span className={styles.marqueeText}>{item}</span>
                        <StarSpark />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="https://www.testmuai.com/testmuconf-2026/#register"
              className={`${styles.registerCta} ${
                isStuck ? styles.slotVisible : styles.slotHidden
              }`}
              aria-hidden={isStuck ? "false" : "true"}
              tabIndex={isStuck ? 0 : -1}
              aria-label="Register Now"
            >
              <span className={styles.registerCtaImgWrap}>
                <img
                  alt="Register Now"
                  className={`${styles.registerCtaImg} ${styles.registerCtaDefault}`}
                  src={`${resourcesHost}/images/testmuConf26/main/images/HeroRegisterButton.svg`}
                />
                <img
                  alt=""
                  aria-hidden="true"
                  className={`${styles.registerCtaImg} ${styles.registerCtaHover}`}
                  src={`${resourcesHost}/images/testmuConf26/main/images/HeroRegisterButton-Hover.svg`}
                />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================
          Mobile-only floating CTA — fixed to the bottom of the viewport.
          The hamburger in the top header and the circular button here
          both toggle the same `isMenuOpen`; open state expands this pill
          upward with the nav list stacked above the button row.
         ================================================================ */}
      <div
        id="testmuconf-mobile-menu"
        className={`${styles.mobileCta} ${isMenuOpen ? styles.mobileCtaOpen : ""}`}
      >
        <div className={styles.mobileCtaRow}>
          <Link
            href="https://www.testmuai.com/testmuconf-2026/#register"
            className={styles.mobileRegisterBtn}
            onClick={closeMenu}
          >
            REGISTER NOW
          </Link>
        </div>
      </div>
    </>
  );
};

export default StickyHeader;
