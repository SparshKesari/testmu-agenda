import { useState } from "react";

import { isValidEmail } from "../lib/personalization";

/* Full-screen gate shown before any page renders. The email it captures
   drives every personalization decision afterwards. */
const EmailGate = ({ onSubmit }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = value.trim();
    if (!isValidEmail(email)) {
      setError("That doesn't look like an email address — try again.");
      return;
    }
    onSubmit(email.toLowerCase());
  };

  return (
    <main className="min-h-screen bg-[#1e1a14] flex items-center justify-center px-6">
      <div className="w-full max-w-[520px] border border-[#fffef2]/15 bg-[#26211a] px-8 py-10 smtablet:px-5 smtablet:py-8">
        <p className="text-[11px] tracking-[0.28em] uppercase text-[#ffe3a6] mb-4">
          TestMu Conference 2026
        </p>
        <h1 className="[font-family:'Space_Grotesk',sans-serif] text-[34px] leading-[1.15] font-bold mb-3 smtablet:text-[26px]">
          Your agenda,
          <br />
          <span className="[font-family:'Fraunces',serif] italic font-normal text-[#ffe3a6]">
            tuned to you.
          </span>
        </h1>
        <p className="text-[13px] leading-relaxed text-[#fffef2]/60 mb-8">
          Drop your email and we&rsquo;ll arrange the three days of TestMu
          Conf 2026 around what matters most to you — Aug 19&ndash;21, live
          and free.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="gate-email"
            className="block text-[11px] tracking-[0.18em] uppercase text-[#fffef2]/50 mb-2"
          >
            Email address
          </label>
          <input
            id="gate-email"
            type="email"
            autoFocus
            autoComplete="email"
            placeholder="you@company.com"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError("");
            }}
            className="w-full bg-[#1e1a14] border border-[#fffef2]/25 focus:border-[#ffe3a6] outline-none px-4 py-3 text-[15px] text-[#fffef2] placeholder:text-[#fffef2]/30 mb-2"
          />
          {error && (
            <p role="alert" className="text-[12px] text-[#ff9c8f] mb-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full mt-4 bg-[#ffe3a6] text-[#1e1a14] font-bold tracking-[0.12em] uppercase text-[13px] py-3.5 hover:bg-[#fff0c9] transition-colors"
          >
            Enter the conference →
          </button>
        </form>

        <p className="text-[11px] text-[#fffef2]/35 mt-6">
          Stored only in this browser — used to personalize your agenda,
          never sent anywhere.
        </p>
      </div>
    </main>
  );
};

export default EmailGate;
