import React from "react";
import Image from "next/image";

import styles from "./index.module.css";
import { resourcesHost } from "../../environments/environment";

const DEFAULT_TEXT = (
  <p>
    Join the builders, testers, and innovators shaping the next generation of
    web experiences. <br />
    Testμ Conf 2026 is where they meet.
  </p>
);

const ConfRegister = ({ href = "#", children = DEFAULT_TEXT, onClick }) => {
  return (
    <div className={styles.registerNowBlock}>
      <div className={styles.registerNowTop}>
        <div className={styles.registerNowText}>{children}</div>

        <div
          className={`${styles.registerNowSideBox} smtablet:hidden`}
          aria-hidden="true"
        >
          <Image
            width={100}
            height={100}
            alt="TestMu Florals"
            className="size-full object-contain"
            src={`${resourcesHost}/images/testmuConf26/component/images/TestMuFloral.svg`}
          />
        </div>
      </div>

      <a href={href} onClick={onClick} className={styles.registerNowBtnWrap}>
        {/* Desktop: stacked SVGs that crossfade on hover. */}
        <div className={`${styles.registerSwap} grid smtablet:hidden`}>
          <img
            alt="Register Now"
            className={styles.registerSwapDefault}
            src={`${resourcesHost}/images/testmuConf26/main/images/RegisterNowBottomButton.svg`}
          />
          <img
            alt=""
            aria-hidden="true"
            className={styles.registerSwapHover}
            src={`${resourcesHost}/images/testmuConf26/main/images/RegisterNowBottomButton-Hover.svg`}
          />
        </div>

        {/* Mobile: hover is not meaningful on touch, keep the single image. */}
        <Image
          alt="Register Now"
          className={`hidden smtablet:block w-auto mx-auto`}
          width={100}
          height={100}
          src={`${resourcesHost}/images/testmuConf26/component/images/RegisterNowMobileBottomButton.svg`}
        />
      </a>
    </div>
  );
};

export default ConfRegister;
