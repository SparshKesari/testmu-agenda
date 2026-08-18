/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Breakpoints carried over from the main lambdatest-website-next
      // tailwind config so copied conference components render identically.
      screens: {
        mdtablet: { min: "769px" },
        mddesktop: { min: "992px" },
        xl: { min: "1180px" },
        xm: { min: "1280px" },
        xxl: { min: "1500px" },
        xxxl: { min: "1600px" },
        _xxxl: { max: "1600px" },
        _xxl: { max: "1440px" },
        fromipad: { max: "1100px" },
        fromdesktop: { max: "1179px" },
        ipadpro: { max: "1024px" },
        desktop: { max: "992px" },
        fromtablet: { max: "768px" },
        smtablet: { max: "767px" },
        mobile: { max: "450px" },
      },
    },
  },
  plugins: [],
};
